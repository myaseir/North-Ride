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

@router.get("/search")
async def search_trips(origin: str, destination: str, date: Optional[str] = None):
    """Passenger search route with strict ranking and fallback."""
    
    # 1. Fetch trips (The ranking/next-day logic should be inside this service call)
    trips = await trip_service.search_trips(origin, destination, date)
    
    # 2. Professional Data Transformation
    # Instead of a manual loop with 'del', we map it to a clean dictionary
    return [
        {
            **trip,
            "id": str(trip["_id"]),
            "driver_id": str(trip.get("driver_id")) if trip.get("driver_id") else None,
            "_id": None # Most frameworks handle removing nulls automatically
        }
        for trip in trips
    ]
    
    

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
            "id": b.get("id"), # Useful for unique keys in React
            "seat_layout": b.get("seat_layout", []),
            "status": b.get("status"),
            "passenger_name": b.get("passenger_name"), # 🎯 REQUIRED for your frontend check
            "is_manual": b.get("is_manual", False)    # 🎯 REQUIRED to unlock the buttons
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
        # 🎯 THE AUTOMATIC FIX: 
        # Use current_user.get("full_name") so the user doesn't have to type it.
        passenger_name = current_user.get("full_name") or current_user.get("username")

        booking_id = await trip_service.book_seat(
            user_id=str(current_user["_id"]),
            passenger_name=passenger_name, # Derived from the Account (DI)
            sender_name=payload.senderName, # Derived from Payment Form
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
    """Allows drivers to lock seats for Walk-in passengers and manage seat availability."""
    
    trip = await trip_service.trip_repo.get_by_id(trip_id)
    if not trip or str(trip["driver_id"]) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Unauthorized")

    # 1. Check current manifest
    manifest = await trip_service.booking_repo.get_trip_manifest(trip_id)
    existing_booking = next((b for b in manifest if payload.seat_id in b.get("seat_layout", [])), None)

    # 🛑 SECURITY CHECK: Never allow modification of real App Bookings
    if existing_booking and existing_booking.get("passenger_name") != "Walk-in":
        raise HTTPException(status_code=400, detail="Seat is reserved by an App user.")

    # 🟢 ACTION: FREE THE SEAT
    if payload.action == "free":
        if existing_booking:
            # If the seat was "Confirmed/Booked", we must put the seat back in the pool
            if existing_booking.get("status") == "confirmed":
                await trip_service.trip_repo.collection.update_one(
                    {"_id": trip_service.trip_repo._to_id(trip_id)},
                    {"$inc": {"available_seats": 1}} # Increment availability
                )
            await trip_service.booking_repo.cancel_booking(existing_booking["id"])
        return {"status": "success", "message": "Seat released"}

    # 🟡 ACTION: HOLD OR BOOK
    db_status = "confirmed" if payload.action == "booked" else "pending"

    if existing_booking:
        # If transitioning from 'pending' (Hold) to 'confirmed' (Booked), decrease seat count
        if existing_booking.get("status") == "pending" and db_status == "confirmed":
            await trip_service.trip_repo.collection.update_one(
                {"_id": trip_service.trip_repo._to_id(trip_id)},
                {"$inc": {"available_seats": -1}}
            )
        
        # If transitioning from 'confirmed' to 'pending', increase seat count
        elif existing_booking.get("status") == "confirmed" and db_status == "pending":
            await trip_service.trip_repo.collection.update_one(
                {"_id": trip_service.trip_repo._to_id(trip_id)},
                {"$inc": {"available_seats": 1}}
            )

        await trip_service.booking_repo.collection.update_one(
            {"_id": trip_service.booking_repo._to_id(existing_booking["id"])},
            {"$set": {"status": db_status}}
        )
    else:
        # Create a new Walk-in Booking
        walk_in_doc = {
            "passenger_id": trip_service.booking_repo._to_id(str(current_user["_id"])), 
            "passenger_name": "Walk-in",
            "is_manual": True, # 🔥 Pro addition: Explicitly mark as manual
            "trip_id": trip_service.booking_repo._to_id(trip_id),
            "amount": trip.get("price", 0),
            "trx_id": "CASH",
            "seat_layout": [payload.seat_id],
            "status": db_status,
            "created_at": datetime.now(timezone.utc)
        }
        await trip_service.booking_repo.collection.insert_one(walk_in_doc)
        
        # Only decrease available seats if it's a confirmed booking, not a hold
        if db_status == "confirmed":
            await trip_service.trip_repo.collection.update_one(
                {"_id": trip_service.trip_repo._to_id(trip_id)},
                {"$inc": {"available_seats": -1}}
            )

    return {"status": "success"} 

