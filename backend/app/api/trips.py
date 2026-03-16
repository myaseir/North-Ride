from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.db.mongodb import db
from pydantic import BaseModel
from app.core.deps import get_current_user
from app.models.trip import TripCreate, TripUpdate, TripInDB
from app.models.booking import BookingCreate, BookingInDB
from app.services.trip_service import TripService
import logging

# Initialize logging to capture errors in the terminal
logger = logging.getLogger("uvicorn.error")

router = APIRouter()
trip_service = TripService()

class ManualSeatUpdate(BaseModel):
    seat_id: str
    action: str  # "hold", "booked", "free"
    
    
  
    
# --- DRIVER ENDPOINTS ---

@router.post("/publish")
async def publish_trip(data: TripCreate, current_user: dict = Depends(get_current_user)):
    """Dispatches a new trip sequence."""
    if "DRIVER" not in current_user.get("roles", []) or not current_user.get("is_approved", False):
        raise HTTPException(status_code=403, detail="Only approved captains can dispatch.")

    trip_dict = data.model_dump()
    
    # Injecting the necessary fields
    trip_dict["driver_id"] = str(current_user["_id"])
    if "departure_time" in trip_dict and not trip_dict.get("date"):
        dt = trip_dict["departure_time"]
        # Use strftime if Pydantic already converted it to a datetime object
        trip_dict["date"] = dt.split('T')[0] if isinstance(dt, str) else dt.strftime('%Y-%m-%d')
    trip_dict["status"] = "scheduled"
    trip_dict["available_seats"] = trip_dict.get("total_seats", 4)
    trip_dict["created_at"] = datetime.now(timezone.utc)
    
    # Call the service
    new_id = await trip_service.create_new_trip(trip_dict)
    
    # 🎯 THE FIX: Convert the ObjectId to a String before returning
    # This stops the "ObjectId is not iterable" error
    trip_dict["id"] = str(new_id) 
    
    # Remove the raw MongoDB _id if it exists to avoid encoder confusion
    if "_id" in trip_dict:
        del trip_dict["_id"]

    return trip_dict

@router.get("/active")
async def get_active_trip(current_user: dict = Depends(get_current_user)):
    user_id_str = str(current_user["_id"])
    
    # 1. Try to find trip where user is the Driver
    trip = await trip_service.trip_repo.get_driver_active_trip(user_id_str)
    
    # 2. If not a driver, try to find trip where user is a Passenger
    if not trip:
        active_trip_id = current_user.get("active_trip_id")
        if active_trip_id:
            trip = await trip_service.trip_repo.get_by_id(str(active_trip_id))
    
    # 3. If still no trip, return the 404
    if not trip:
        raise HTTPException(status_code=404, detail="No active trip found for this user")

    # 4. Cleanup and Manifest (Existing logic)
    manifest = await trip_service.booking_repo.get_trip_manifest(trip["id"])
    cleaned_passengers = []
    for b in manifest:
        bid = b.pop("_id", b.get("id"))
        b["id"] = str(bid)
        b["is_verified"] = (b.get("status") == "confirmed")
        cleaned_passengers.append(b)

    trip["passengers"] = cleaned_passengers
    return trip

# --- CHANGE PATCH TO POST ---
@router.post("/{trip_id}/start") # Added trailing slash for stability
async def start_trip(trip_id: str, current_user: dict = Depends(get_current_user)):
    """Updates status to 'in-progress'."""
    success = await trip_service.trip_repo.update_trip_status(trip_id, "in-progress")
    if not success:
        raise HTTPException(status_code=400, detail="Could not start journey.")
    return {"status": "success"}

@router.post("/{trip_id}/end") # Added trailing slash and changed to POST
async def end_trip(trip_id: str, current_user: dict = Depends(get_current_user)):
    """Completes trip and moves revenue to driver wallet."""
    return await trip_service.complete_trip(trip_id, str(current_user["_id"]))
# --- PASSENGER ENDPOINTS ---

@router.get("/search") # Remove response_model temporarily to debug or use a helper
async def search_trips(origin: str, destination: str, date: Optional[str] = None):
    """Passenger search route."""
    trips = await trip_service.search_trips(origin, destination, date)
    
    # 🎯 MUST convert _id to id so the frontend can read it
    for trip in trips:
        trip["id"] = str(trip["_id"])
        if "_id" in trip:
            del trip["_id"]
        if "driver_id" in trip:
            trip["driver_id"] = str(trip["driver_id"])
            
    return trips

@router.get("/manifest/{trip_id}")
async def get_trip_manifest(trip_id: str, current_user: Optional[dict] = Depends(lambda: None)):
    """
    Returns the seat chart. 
    Publicly accessible so passengers can see available seats.
    """
    # 1. Fetch trip from DB
    trip = await trip_service.trip_repo.get_by_id(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # 2. Fetch all bookings for this trip
    bookings = await trip_service.booking_repo.get_trip_manifest(trip_id)
    
    # 3. Clean the data for public view
    # We only send seat_layout and status. This protects passenger privacy.
    cleaned_bookings = []
    for b in bookings:
        cleaned_bookings.append({
            "seat_layout": b.get("seat_layout", []),  # e.g., ['f-l']
            "status": b.get("status"),                # 'confirmed' or 'pending'
        })

    return {
        "trip_id": str(trip["_id"]),
        "origin": trip.get("origin"),
        "destination": trip.get("destination"),
        "bookings": cleaned_bookings 
    }

@router.post("/book")
async def book_trip(payload: BookingCreate, current_user: dict = Depends(get_current_user)):
    try:
        # 🎯 REMOVE bank_name from this call if you removed it from BookingCreate
        booking_id = await trip_service.book_seat(
            user_id=str(current_user["_id"]),
            sender_name=payload.senderName,
            trip_id=payload.trip_id,
            transaction_id=payload.transactionId,
            seat_layout=payload.seat_layout,
            account_number=payload.account_number, 
            amount_paid=payload.amount_paid        
        )
        return {"status": "success", "booking_id": booking_id}
    except Exception as e:
        logger.error(f"Booking Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_driver_history(current_user: dict = Depends(get_current_user)):
    """
    Fetches the deployment history for the Driver Sidebar.
    """
    # Use the service layer (which then calls the repo method we just added)
    return await trip_service.trip_repo.get_history(str(current_user["_id"]))

@router.post("/{trip_id}/manual-seat")
async def toggle_manual_seat(trip_id: str, payload: ManualSeatUpdate, current_user: dict = Depends(get_current_user)):
    """Allows drivers to lock seats for Walk-in passengers and save it to the DB."""
    
    trip = await trip_service.trip_repo.get_by_id(trip_id)
    if str(trip["driver_id"]) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Unauthorized")

    # 1. Check if the seat is already in the manifest
    manifest = await trip_service.booking_repo.get_trip_manifest(trip_id)
    existing_booking = next((b for b in manifest if payload.seat_id in b.get("seat_layout", [])), None)

    # 2. If the driver clicks "Free", delete the walk-in
    if payload.action == "free":
        if existing_booking:
            if existing_booking.get("passenger_name") != "Walk-in":
                raise HTTPException(status_code=400, detail="Cannot free an App Booking manually.")
            await trip_service.booking_repo.cancel_booking(existing_booking["id"])
        return {"status": "success"}

    db_status = "confirmed" if payload.action == "booked" else "pending"

    # 3. Update existing or Create new Walk-in Booking
    if existing_booking:
        if existing_booking.get("passenger_name") != "Walk-in":
            raise HTTPException(status_code=400, detail="Seat is reserved by an App user.")
        
        await trip_service.booking_repo.collection.update_one(
            {"_id": trip_service.booking_repo._to_id(existing_booking["id"])},
            {"$set": {"status": db_status}}
        )
    else:
        # Create a dummy passenger named "Walk-in"
        walk_in_doc = {
            "passenger_id": trip_service.booking_repo._to_id(str(current_user["_id"])), 
            "passenger_name": "Walk-in",
            "trip_id": trip_service.booking_repo._to_id(trip_id),
            "amount": trip.get("price", 0),
            "trx_id": "CASH",
            "seat_layout": [payload.seat_id],
            "status": db_status,
            "created_at": datetime.now(timezone.utc)
        }
        await trip_service.booking_repo.collection.insert_one(walk_in_doc)
        
        if db_status == "confirmed":
            await trip_service.trip_repo.collection.update_one(
                {"_id": trip_service.trip_repo._to_id(trip_id)},
                {"$inc": {"available_seats": -1}}
            )

    return {"status": "success"} 

