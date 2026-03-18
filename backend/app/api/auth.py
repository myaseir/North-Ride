import asyncio
import random
import cloudinary.uploader
import cloudinary
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, status
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, EmailStr
from upstash_redis.asyncio import Redis 

from app.core import security
from app.core.config import settings
from app.repositories.user_repo import UserRepository
from app.core.email import send_otp_email

# --- CONFIGURATION ---
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

router = APIRouter()

redis_client = Redis(
    url=settings.UPSTASH_REDIS_REST_URL, 
    token=settings.UPSTASH_REDIS_REST_TOKEN
)

# --- SCHEMAS ---
class LoginRequest(BaseModel):
    email: str
    password: str

class RequestOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

# --- HELPER: Cloudinary Async Wrapper ---
async def upload_asset_async(file_obj, folder: str):
    """Wraps sync Cloudinary upload in a threadpool."""
    await run_in_threadpool(file_obj.seek, 0)
    result = await run_in_threadpool(
        cloudinary.uploader.upload, 
        file_obj, 
        folder=folder
    )
    return result["secure_url"]

# --- ENDPOINTS ---

@router.post("/login")
async def login(request: LoginRequest):
    repo = UserRepository()
    
    # 1. Fetch User
    try:
        user = await repo.get_by_email(request.email)
    except Exception as e:
        raise HTTPException(status_code=503, detail="Database currently unavailable.")

    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    # 2. Verify Password
    stored_hash = user.get("password_hash")
    if not stored_hash:
        raise HTTPException(status_code=401, detail="Account error. Please reset your password.")

    is_valid = await run_in_threadpool(
        security.verify_password, 
        request.password, 
        stored_hash
    )
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Incorrect password.")

    # 3. Generate JWT
    token_payload = {
        "sub": str(user["_id"]),
        "roles": user.get("roles", ["PASSENGER"])
    }
    access_token = security.create_access_token(data=token_payload)

    # 4. Return user data (Frontend uses data.user.roles for gatekeeping)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "roles": user.get("roles", ["PASSENGER"]),
            "is_approved": user.get("is_approved", False),
            "is_email_verified": user.get("is_email_verified", False),
            "username": user.get("username", "User")
        }
    }

@router.post("/request-otp")
async def request_otp(request: RequestOTPRequest):
    repo = UserRepository()
    
    # Check if user already exists
    existing_user = await repo.get_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="This email is already registered.")

    otp_code = str(random.randint(100000, 999999))
    
    success = await send_otp_email(request.email, otp_code)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send verification email.")

    await redis_client.set(f"otp:{request.email}", otp_code, ex=600)
    return {"msg": "Verification code sent."}

@router.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    stored_otp = await redis_client.get(f"otp:{request.email}")
    
    if not stored_otp or str(stored_otp) != request.otp_code:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")
    
    # Set verification flag for 15 minutes
    await redis_client.set(f"verified_status:{request.email}", "true", ex=900)
    return {"msg": "Email verified. Proceed to registration."}

@router.post("/register")
async def register_passenger(request: RegisterRequest):
    # 1. Security: Ensure OTP step was completed
    is_verified = await redis_client.get(f"verified_status:{request.email}")
    if not is_verified:
        raise HTTPException(status_code=401, detail="Email not verified via OTP.")

    repo = UserRepository()

    # 2. Check if user already exists
    existing_user = await repo.get_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    # 3. Prepare Passenger Document
    user_document = {
        "username": request.username,
        "email": request.email,
        "password_hash": security.get_password_hash(request.password),
        "roles": ["PASSENGER"],
        "is_email_verified": True,
        "created_at": datetime.now(timezone.utc),
        "active_trip_id": None
    }

    # 4. Save and Cleanup
    user_id = await repo.create_user(user_document)
    await redis_client.delete(f"verified_status:{request.email}")
    await redis_client.delete(f"otp:{request.email}")

    return {"msg": "Registration successful!", "user_id": str(user_id)}

@router.post("/register-driver")
async def register_driver(
    username: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...),
    cnicNumber: str = Form(...),
    contact1: str = Form(...),
    contact2: Optional[str] = Form(None),
    paymentMethod: str = Form(...),
    accountNumber: str = Form(...),
    vehicleModel: str = Form(...),
    licensePlate: str = Form(...),
    cnicFront: UploadFile = File(...),
    cnicBack: UploadFile = File(...),
    license: UploadFile = File(...),
    carDocs: UploadFile = File(...),
    carImages: List[UploadFile] = File(...)
):
    # 1. Security Check
    is_verified = await redis_client.get(f"verified_status:{email}")
    if not is_verified:
        raise HTTPException(status_code=401, detail="Email not verified.")

    # 2. Upload Documents
    try:
        tasks = {
            "cnic_f": upload_asset_async(cnicFront.file, "drivers/cnic"),
            "cnic_b": upload_asset_async(cnicBack.file, "drivers/cnic"),
            "lic": upload_asset_async(license.file, "drivers/license"),
            "docs": upload_asset_async(carDocs.file, "drivers/vehicle_docs"),
        }
        veh_tasks = [upload_asset_async(img.file, "drivers/vehicles") for img in carImages]
        
        doc_results = await asyncio.gather(*tasks.values())
        vehicle_urls = await asyncio.gather(*veh_tasks)
        urls = dict(zip(tasks.keys(), doc_results))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error uploading documents to Cloudinary.")

    # 3. Prepare Driver Profile
    driver_document = {
        "username": username,
        "email": email,
        "password_hash": security.get_password_hash(password),
        "roles": ["DRIVER"],
        "is_email_verified": True,
        "is_approved": False,
        "driver_profile": {
            "cnic": cnicNumber,
            "contacts": [contact1, contact2] if contact2 else [contact1],
            "payout": {"method": paymentMethod, "account": accountNumber},
            "vehicle": {
                "model": vehicleModel,
                "plate": licensePlate,
                "images": vehicle_urls
            },
            "documents": {
                "cnic_front": urls["cnic_f"],
                "cnic_back": urls["cnic_b"],
                "license": urls["lic"],
                "car_docs": urls["docs"]
            }
        }
    }

    repo = UserRepository()
    user_id = await repo.create_driver_application(driver_document)

    await redis_client.delete(f"verified_status:{email}")
    await redis_client.delete(f"otp:{email}")

    return {"msg": "Application received.", "application_id": str(user_id)}
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

# --- ENDPOINTS (Add these at the bottom) ---

@router.post("/password/forgot")
async def forgot_password(request: ForgotPasswordRequest):
    repo = UserRepository()
    user = await repo.get_by_email(request.email)
    
    if not user:
        # 🛡️ Security Best Practice: Don't confirm if email exists or not
        return {"msg": "If an account exists, a code has been sent."}

    otp_code = str(random.randint(100000, 999999))
    
    # Reuse your existing Brevo logic
    success = await send_otp_email(request.email, otp_code)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send reset code.")

    # Store in Redis with a 'password_reset' prefix to separate from Registration OTPs
    await redis_client.set(f"reset:{request.email}", otp_code, ex=600)
    return {"msg": "Reset code dispatched."}

@router.post("/password/verify-code")
async def verify_reset_code(email: str, code: str): # FastAPI expects these as Query params now
    stored_otp = await redis_client.get(f"reset:{email}")
    
    if not stored_otp or str(stored_otp) != code:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")
    
    return {"msg": "Code verified."}

@router.post("/password/reset")
async def reset_password(request: ResetPasswordRequest):
    # 1. Final Security Check
    stored_otp = await redis_client.get(f"reset:{request.email}")
    if not stored_otp or str(stored_otp) != request.code:
        raise HTTPException(status_code=401, detail="Session expired. Please restart.")

    repo = UserRepository()
    
    # 2. Hash New Password
    new_hash = security.get_password_hash(request.new_password)
    
    # 3. Update in MongoDB
    # Note: You'll need to ensure your UserRepository has an 'update_password' method
    success = await repo.collection.update_one(
        {"email": request.email},
        {"$set": {"password_hash": new_hash}}
    )
    
    if success.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update password.")

    # 4. Cleanup Redis
    await redis_client.delete(f"reset:{request.email}")
    
    return {"msg": "Password updated successfully."}