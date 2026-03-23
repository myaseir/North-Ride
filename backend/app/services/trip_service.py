from app.repositories.trip_repo import TripRepository
from app.repositories.booking_repo import BookingRepository
from app.repositories.user_repo import UserRepository  # 🎯 Added
from app.db.redis import redis_mgr 
from fastapi import HTTPException, status
import logging
from datetime import datetime, timezone

logger = logging.getLogger("uvicorn.error")

class TripService:
    def __init__(self):
        self.trip_repo = TripRepository()
        self.booking_repo = BookingRepository()
        self.user_repo = UserRepository()  # 🎯 Initialized
        self.redis = redis_mgr 

    async def create_new_trip(self, trip_data: dict):
        """
        Enforces 'One Active Trip' rule and initializes trip.
        """
        driver_id = trip_data.get("driver_id")
        
        if not driver_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System Error: driver_id missing from payload."
            )

        # 1. Check if driver already has an active trip
        active_trip = await self.trip_repo.get_driver_active_trip(driver_id)
        if active_trip:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Active Sequence Detected: Complete your current trip first."
            )

        # 2. Add defaults
        if "seat_layout" not in trip_data:
            trip_data["seat_layout"] = ["1A", "1B", "2A", "2B"]
        
        if "available_seats" not in trip_data:
            trip_data["available_seats"] = trip_data.get("total_seats", 4)

        # 3. Save to MongoDB
        trip_id = await self.trip_repo.create_trip(trip_data)
        
        # 🎯 LINK DRIVER: Ensure driver profile reflects this active trip
        await self.user_repo.set_active_trip(driver_id, str(trip_id))
        
        return trip_id

    async def book_seat(
        self, 
        user_id: str, 
        passenger_name: str,
        passenger_phone: str,
        sender_name: str, 
        trip_id: str, 
        transaction_id: str, 
        seat_layout: list[str],
        account_number: str,
        amount_paid: float # This is the 100% Total from the frontend
        ):
        """
        Locks seats in Redis and creates a Pending Booking + Links Passenger.
        """
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

        if trip.get("status") != "scheduled":
            raise HTTPException(status_code=400, detail="Trip no longer accepting bookings.")

    # 🛡️ REDIS SAFETY: Attempt seat locking
        lock_acquired = True
        try:
            lock_acquired = await self.redis.acquire_seat_locks(trip_id, seat_layout)
        except Exception as redis_err:
            logger.warning(f"Redis unavailable, skipping lock: {redis_err}")

        if not lock_acquired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="Seats are currently on hold by another user."
            )

        try:
        # 🎯 Pass the 100% total to the repository
        # The Repo logic handles the internal 20% vs 80% split
            booking_id = await self.booking_repo.create_pending(
                user_id=user_id,
                passenger_name=passenger_name,
                passenger_phone=passenger_phone,
                sender_name=sender_name,
                trip_id=trip_id,
                amount=amount_paid,      
                trx_id=transaction_id,
                seat_layout=seat_layout,
                account_number=account_number 
            )

        # 🎯 MATCH: Repository returns "SEATS_TAKEN" on conflict
            if booking_id == "SEATS_TAKEN":
                try:
                    await self.redis.release_seat_locks(trip_id, seat_layout)
                except: pass
                raise HTTPException(status_code=400, detail="One or more selected seats are already booked.")

        # Link the passenger to this trip for /api/trips/active
            await self.user_repo.set_active_trip(user_id, trip_id)

            return booking_id

        except Exception as e:
        # Clean up Redis on any failure
            try:
                await self.redis.release_seat_locks(trip_id, seat_layout)
            except: pass
            raise e
    
    async def get_driver_manifest(self, trip_id: str, driver_id: str):
        """
        Fetches passenger list for the driver.
        """
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

        if str(trip["driver_id"]) != str(driver_id):
            raise HTTPException(status_code=403, detail="Unauthorized: This is not your trip.")

        if trip["status"] not in ["scheduled", "in-progress"]:
            raise HTTPException(status_code=400, detail="Manifest unavailable for completed/cancelled trips.")

        bookings = await self.booking_repo.get_trip_manifest(trip_id)
        
        return {
            "trip_info": trip,
            "bookings": bookings,
            "seat_layout": trip.get("seat_layout", [])
        }

    async def start_trip(self, trip_id: str, driver_id: str):
        """Transition from 'scheduled' to 'in-progress'"""
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
             raise HTTPException(status_code=404, detail="Trip not found")

        if str(trip["driver_id"]) != str(driver_id):
            raise HTTPException(status_code=403, detail="Not your trip.")
        
        await self.trip_repo.update_trip_status(trip_id, "in-progress")
        return {"status": "success", "message": "Trip started."}

    async def complete_trip(self, trip_id: str, driver_id: str):
        """Finalizes trip and clears active status for all participants."""
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

        if str(trip["driver_id"]) != str(driver_id):
            raise HTTPException(status_code=403, detail="Unauthorized.")

    # Fetch Manifest BEFORE changing status to ensure we get confirmed passengers
        manifest = await self.booking_repo.get_trip_manifest(trip_id)

    # 1. Update Trip Status
        await self.trip_repo.update_trip_status(trip_id, "completed")

    # 2. Update ALL bookings for this trip to "completed"
        await self.booking_repo.collection.update_many(
            {
                "trip_id": self.booking_repo._to_id(trip_id), 
                "status": "confirmed"
            },
            {
                "$set": {
                    "status": "completed",
                    "payout_status": "pending",
                    "completed_at": datetime.now(timezone.utc),
                    "rating_popup_shown": False,
                    "driver_id": self.booking_repo._to_id(driver_id) 
                }
            }
        )

    # 3. 🎯 REVENUE CALCULATION: Use total_price (Base + Surcharge)
        total_revenue = sum(
            float(b.get("total_price", 0)) 
            for b in manifest 
            if b.get("status") in ["confirmed", "completed"]
        )

    # 4. CLEANUP: Unlink all passengers and the driver
        for booking in manifest:
            passenger_id = str(booking.get("passenger_id"))
            if passenger_id and passenger_id != "None":
                await self.user_repo.set_active_trip(passenger_id, None)

        await self.user_repo.set_active_trip(driver_id, None)

        return {"status": "success", "earnings": total_revenue}

    async def verify_payment(self, booking_id: str):
        """Admin Verification: Confirms seat and releases Redis lock."""
        booking = await self.booking_repo.mark_as_confirmed(booking_id)
        if not booking:
             raise HTTPException(status_code=404, detail="Booking not found.")
        
        if booking == "NO_SEATS":
            raise HTTPException(status_code=400, detail="Trip capacity reached.")

        # Release the temporary Redis lock because the seat is now permanently booked in Mongo
        await self.redis.release_seat_locks(str(booking["trip_id"]), booking["seat_layout"])
        
        # 🎯 ADDED LOG: Useful for debugging verification flow
        logger.info(f"Verified booking {booking_id} for trip {booking['trip_id']}")
        
        return booking

    async def reject_booking(self, booking_id: str):
        """Admin Rejection: Frees seat and releases Redis lock + Unlinks User."""
        booking = await self.booking_repo.get_booking_by_id(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found.")

        # Release Redis Lock
        await self.redis.release_seat_locks(str(booking["trip_id"]), booking["seat_layout"])
        
        # 🎯 CLEANUP: Unlink user because their booking failed
        await self.user_repo.set_active_trip(str(booking["passenger_id"]), None)
        
        await self.booking_repo.cancel_booking(booking_id)
        return {"status": "success", "message": "Seat released."}

    async def search_trips(self, origin: str, destination: str, date_str: str = None):
        """
        Professional Search Logic: 
        1. Validation 2. Strict Search 3. Fallback Search 4. Weighted Ranking
        """
    
    # --- 4. DATA STRICTNESS (Server-Side Validation) ---
        if not origin or not destination:
         raise HTTPException(status_code=400, detail="Origin and Destination required.")

    # Prevent searching for past dates
        today_date = datetime.now().strftime("%Y-%m-%d")
        if date_str and date_str < today_date:
            raise HTTPException(status_code=400, detail="Cannot search for rides in the past.")

    # --- 2. HANDLING "NO RESULTS" (Strict vs. Flexible) ---
    # First, try the strict search (Exact Date)
        trips = await self.trip_repo.find_trips(origin, destination, date_str)
    
        is_fallback = False
        if not trips:
        # If no rides today, search for any rides starting from tomorrow onwards
        # We limit this to ensure we don't pull 1000s of future rides at once
            trips = await self.trip_repo.find_upcoming_trips(origin, destination, date_str, limit=20)
            is_fallback = True

    # --- 1. THE RANKING BASIS (Sorting Logic) ---
    # We apply a multi-level sort (Weighted Scoring)
    # Priority: Date (Asc) -> Driver Rating (Desc) -> Price (Asc)
    
        # --- 1. THE RANKING BASIS (Sorting Logic) ---
        def get_ranking_score(trip):
            # 🎯 FIX: Check for rating_avg (new) or driver_rating (old)
            # Default to 0 if no rating exists
            rating = trip.get("rating_avg") or trip.get("driver_rating") or 0
            
            return (
                trip.get("date"), 
                -float(rating), # Higher rating = lower number for sorting
                trip.get("price", 0)
            )

        trips.sort(key=get_ranking_score)

    # --- 3. INFINITE SCROLL / UI HELPERS ---
    # We tag the trips so the Frontend knows if these are "Exact Matches" 
    # or "Suggested Future Rides" to show a Date Divider.
        for trip in trips:
            trip["is_exact_match"] = not is_fallback
        # This helps the frontend render the "Suggested for Tomorrow" header
            if is_fallback:
                trip["ui_label"] = "Suggested Future Ride"

        return trips
    async def get_passenger_ride_history(self, passenger_id: str):
        """
        Fetches and formats history with clear financial breakdown.
        """
    # 1. Get raw bookings from repo (already enriched with trip data via lookup)
        bookings = await self.booking_repo.get_passenger_history(passenger_id)
    
        enriched_history = []
        for b in bookings:
        # 🎯 FINANCIAL BREAKDOWN
        # total_price = Base + Surcharge
        # amount_paid = 20% Advance
            total = float(b.get("total_price", 0))
            advance = float(b.get("amount_paid", 0))
        
            ride_entry = {
                "id": str(b["_id"]),
                "origin": b.get("origin", "Unknown"),
                "destination": b.get("destination", "Unknown"),
                "total_price": total,
                "advance_paid": advance,
                "remaining_balance": total - advance, # 💰 Cash to be paid to driver
                "status": b.get("status", "completed"),
                "created_at": b.get("created_at"),
                "rating": b.get("rating"), 
                "review_text": b.get("review_text"),
                "final_driver_name": b.get("final_driver_name", "Driver"),
                "has_premium_seat": "FL" in b.get("seat_layout", [])
            }
            enriched_history.append(ride_entry)
        
        return enriched_history
    
    async def get_driver_ledger(self, driver_id: str):
        return await self.booking_repo.get_driver_payout_ledger(driver_id)

    async def get_admin_pending_payouts(self):
        return await self.booking_repo.get_admin_pending_payouts()

    async def process_admin_payout(self, booking_id: str, action: str, transfer_ref: str = None):
        booking = await self.booking_repo.get_by_id(booking_id)
        if not booking or booking.get("payout_status") != "pending":
            raise HTTPException(status_code=400, detail="Payout already processed or invalid.")

        total_fare = float(booking.get("total_price", 0))
        advance = float(booking.get("amount_paid", 0))
        commission = total_fare * 0.05
        net_payout = advance - commission

        if action == "credit":
            await self.booking_repo.collection.update_one(
                {"_id": self.booking_repo._to_id(booking_id)},
                {"$set": {
                    "payout_status": "credited", 
                    "commission_deducted": commission,
                    "amount_transferred": net_payout,
                    "bank_transfer_ref": transfer_ref,
                    "payout_processed_at": datetime.now(timezone.utc)
                }}
            )
            return {"status": "success", "message": f"Marked as paid. {net_payout} PKR transferred."}
            
        elif action == "reject":
            await self.booking_repo.collection.update_one(
                {"_id": self.booking_repo._to_id(booking_id)},
                {"$set": {
                    "payout_status": "rejected", 
                    "payout_processed_at": datetime.now(timezone.utc)
                }}
            )
            return {"status": "success", "message": "Payout rejected."}

        raise HTTPException(status_code=400, detail="Invalid action")
class RatingService:
    def __init__(self, booking_repo, user_repo):
        self.booking_repo = booking_repo
        self.user_repo = user_repo
        
    async def get_popup_data(self, user_id: str):
        """Checks if a user is due for a one-time rating popup."""
        
        # 🎯 This single call now finds the booking AND flips the flag automatically!
        booking = await self.booking_repo.get_unrated_booking_for_popup(user_id)
        
        if not booking:
            return None
        
        # (We removed the 'update_prompt_status' call from here because the repo already did it)
        
        return {
            "booking_id": booking["id"],
            "driver_name": booking.get("final_driver_name", "Driver"),
            "driver_id": str(booking.get("driver_id", ""))
        }

    async def add_rating(self, booking_id: str, rating: int, review: str):
        """Saves the rating and updates the driver's global average."""
        # 1. Save the individual review
        await self.booking_repo.save_rating_results(booking_id, rating, review)

        # 2. Find the Driver to update their reputation
        booking = await self.booking_repo.get_by_id(booking_id)
        driver_id = booking.get("driver_id")
        
        if driver_id:
            # 3. Calculate New Average
            # Get all ratings for this driver from the bookings collection
            all_ratings = await self.booking_repo.get_all_ratings_for_driver(driver_id)
            
            if all_ratings:
                total_stars = sum(r['rating'] for r in all_ratings if r.get('rating'))
                count = len([r for r in all_ratings if r.get('rating')])
                new_avg = total_stars / count if count > 0 else 0
                
                # 4. Push the new average to the Driver's Profile
                await self.user_repo.update_driver_average_rating(driver_id, new_avg, count)
                
    