from fastapi import APIRouter, Depends,BackgroundTasks, HTTPException, status,Response
from typing import List, Optional
from datetime import datetime, timezone,timedelta
from bson import ObjectId
from pydantic import BaseModel, Field
from app.db.mongodb import db
from pydantic import BaseModel
from app.core.deps import get_current_user
from app.models.trip import TripCreate, TripUpdate, TripInDB
from app.models.booking import BookingCreate, BookingInDB
from app.services.trip_service import TripService
from app.services.trip_service import RatingService
from app.repositories.booking_repo import BookingRepository  # 🎯 Import the class
from app.core.deps import get_booking_repo                  # 🎯 Import the provider# 🎯 Import the class
# In trip.py
from app.core.deps import (
    get_current_user, 
    get_trip_service, 
    get_rating_service # 🎯 Now this will work!
)
from app.models.rating import RatingSubmit
import logging

# Initialize logging to capture errors in the terminal
logger = logging.getLogger("uvicorn.error")

router = APIRouter()
trip_service = TripService()

class ManualSeatUpdate(BaseModel):
    seat_id: str
    action: str  # "hold", "booked", "free"

class PayoutAction(BaseModel):
    action: str # "credit" or "reject"
    transfer_ref: Optional[str] = None
    
class PriceUpdateSchema(BaseModel):
    new_price: float = Field(..., gt=0, description="The updated price for remaining seats")  
    
class TripCreate(BaseModel):
    origin: str
    destination: str
    departure_time: datetime
    price: float  # 👈 Make sure this line is explicitly added here!
    base_price: Optional[float] = None
    total_seats: int = 4
# --- DRIVER ENDPOINTS ---

@router.post("/publish")
async def publish_trip(data: TripCreate, current_user: dict = Depends(get_current_user)):
    """Dispatches a new trip sequence safely handling price field variants."""
    if "DRIVER" not in current_user.get("roles", []) or not current_user.get("is_approved", False):
        raise HTTPException(status_code=403, detail="Only approved captains can dispatch.")

    trip_dict = data.model_dump()
    
    # 🎯 FIX THE 422 MISMATCH:
    # Safely duplicate 'price' and 'base_price' so your search and repository aggregations
    # can access either structural key seamlessly depending on history or manifest view states.
    if "price" in trip_dict and not trip_dict.get("base_price"):
        trip_dict["base_price"] = trip_dict["price"]
    elif "base_price" in trip_dict and not trip_dict.get("price"):
        trip_dict["price"] = trip_dict["base_price"]

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
    
    # Cast variables back to clean payload formats for serialization safety
    trip_dict["driver_id"] = str(trip_dict.get("driver_id", ""))
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
    
    # 🎯 3. THE FIX: Reject completed/cancelled trips
    # If we found a trip, but it's already done, we must NOT return it.
    if trip and trip.get("status") not in ["scheduled", "in-progress"]:
        # Heal the database: remove the stuck ID from the user's profile
        await trip_service.user_repo.set_active_trip(user_id_str, None)
        trip = None # Set to None so it triggers the 404 below
    
    # 4. If still no trip (or if we just rejected it), return the 404
    # This 404 is what tells your PassengerDashboard to show the Search Box!
    if not trip:
        raise HTTPException(status_code=404, detail="No active trip found for this user")

    # 5. Cleanup and Manifest 
    manifest = await trip_service.booking_repo.get_trip_manifest(trip["id"])
    cleaned_passengers = []
    for b in manifest:
        bid = b.pop("_id", b.get("id"))
        b["id"] = str(bid)
        b["is_verified"] = (b.get("status") == "confirmed")
        b["passenger_phone"] = b.get("passenger_phone")
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

@router.post("/{trip_id}/price", tags=["Driver"])
async def modify_trip_fare(
    trip_id: str,
    payload: PriceUpdateSchema,
    current_user: dict = Depends(get_current_user)
):
    """Allows the logged-in driver to update the seat price for remaining upcoming inventory."""
    if "DRIVER" not in current_user.get("roles", []):
        raise HTTPException(status_code=403, detail="Only registered captains can modify trip fares.")

    success = await trip_service.trip_repo.update_trip_price(
        trip_id=trip_id, 
        driver_id=str(current_user["_id"]), 
        new_price=payload.new_price
    )
    
    if not success:
        raise HTTPException(
            status_code=400, 
            detail="Price update failed. Verify the trip exists, belongs to you, and hasn't started yet."
        )
        
    return {"status": "success", "message": f"Trip fare updated to {payload.new_price} successfully."}


# --- PASSENGER ENDPOINTS ----

@router.get("/search")
async def search_trips(
    origin: str, 
    destination: str, 
    date: Optional[str] = None,
    trip_service: TripService = Depends(get_trip_service) 
):
    """Passenger search route with Driver Rating ranking and fallback."""
    
    # --- 1. THE TIMEZONE FIX ---
    # Force the server to calculate "today" using Pakistan time (UTC+5)
    pkt_timezone = timezone(timedelta(hours=5))
    today_date = datetime.now(pkt_timezone).strftime("%Y-%m-%d")
    
    if date and date < today_date:
        raise HTTPException(status_code=400, detail="Cannot search for rides in the past.")

    # 2. Fetch trips 
    trips = await trip_service.search_trips(origin, destination, date)
    
    # 3. Professional Data Transformation
    return [
        {
            **trip,
            "id": str(trip["_id"]),
            "driver_id": str(trip.get("driver_id")) if trip.get("driver_id") else None,
            
            # The rating fallbacks we added
            "driver_rating": trip.get("rating_avg", trip.get("driver_rating", 0.0)),
            "review_count": trip.get("rating_count", trip.get("review_count", 0)),
            
            "_id": None 
        }
        for trip in trips
    ]
    
    

@router.get("/manifest/{trip_id}")
async def get_trip_manifest(trip_id: str, current_user: Optional[dict] = Depends(lambda: None)):
    """
    Returns the seat chart and payment status.
    Now includes 'remaining_balance' for Driver/Admin transparency.
    """
    trip = await trip_service.trip_repo.get_by_id(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    bookings = await trip_service.booking_repo.get_trip_manifest(trip_id)
    
    cleaned_bookings = []
    for b in bookings:
        # 🎯 THE PROFESSIONAL UPDATE:
        # We calculate the balance here so the Frontend doesn't have to do math.
        total = float(b.get("total_price", 0))
        paid = float(b.get("amount_paid", 0))
        balance = total - paid

        cleaned_bookings.append({
            "id": str(b.get("_id")),
            "seat_layout": b.get("seat_layout", []),
            "status": b.get("status"),
            "passenger_name": b.get("passenger_name"),
            "passenger_phone": b.get("passenger_phone"),
            "is_manual": b.get("is_manual", False),
            
            # 🎯 NEW FINANCIAL FIELDS FOR THE DRIVER/ADMIN
            "total_trip_cost": total,
            "advance_paid": paid,
            "remaining_balance": balance, # 💰 This is the "Collect Cash" amount
            "has_premium_seat": "FL" in b.get("seat_layout", [])
        })

    return {
        "trip_id": str(trip["_id"]),
        "origin": trip.get("origin"),
        "destination": trip.get("destination"),
        "base_fare": trip.get("fare") or trip.get("price"),
        "bookings": cleaned_bookings 
    }

@router.post("/book")
async def book_trip(payload: BookingCreate, current_user: dict = Depends(get_current_user)):
    try:
        passenger_name = current_user.get("full_name") or current_user.get("username")
        passenger_phone = current_user.get("phone") or current_user.get("phone_number")

        logger.info(f"Processing booking for {passenger_name}. Amount Received: {payload.amount_paid}")

        # 🎯 FIX: Use explicit keyword arguments for EVERYTHING
        # This prevents the "missing 1 required positional argument" error on Vercel
        booking_id = await trip_service.book_seat(
            user_id=str(current_user["_id"]),
            passenger_name=passenger_name, 
            passenger_phone=passenger_phone,
            sender_name=payload.senderName, 
            trip_id=payload.trip_id,
            transaction_id=payload.transactionId,
            seat_layout=payload.seat_layout,
            account_number=payload.account_number, 
            amount_paid=payload.amount_paid        
        )

        return {"status": "success", "booking_id": booking_id}

    except HTTPException as he:
        raise he
    except Exception as e:
        # 🎯 LOGGING: This will tell you exactly what went wrong in Vercel logs
        logger.error(f"Booking Route Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/history")
async def get_unified_history(
    current_user: dict = Depends(get_current_user),
    booking_repo: BookingRepository = Depends(get_booking_repo),
    trip_service: TripService = Depends(get_trip_service)
):
    """
    Unified history endpoint for both Drivers and Passengers.
    Ensures all ObjectIds are converted to strings to prevent JSON errors.
    """
    user_id = str(current_user["_id"])
    roles = current_user.get("roles", [])
    
    combined_history = []

    # 1. Fetch Driver History
    if "DRIVER" in roles:
        driver_trips = await trip_service.trip_repo.get_history(user_id)
        if driver_trips:  # 🎯 Add Safety Check
            for t in driver_trips:
                t["history_type"] = "driver"
                # 🔥 CRITICAL: Convert _id to string if not already done
                if "_id" in t:
                    t["id"] = str(t["_id"])
                    t["_id"] = t["id"]
            combined_history.extend(driver_trips)

    # 2. Fetch Passenger History (This uses your $lookup enrichment)
    passenger_bookings = await booking_repo.get_passenger_history(user_id)
    if passenger_bookings: # 🎯 Add Safety Check to prevent TypeError
        for b in passenger_bookings:
            b["history_type"] = "passenger"
            # 🔥 CRITICAL: Convert all potential ObjectIds
            if "_id" in b:
                b["id"] = str(b["_id"])
                b["_id"] = b["id"]
            if "trip_id" in b:
                b["trip_id"] = str(b["trip_id"])
        combined_history.extend(passenger_bookings)

    # 3. Sort by date (Newest First)
    combined_history.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    # 4. FINAL SAFETY CHECK: Remove any remaining raw ObjectIds
    # This prevents the 500 Internal Server Error you are seeing
    for item in combined_history:
        for key, value in item.items():
            if isinstance(value, ObjectId):
                item[key] = str(value)

    return combined_history

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

@router.get("/active/check-rating")
async def check_pending_rating(
    current_user = Depends(get_current_user),
    rating_service: RatingService = Depends(get_rating_service)
):
    # 🎯 FIX: Use ['id'] instead of .id
    user_id = current_user.get("id") or str(current_user.get("_id"))
    
    # Fetch the data (This atomically flips the switch in the DB now!)
    popup_data = await rating_service.get_popup_data(user_id)
    
    if not popup_data:
        return Response(status_code=204)
    
    return popup_data

@router.post("/active/rate")
async def submit_trip_rating(
    rating_data: RatingSubmit, # 🎯 Using the Pydantic model we created
    current_user = Depends(get_current_user),
    rating_service: RatingService = Depends(get_rating_service)
):
    """
    Saves the stars and review, then updates the Driver's global average.
    """
    await rating_service.add_rating(
        booking_id=rating_data.booking_id,
        rating=rating_data.rating,
        review=rating_data.review_text
    )
    return {"message": "Rating processed and driver stats updated"}

# ==========================================
# 💰 PAYOUT & LEDGER ENDPOINTS (NEW)
# ==========================================

@router.get("/driver/ledger")
async def get_driver_ledger(
    current_user = Depends(get_current_user),
    trip_service: TripService = Depends(get_trip_service)
):
    """Driver views their pending, credited, and rejected advances."""
    if "DRIVER" not in current_user.get("roles", []):
        raise HTTPException(status_code=403, detail="Driver access required")
        
    user_id = current_user.get("id") or str(current_user.get("_id"))
    return await trip_service.get_driver_ledger(user_id)


@router.get("/admin/payouts/pending")
async def admin_get_pending_payouts(
    current_user = Depends(get_current_user), 
    trip_service: TripService = Depends(get_trip_service)
):
    """Admin sees all pending advances to distribute."""
    if "ADMIN" not in current_user.get("roles", []):
        raise HTTPException(status_code=403, detail="Admin access required")
        
    return await trip_service.get_admin_pending_payouts()


@router.post("/admin/payouts/{booking_id}/process")
async def admin_process_payout(
    booking_id: str, 
    payload: PayoutAction,
    current_user = Depends(get_current_user),
    trip_service: TripService = Depends(get_trip_service)
):
    """Admin confirms the bank transfer was made or rejects the payout."""
    if "ADMIN" not in current_user.get("roles", []):
        raise HTTPException(status_code=403, detail="Admin access required")

    return await trip_service.process_admin_payout(
        booking_id=booking_id, 
        action=payload.action, 
        transfer_ref=payload.transfer_ref
    )


