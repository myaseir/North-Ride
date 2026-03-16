import asyncio
import random
import cloudinary.uploader
import cloudinary
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
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

# --- HELPER: Cloudinary Async Wrapper ---
async def upload_asset_async(file_obj, folder: str):
    """Wraps sync Cloudinary upload in a threadpool."""
    # Ensure we are at the start of the file before uploading
    await run_in_threadpool(file_obj.seek, 0)
    
    result = await run_in_threadpool(
        cloudinary.uploader.upload, 
        file_obj, 
        folder=folder
    )
    return result["secure_url"]

# --- ENDPOINTS ---

@router.post("/request-otp")
async def request_otp(request: RequestOTPRequest):
    repo = UserRepository()
    
    # Check if user already exists
    try:
        existing_user = await repo.get_by_email(request.email)
    except Exception as e:
        print(f"❌ DB Error: {e}")
        raise HTTPException(status_code=503, detail="Database connection issue.")

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
    
    # Upstash returns strings/bytes; cast to string for comparison
    if not stored_otp or str(stored_otp) != request.otp_code:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")
    
    await redis_client.set(f"verified_status:{request.email}", "true", ex=900)
    return {"msg": "Email verified. Proceed to registration."}


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
    # Security: Ensure OTP step was completed
    is_verified = await redis_client.get(f"verified_status:{email}")
    if not is_verified:
        raise HTTPException(status_code=401, detail="Email not verified.")

    # 4. Asset Buffering: Concurrent Upload (Safe Mapping)
    try:
        tasks = {
            "cnic_f": upload_asset_async(cnicFront.file, "drivers/cnic"),
            "cnic_b": upload_asset_async(cnicBack.file, "drivers/cnic"),
            "lic": upload_asset_async(license.file, "drivers/license"),
            "docs": upload_asset_async(carDocs.file, "drivers/vehicle_docs"),
        }
        
        # Handle multiple vehicle images
        veh_tasks = [upload_asset_async(img.file, "drivers/vehicles") for img in carImages]
        
        # Resolve all tasks
        doc_results = await asyncio.gather(*tasks.values())
        vehicle_urls = await asyncio.gather(*veh_tasks)
        
        # Map results back to specific keys
        urls = dict(zip(tasks.keys(), doc_results))
            
    except Exception as e:
        print(f"Asset Upload Error: {e}")
        raise HTTPException(status_code=500, detail="Error uploading documents.")

    # 5. Prepare Document
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

    # 6. Atomic Commit
    repo = UserRepository()
    user_id = await repo.create_driver_application(driver_document)

    # Cleanup Redis
    await redis_client.delete(f"verified_status:{email}")
    await redis_client.delete(f"otp:{email}")

    return {
        "msg": "Application received. Our team will review your docs.",
        "application_id": str(user_id)
    }


@router.post("/login")
async def login(request: LoginRequest):
    repo = UserRepository()
    
    # 1. Fetch User with connection error handling
    try:
        user = await repo.get_by_email(request.email)
    except Exception as e:
        print(f"❌ [LOGIN] DB Connection Error: {e}")
        raise HTTPException(status_code=503, detail="Database currently unavailable.")

    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    # 2. Verify Password (Safe Handling of the Hash)
    stored_hash = user.get("password_hash")
    
    # FIX: Check if hash exists and looks valid before calling passlib
    if not stored_hash or not stored_hash.startswith(("$2b$", "$2a$", "$argon2")):
        print(f"❌ [LOGIN] Invalid hash format in DB for {request.email}")
        raise HTTPException(status_code=401, detail="Account error. Please reset your password.")

    try:
        is_valid = await run_in_threadpool(
            security.verify_password, 
            request.password, 
            stored_hash
        )
    except Exception as e:
        print(f"❌ [LOGIN] Passlib verification failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed.")
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Incorrect password.")

    # 3. Generate JWT
    token_payload = {
        "sub": str(user["_id"]),
        "roles": user.get("roles", ["PASSENGER"])
    }
    access_token = security.create_access_token(data=token_payload)

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