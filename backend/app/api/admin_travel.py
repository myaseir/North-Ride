from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel

# Security & Repositories
from app.core.deps import get_current_admin
from app.repositories.booking_repo import BookingRepository
from app.repositories.user_repo import UserRepository
from app.services.travel_admin_service import TravelAdminService # 🎯 THE KEY IMPORT

router = APIRouter()

# Initialize Components
booking_repo = BookingRepository()
user_repo = UserRepository()
admin_service = TravelAdminService() # 🎯 Initialize the Service

# --- SCHEMAS ---

class VerificationPayload(BaseModel):
    driver_id: str
    overwrites: dict

# --- 1. DRIVER KYC MANAGEMENT ---

@router.get("/pending-drivers", response_model=List[Dict[str, Any]])
async def list_pending_drivers(admin: dict = Depends(get_current_admin)):
    """
    Retrieves all driver applications currently in the 'Pending' state.
    """
    drivers = await user_repo.get_pending_drivers()
    
    if not isinstance(drivers, list):
        return []

    formatted_drivers = []
    for d in drivers:
        d["id"] = str(d.get("_id"))
        d.pop("_id", None)
        d.pop("password_hash", None)
        d.pop("refresh_token", None)
        formatted_drivers.append(d)
        
    return formatted_drivers


# --- 2. FINANCIAL & BOOKING AUDIT ---

@router.get("/pending-verifications")
async def list_pending_bookings(admin: dict = Depends(get_current_admin)):
    """
    Fetches all bookings requiring manual payment verification.
    """
    try:
        return await booking_repo.get_pending_verifications()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve booking audit log."
        )

@router.post("/verify-booking/{booking_id}")
async def approve_payment(
    booking_id: str, 
    payload: VerificationPayload, 
    admin: dict = Depends(get_current_admin)
):
    """
    🎯 THE GOLD FLOW:
    Uses TravelAdminService to:
    1. Merge Admin inputs with actual Driver profile data.
    2. Confirm the booking and Sync driver info to the Trip collection.
    3. Trigger automated confirmation notifications to the passenger.
    """
    
    # 1. Process via Service Layer (Not the repo directly!)
    result = await admin_service.verify_and_confirm_booking(
        booking_id=booking_id,
        driver_id=payload.driver_id,
        overwrites=payload.overwrites
    )

    # 2. Handle Business Logic Errors
    if not result.get("success"):
        error_msg = result.get("error", "Verification failed")
        
        if "full capacity" in error_msg or "NO_SEATS" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Cannot confirm: Trip is already fully booked."
            )
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=error_msg
        )

    # 3. Success Response
    return {
        "status": "confirmed",
        "message": "Payment verified and dispatch details locked.",
        "confirmed_at": datetime.now(timezone.utc),
        "details": result.get("driver_assigned")
    }