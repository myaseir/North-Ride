from __future__ import annotations
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
        
        return str(trip_id)

    async def book_seat(self, user_id: str, passenger_name: str, passenger_phone: str, 
                        sender_name: str, trip_id: str, transaction_id: str, 
                        seat_layout: list[str], account_number: str, amount_paid: float):
        
        # 1. Standardize IDs to strings (Crucial for Vercel)
        t_id = str(trip_id)
        u_id = str(user_id)

        # 2. Initial Trip Check
        trip = await self.trip_repo.get_by_id(t_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

        # 3. ATTEMPT LOCK (Move this as high as possible)
        # 🎯 Pass user_id as the third argument
        lock_acquired = await self.redis.acquire_seat_locks(trip_id, seat_layout, user_id)

        if not lock_acquired:
            # 🎯 VERCEL FIX: Check if the existing lock belongs to THIS user
            # If they refreshed the page, don't lock them out of their own hold.
            is_mine = await self.redis.client.get(f"lock:trip:{t_id}:seat:{seat_layout[0]}")
            if is_mine != u_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, 
                    detail="Seats are currently on hold by another user."
                )

        try:
            # 4. FINAL DB VERIFICATION (The Safety Net)
            # Re-check the trip data to ensure seats weren't taken while we were locking
            fresh_trip = await self.trip_repo.get_by_id(t_id)
            booked_seats = fresh_trip.get("booked_seats", [])
            if any(seat in booked_seats for seat in seat_layout):
                 raise HTTPException(status_code=400, detail="One or more seats were just taken.")

            # 5. Create the Booking
            booking_id = await self.booking_repo.create_pending(
                user_id=u_id,
                passenger_name=passenger_name,
                passenger_phone=passenger_phone,
                sender_name=sender_name,
                trip_id=t_id,
                amount=amount_paid,      
                trx_id=transaction_id,
                seat_layout=seat_layout,
                account_number=account_number 
            )

            if booking_id == "SEATS_TAKEN":
                await self.redis.release_seat_locks(t_id, seat_layout)
                raise HTTPException(status_code=400, detail="Seats are already booked.")

            await self.user_repo.set_active_trip(u_id, t_id)
            return booking_id

        except Exception as e:
            await self.redis.release_seat_locks(t_id, seat_layout)
            if isinstance(e, HTTPException): raise e
            logger.error(f"Booking Error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to process booking.")
    
    async def get_driver_manifest(self, trip_id: str, driver_id: str):
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
        booking = await self.booking_repo.mark_as_confirmed(booking_id)
        if not booking:
             raise HTTPException(status_code=404, detail="Booking not found.")
        
        if booking == "NO_SEATS":
            raise HTTPException(status_code=400, detail="Trip capacity reached.")

        await self.redis.release_seat_locks(str(booking["trip_id"]), booking["seat_layout"])
        logger.info(f"Verified booking {booking_id} for trip {booking['trip_id']}")
        
        return booking

    async def reject_booking(self, booking_id: str):
        booking = await self.booking_repo.get_booking_by_id(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found.")

        await self.redis.release_seat_locks(str(booking["trip_id"]), booking["seat_layout"])
        
        # 🎯 CLEANUP: Unlink user because their booking failed
        passenger_id = booking.get("passenger_id")
        if passenger_id and passenger_id != "None":
            await self.user_repo.set_active_trip(str(passenger_id), None)
        
        await self.booking_repo.cancel_booking(booking_id)
        return {"status": "success", "message": "Seat released."}

    async def search_trips(self, origin: str, destination: str, date_str: str = None):
        if not origin or not destination:
            raise HTTPException(status_code=400, detail="Origin and Destination required.")

        today_date = datetime.now().strftime("%Y-%m-%d")
        if date_str and date_str < today_date:
            raise HTTPException(status_code=400, detail="Cannot search for rides in the past.")

        trips = await self.trip_repo.find_trips(origin, destination, date_str)
    
        is_fallback = False
        if not trips:
            # Requires find_upcoming_trips implementation in trip_repo
            trips = await self.trip_repo.find_upcoming_trips(origin, destination, date_str, limit=20)
            is_fallback = True

        def get_ranking_score(trip):
            rating = trip.get("rating_avg") or trip.get("driver_rating") or 0
            return (
                trip.get("date"), 
                -float(rating),
                trip.get("price", 0)
            )

        trips.sort(key=get_ranking_score)

        for trip in trips:
            trip["id"] = str(trip.get("_id", trip.get("id"))) # Guarantee string conversion
            trip["is_exact_match"] = not is_fallback
            if is_fallback:
                trip["ui_label"] = "Suggested Future Ride"

        return trips

    async def get_passenger_ride_history(self, passenger_id: str):
        bookings = await self.booking_repo.get_passenger_history(passenger_id)
    
        enriched_history = []
        for b in bookings:
            total = float(b.get("total_price", 0))
            advance = float(b.get("amount_paid", 0))
        
            ride_entry = {
                "id": str(b.get("_id", b.get("id"))),
                "origin": b.get("origin", "Unknown"),
                "destination": b.get("destination", "Unknown"),
                "total_price": total,
                "advance_paid": advance,
                "remaining_balance": total - advance,
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
        booking = await self.booking_repo.get_unrated_booking_for_popup(user_id)
        if not booking: return None
        
        return {
            "booking_id": str(booking.get("id")),
            "driver_name": booking.get("final_driver_name", "Driver"),
            "driver_id": str(booking.get("driver_id", ""))
        }

    async def add_rating(self, booking_id: str, rating: int, review: str):
        await self.booking_repo.save_rating_results(booking_id, rating, review)

        booking = await self.booking_repo.get_by_id(booking_id)
        driver_id = booking.get("driver_id")
        
        if driver_id:
            all_ratings = await self.booking_repo.get_all_ratings_for_driver(driver_id)
            
            if all_ratings:
                total_stars = sum(r['rating'] for r in all_ratings if r.get('rating'))
                count = len([r for r in all_ratings if r.get('rating')])
                new_avg = total_stars / count if count > 0 else 0
                
                await self.user_repo.update_driver_average_rating(driver_id, new_avg, count)