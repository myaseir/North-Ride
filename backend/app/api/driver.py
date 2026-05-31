from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import get_current_user
from app.repositories.user_repo import UserRepository
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

router = APIRouter()
user_repo = UserRepository()

# --- Onboarding Model ---
class DriverOnboard(BaseModel):
    # CNIC Pattern for Pakistan: 00000-0000000-0
    cnic_number: str = Field(..., pattern=r"^\d{5}-\d{7}-\d{1}$")
    license_number: str
    vehicle_plate: str
    vehicle_type: str  # e.g., AC Car, Non-AC, SUV, Executive
    total_seats: int = Field(4, ge=1, le=10)
    
    # Business contact for Concierge/Shadow Routing
    driver_phone: str = Field(..., description="Active contact for ride coordination")
    
    # Image URLs from frontend upload (Cloudinary/S3)
    cnic_front_url: str
    cnic_back_url: str
    license_front_url: str
    vehicle_exterior_url: str
    vehicle_interior_url: str
    vehicle_reg_doc_url: str 

@router.post("/onboard")
async def register_as_driver(
    data: DriverOnboard, 
    current_user: dict = Depends(get_current_user)
):
    """
    Upgrades a passenger to a driver by adding a driver_profile.
    Places them in the Admin verification queue with a 'pending' status.
    Safely casts the incoming _id to a proper BSON ObjectId for Vercel environments.
    """
    
    # 1. Check if already approved
    if current_user.get("is_approved") and "DRIVER" in current_user.get("roles", []):
        return {
            "status": "already_verified", 
            "message": "You are already an approved Fleet Captain."
        }

    # 2. Prepare the Driver Profile object
    driver_profile = data.model_dump()
    driver_profile["applied_at"] = datetime.now(timezone.utc)
    driver_profile["verification_status"] = "pending" # options: pending, rejected, approved

    # 3. Construct the MongoDB update
    update_query = {
        "$set": {
            "driver_profile": driver_profile,
            "is_driver": True, 
            "is_approved": False, 
            "phone": data.driver_phone, # Sync main profile phone with driver contact
            "last_onboarding_attempt": datetime.now(timezone.utc)
        },
        "$addToSet": {
            "roles": "DRIVER" 
        }
    }
    
    # 4. 🎯 THE PRODUCTION FIX: Convert string IDs to proper BSON ObjectIds
    # This prevents unmapped filter mismatches due to serverless JSON serialization drops.
    user_oid = user_repo._to_id(current_user.get("_id") or current_user.get("id"))
    if not user_oid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid or expired user session tracking credentials."
        )

    # Update the Database using the safely converted ObjectId context
    success = await user_repo.collection.update_one(
        {"_id": user_oid}, 
        update_query
    )
    
    # If modified_count is 0, they sent identical data while already pending
    if success.modified_count == 0 and current_user.get("is_driver"):
        return {
            "status": "pending", 
            "message": "Your application is currently under review by our dispatch team."
        }
    
    return {
        "status": "submitted", 
        "message": "Documents received! Please allow 24-48 hours for vehicle verification."
    }

@router.get("/status")
async def get_onboarding_status(current_user: dict = Depends(get_current_user)):
    """
    Frontend helper to determine if the user should see the 
    'Onboarding Form', 'Pending Screen', or 'Driver Dashboard'.
    """
    # Check for rejection notes if the admin didn't approve
    profile = current_user.get("driver_profile", {})
    rejection_reason = profile.get("rejection_notes") if not current_user.get("is_approved") else None

    return {
        "is_driver": current_user.get("is_driver", False),
        "is_approved": current_user.get("is_approved", False),
        "roles": current_user.get("roles", []),
        "verification_status": profile.get("verification_status", "not_started"),
        "rejection_reason": rejection_reason
    }