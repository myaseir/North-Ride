from __future__ import annotations
from app.repositories.trip_repo import TripRepository
from app.repositories.booking_repo import BookingRepository
from app.repositories.user_repo import UserRepository  # 🎯 Added
from app.repositories.trip_repo import TripRepository
from app.db.redis import redis_client
from app.db.redis import redis_mgr
from app.db.mongodb import db 
from pymongo import ReturnDocument

from app.core.config import settings
from fastapi import HTTPException, status
import logging
# Add this line to the top of your file
from typing import Optional, List, Any
from datetime import datetime, timezone, timedelta
from bson import ObjectId
logger = logging.getLogger("uvicorn.error")

class TripService:
    def __init__(self, redis_client=None):
        self.trip_repo = TripRepository()
        self.booking_repo = BookingRepository()
        self.user_repo = UserRepository()  # 🎯 Initialized
        self.redis = redis_client
        self.redis_manager = redis_mgr

    @property
    def collection(self):
        # This access is safe because it only runs when you call a method
        return db.db["trips"]
        
        
    # Add this to TripService class
    # Add this to the TripService class in app/services/trip_service.py
    def _to_id(self, id_val: Any) -> Optional[ObjectId]:
        if not id_val: return None
        try:
            return ObjectId(str(id_val)) if ObjectId.is_valid(str(id_val)) else None
        except Exception:
            return None

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
                    seat_layout: list[str], account_number: str, use_discount: bool, 
                    amount_paid: float): # 🎯 Add this
        
        frontend_amount = amount_paid
        t_id = str(trip_id)
        u_id = str(user_id)

        # 1. Fetch Trip & User Data (The Source of Truth)
        trip = await self.trip_repo.get_by_id(t_id)
        user = await self.user_repo.collection.find_one({"_id": self._to_id(u_id)})
        
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 2. 🎯 SECURE BACKEND PRICING CALCULATION
        loyalty = user.get("loyalty_meta", {})
        logger.info(f"DEBUG: Trip Data Received: {trip}")
        # Get the breakdown dict
        base_val = float(trip.get("price") or trip.get("base_price") or 0)
        
        breakdown = self.calculate_price_breakdown(
            base_price=base_val,
            loyalty_meta=loyalty,
            use_discount=use_discount,
            seat_layout=seat_layout
        
        )
        
        # Extract just the float value
        final_amount = breakdown["final_price"]
        
        if abs(final_amount - frontend_amount) > 1.0:
            logger.warning(f"PRICE MISMATCH: Frontend sent {frontend_amount}, Backend calculated {final_amount}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail={
                    "code": "PRICE_CHANGED", 
                    "message": "The trip fare has been updated.", 
                    "new_price": final_amount
                }
            )
        
        # 3. Locking logic (Keep your existing lock code...)
        lock_acquired = await self.redis_manager.acquire_seat_locks(t_id, seat_layout, u_id)
        if not lock_acquired:
            # 🎯 VERCEL FIX: Check if the existing lock belongs to THIS user
            # If they refreshed the page, don't lock them out of their own hold.
            is_mine = await self.redis_manager.client.get(f"lock:trip:{t_id}:seat:{seat_layout[0]}")
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
                amount=final_amount,  # 🎯 REPLACED amount_paid with final_amount
                trx_id=transaction_id,
                seat_layout=seat_layout,
                account_number=account_number ,
                use_discount=use_discount
            )

            if booking_id == "SEATS_TAKEN":
                await self.redis.release_seat_locks(t_id, seat_layout)
                raise HTTPException(status_code=400, detail="Seats are already booked.")

            await self.user_repo.set_active_trip(u_id, t_id)
            if trip.get("is_brokered"):
                seats_booked = len(seat_layout)
                profit = (trip["base_price"] - trip["cost_price"]) * seats_booked
                logger.critical(
                    f"🚨 CONCIERGE BOOKING TRIPPED! 🚨\n"
                    f"Passenger: {passenger_name} ({passenger_phone}) reserved {seats_booked} seats from {trip['origin']} to {trip['destination']}.\n"
                    f"ACTION REQUIRED: Call a local driver immediately. Secure rate under {trip['cost_price']} PKR.\n"
                    f"Net Commission Expected: {profit} PKR."
                )
            return booking_id

        except Exception as e:
            await self.redis_manager.release_seat_locks(t_id, seat_layout)
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
    
    
    async def update_trip_price(self, trip_id: str, driver_id: str, new_price: float):
        """
        Updates the fare for an upcoming trip.
        Ensures the trip belongs to the driver and has not started yet.
        """
        # 1. First, check if the trip exists and belongs to this driver
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found.")

        # 2. Authorization check
        if str(trip.get("driver_id")) != str(driver_id):
            raise HTTPException(status_code=403, detail="Unauthorized: You do not own this trip.")

        # 3. Status check: Only allow price updates if the trip is still 'scheduled'
        if trip.get("status") != "scheduled":
            raise HTTPException(
                status_code=400, 
                detail="Cannot update price for a trip that has already started or is completed."
            )

        # 4. Perform the update via repository
        success = await self.trip_repo.update_trip_price(trip_id, new_price)
        
        if not success:
            raise HTTPException(status_code=400, detail="Price update failed.")
            
        return {"status": "success", "message": "Trip fare updated successfully."}

    async def complete_trip(self, trip_id: str, driver_id: str):
        """Finalizes trip and clears active status for all participants."""
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

        if str(trip["driver_id"]) != str(driver_id):
            raise HTTPException(status_code=403, detail="Unauthorized.")

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

        # 3. REVENUE CALCULATION
        total_revenue = sum(
            float(b.get("total_price", 0)) 
            for b in manifest 
            if b.get("status") in ["confirmed", "completed"]
        )
        
        # 4. CLEANUP: Unlink passengers and Reset Referral Counts
        for booking in manifest:
            passenger_id = str(booking.get("passenger_id"))
            if passenger_id and passenger_id != "None":
                
                # Perform existing cleanup
                await self.user_repo.increment_completed_trips(passenger_id)
                await self.booking_repo.reward_user_for_trip(passenger_id)
                await self.user_repo.set_active_trip(passenger_id, None)

                # 🎯 NEW: Reset referral count ONLY if this specific booking used a discount
                # This ensures we only 'spend' the discount upon successful completion
                if booking.get("use_discount") == True:
                    await self.user_repo.collection.update_one(
                        {"_id": self._to_id(passenger_id)},
                        {"$set": {"loyalty_meta.referral_count": 0}}
                    )
                    logger.info(f"Referral discount consumed and reset for passenger {passenger_id}")

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
                # 🎯 ADD THESE TWO LINES
                "final_driver_phone": b.get("final_driver_phone", "No Contact"),
                "final_car_details": b.get("final_car_details", "Vehicle N/A"),
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
    
    
    async def bulk_schedule_brokered_trips(self, admin_id: str, bulk_data: dict):
        origin = bulk_data["origin"]
        destination = bulk_data["destination"]
        start_date_str = bulk_data["start_date"]
        days = bulk_data.get("days_to_schedule", 14)
        times = bulk_data["departure_times"]
        
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        created_trip_ids = []

        for i in range(days):
            current_day = start_date + timedelta(days=i)
            date_string = current_day.strftime("%Y-%m-%d")
            
            for departure_time in times:
                # 🎯 FIX: Construct the ISO string to match frontend expectations
                iso_departure_string = f"{date_string}T{departure_time}"
                
                # 1. Update the payload structure
                trip_payload = {
                    "driver_id": None, 
                    "managed_by_admin_id": self._to_id(admin_id),
                    "is_brokered": True,
                    "origin": origin,
                    "destination": destination,
                    "date": date_string,
                    "time": departure_time,
                    "departure_time": iso_departure_string,  # 🎯 ADDED THIS
                    "total_seats": bulk_data.get("total_seats", 4),
                    "available_seats": bulk_data.get("total_seats", 4),
                    "base_price": float(bulk_data["base_price"]),
                    "cost_price": float(bulk_data["cost_price"]),
                    "seat_layout": ["FL", "RL", "RC", "RR"],
                    "status": "scheduled",
                    "created_at": datetime.now(timezone.utc)
                }
                trip_id = await self.trip_repo.create_trip(trip_payload)
                created_trip_ids.append(str(trip_id))
                
        logger.warning(f"🎰 GHOST FLEET ACTIVATED: {len(created_trip_ids)} trips seeded.")
        return created_trip_ids


                


    @staticmethod
    def calculate_loyalty_tier(completed_trips: int) -> str:
        if completed_trips >= 150: return "Master Hero"
        if completed_trips >= 100: return "Diamond"
        if completed_trips >= 50: return "Gold"
        if completed_trips >= 20: return "Silver"
        return "Bronze"

    async def process_referral(self, referrer_id: str, new_user_id: str, fingerprint: str):
    # 1. Check for duplicate devices (Fraud Prevention)
        existing = await self.user_repo.find_user_by_fingerprint(fingerprint)
        if existing:
            await self.user_repo.create_audit_request(referrer_id, new_user_id, "Duplicate Device")
            return "PENDING_AUDIT"
    
    # 2. Atomic Increment and Tier Update
    # We use find_one_and_update to increment and get the NEW state in ONE query
        updated_user = await self.user_repo.collection.find_one_and_update(
            {"_id": ObjectId(referrer_id)},
            {"$inc": {"loyalty_meta.referral_count": 1}},
            return_document=ReturnDocument.AFTER
        )
    
        if not updated_user:
            return "ERROR_USER_NOT_FOUND"

    # 3. Logic for Tier Promotion
        current_count = updated_user.get("loyalty_meta", {}).get("referral_count", 0)
        current_tier = updated_user.get("loyalty_meta", {}).get("tier", "Bronze")
    
    # Calculate the new tier
        new_tier = self._calculate_tier(current_count)
    
    # Only update the database if the tier has actually changed (Saves database writes)
        if new_tier != current_tier:
            await self.user_repo.collection.update_one(
                {"_id": ObjectId(referrer_id)},
                {"$set": {"loyalty_meta.tier": new_tier}}
            )
            logger.info(f"User {referrer_id} promoted to {new_tier} tier!")

        return "APPROVED"
    
    # In trip_service.py

    def calculate_price_breakdown(self, base_price: float, loyalty_meta: dict, use_discount: bool, seat_layout: list):
        FRONT_SEAT_SURCHARGE = 2500
    
    # 1. Total Base Calculation (This part is correct in your snippet)
        total_base = 0
        for seat_id in seat_layout:
            total_base += (base_price + FRONT_SEAT_SURCHARGE) if seat_id == 'FL' else base_price
    
    # 2. MATCH THE FRONTEND LOGIC EXACTLY
    # The frontend is only using referral logic. 
    # If you want to include Tier discounts, you MUST update the frontend too.
    # For now, let's match the frontend logic (only referrals):
    
        referral_count = loyalty_meta.get("referral_count", 0)
        tiersEarned = referral_count // 4
        referralDiscountPercent = min(tiersEarned * 0.10, 0.50) # Cap at 50%
    
    # 3. Apply logic using Math.floor to match frontend exactly
        if use_discount:
        # Using int() is equivalent to Math.floor() for positive numbers
            final_price = int(total_base * (1 - referralDiscountPercent))
        else:
            final_price = int(total_base)
    
        return {
            "final_price": float(final_price),
            "discount_percent": referralDiscountPercent * 100
        }
    
class RatingService:
    def __init__(self, booking_repo, user_repo, redis_client=None):
        self.booking_repo = booking_repo
        self.user_repo = user_repo
        self.redis = redis_client
        
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
                