from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel
import traceback
import logging
from bson import ObjectId
from app.db.mongodb import db
# Initialize the logger

# Security & Repositories
from app.core.deps import get_current_admin, get_current_user # 🎯 Added get_current_user fallback
from app.repositories.booking_repo import BookingRepository
from app.repositories.user_repo import UserRepository
from app.services.travel_admin_service import TravelAdminService # 🎯 THE KEY IMPORT
from app.services.trip_service import TripService # 🎯 Added TripService import

router = APIRouter()
logger = logging.getLogger("uvicorn.error")
# Initialize Components
booking_repo = BookingRepository()
user_repo = UserRepository()
admin_service = TravelAdminService() # 🎯 Initialize the Service
trip_service = TripService() # 🎯 Initialize TripService instance

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
class BulkSeedRequest(BaseModel):
    origin: str
    destination: str
    start_date: str
    days_to_schedule: int = 14
    departure_times: List[str]
    base_price: float
    cost_price: float
    total_seats: int = 4
# --- 3. CONCIERGE GHOST FLEET ENGINE ---

@router.post("/bulk-seed")
async def seed_ghost_fleet(
    payload: BulkSeedRequest, 
    current_user: dict = Depends(get_current_user)
):
    """
    Injects high-availability placeholder runs into the timeline grid.
    Validated via BulkSeedRequest model.
    """
    # 1. Unified Security Check
    roles = current_user.get("roles", [])
    if "ADMIN" not in roles:
        raise HTTPException(
            status_code=403, 
            detail="Access Denied: Administrative Clearance Required."
        )
        
    # 2. Service execution with cleaned payload (model is already validated)
    try:
        
        logger.info(f"Payload received: {payload}")
        trip_ids = await trip_service.bulk_schedule_brokered_trips(
            admin_id=str(current_user["_id"]), 
            bulk_data=payload.dict()
        )
        return {
            "status": "success", 
            "total_seeded": len(trip_ids),
            "generated_ids": trip_ids
        }
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print("--- FULL TRACEBACK START ---")
        print(error_details)
        print("--- FULL TRACEBACK END ---")
        raise HTTPException(status_code=500, detail=str(e))
        logger.error("FATAL ERROR IN BULK SEED:")
        raise HTTPException(status_code=500, detail=f"Fleet seeding failed: {str(e)}")
    
@router.get("/booking-context/{passenger_id}/{trip_id}")
async def get_booking_context(passenger_id: str, trip_id: str, current_user: dict = Depends(get_current_admin)):
    # This calls the method we added to your BookingRepository
    return await booking_repo.get_passenger_trip_thread(passenger_id, trip_id)    

# Create a simple schema for the override
class TripOverridePayload(BaseModel):
    new_status: str

@router.get("/fleet")
async def get_live_fleet(admin: dict = Depends(get_current_admin)):
    """Gets the live radar view of all trips."""
    return await admin_service.get_all_fleet_trips()

@router.post("/override-trip/{trip_id}")
async def override_trip_state(
    trip_id: str, 
    payload: TripOverridePayload, 
    admin: dict = Depends(get_current_admin)
):
    """Fires the God Mode override."""
    result = await admin_service.force_trip_status(trip_id, payload.new_status)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@router.post("/referrals/{audit_id}/resolve")
async def resolve_referral(
    audit_id: str, 
    payload: dict, 
    current_user = Depends(get_current_user),
    user_repo: UserRepository = Depends(lambda: UserRepository())
):
    if "ADMIN" not in current_user.get("roles", []):
        raise HTTPException(status_code=403, detail="Forbidden")

    # 🎯 USE _to_id FOR SAFETY
    audit_oid = user_repo._to_id(audit_id)
    if not audit_oid:
        raise HTTPException(status_code=400, detail="Invalid Audit ID format")

    # 1. Fetch the request details
    audit_req = await db.db.audit_requests.find_one({"_id": audit_oid})
    if not audit_req:
        raise HTTPException(status_code=404, detail="Request not found")

    if payload["action"] == "approve":
        # 2. Update the status
        await db.db.audit_requests.update_one(
            {"_id": ObjectId(audit_id)}, 
            {"$set": {"status": "approved", "resolved_at": datetime.now(timezone.utc)}}
        )
        
        # 3. 🎯 CRITICAL: Credit the referrer
        # We increment the loyalty count since the admin manually verified this is a valid user
        await user_repo.collection.update_one(
            {"_id": user_repo._to_id(audit_req["referrer_id"])},
            {"$inc": {"loyalty_meta.referral_count": 1}}
        )
        
    else:
        # Reject
        await db.db.audit_requests.update_one(
            {"_id": ObjectId(audit_id)}, 
            {"$set": {"status": "rejected", "resolved_at": datetime.now(timezone.utc)}}
        )
        
    return {"status": "success"}

@router.get("/referrals/pending")
async def get_pending_referrals(
    current_user: dict = Depends(get_current_user),
    user_repo: UserRepository = Depends(lambda: UserRepository())
):
    if "ADMIN" not in current_user.get("roles", []):
        raise HTTPException(status_code=403, detail="Forbidden")

    # Use the new enriched method
    suspicious = await user_repo.get_pending_audit_requests_enriched()
    pending_activity = await user_repo.get_pending_referrals_by_activity()

    return {
        "suspicious_flagged": suspicious,
        "pending_no_trip": pending_activity
    }