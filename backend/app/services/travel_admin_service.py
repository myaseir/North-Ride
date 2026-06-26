from app.repositories.booking_repo import BookingRepository
from app.repositories.user_repo import UserRepository
from app.services.notification_service import NotificationService
from app.repositories.trip_repo import TripRepository
from app.db.redis import redis_mgr  # 🎯 IMPORT REDIS
import logging
from bson import ObjectId
from typing import Optional, Any

logger = logging.getLogger("uvicorn.error")

class TravelAdminService:
    def __init__(self):
        self.booking_repo = BookingRepository()
        self.user_repo = UserRepository()
        self.trip_repo = TripRepository()
        self.notif_service = NotificationService()
        self.redis = redis_mgr # 🎯 INITIALIZE REDIS

    def _to_id(self, id_val: Any) -> Optional[ObjectId]:
        """Safe conversion of string/any to MongoDB ObjectId."""
        if not id_val: return None
        try:
            return ObjectId(str(id_val)) if ObjectId.is_valid(str(id_val)) else None
        except Exception:
            return None
    async def verify_and_confirm_booking(self, booking_id: str, driver_id: str, overwrites: dict = None):
        """
        The Fixed 'Gold Flow': 
        1. Fetches base driver data.
        2. Merges overwrites (Admin inputs) with base data.
        3. Passes merged data to booking_repo to update BOTH Booking and Trip collections.
        4. Releases Redis locks.
        """
        
        # 1. Gather Driver info from DB as the "Base" layer first
        original_driver = await self.user_repo.get_by_id(driver_id)
        if not original_driver:
            return {"success": False, "error": "Assigned driver ID does not exist in the system."}

        # 2. Merge Logic: Defensive dictionary access for driver_profile and vehicle
        profile = original_driver.get('driver_profile') or {}
        vehicle = profile.get('vehicle') or {} # 🎯 FIX: Safely access nested vehicle data
        
        final_overwrites = {
            "name": (overwrites.get("name") if overwrites and overwrites.get("name") else None) 
                    or original_driver.get("full_name", "Professional Captain"),
            
            "contact_1": (overwrites.get("contact_1") if overwrites and overwrites.get("contact_1") else None) 
                         or original_driver.get("phone", original_driver.get("phone_number", "Contact via App")),
            
            "contact_2": overwrites.get("contact_2") if overwrites else None,
            
            # 🎯 FIX: Align with your auth.py and driver database schema
            "car_details": (overwrites.get("car_details") if overwrites and overwrites.get("car_details") else None) 
                           or f"{vehicle.get('model', vehicle.get('make_model', 'Vehicle'))} - {vehicle.get('plate', vehicle.get('plate_number', 'N/A'))}"
        }

        # 3. Update the Database via Repository
        booking_success = await self.booking_repo.mark_as_confirmed(booking_id, overwrites=final_overwrites)
        
        if not booking_success:
            return {"success": False, "error": "Booking not found or already processed."}
        
        if booking_success == "NO_SEATS":
            return {"success": False, "error": "Cannot confirm: The cabin reached full capacity."}

        # 4. Re-fetch for notification metadata & Redis Cleanup
        booking = await self.booking_repo.get_by_id(booking_id)

        if booking:
            # 🎯 CRITICAL FIX: Destroy the Redis lock so the system knows the seats are permanently handled
            await self.redis.release_seat_locks(
                str(booking.get("trip_id")), 
                booking.get("seat_layout", [])
            )

            # 5. Notification Logic
            try:
                user = await self.user_repo.get_by_id(str(booking.get("passenger_id")))
                trip = await self.trip_repo.get_by_id(str(booking.get("trip_id")))
                
                if user and trip:
                    await self.notif_service.send_booking_confirmation(
                        user_email=user["email"],
                        user_name=user.get("username", user.get("full_name", "Passenger")),
                        trip_details=trip,
                        driver_info=final_overwrites 
                    )
            except Exception as e:
                logger.error(f"Notification failure for booking {booking_id}: {e}")

        return {
            "success": True, 
            "booking_id": booking_id, 
            "driver_assigned": final_overwrites["name"],
            "car": final_overwrites["car_details"]
        }
        
    
    
    async def get_all_fleet_trips(self):
        """Fetches all trips for the admin radar, including the full passenger manifest."""
        pipeline = [
            {"$sort": {"created_at": -1}},
            {"$limit": 150},
            {
                # Join the bookings collection to get exactly who booked
                "$lookup": {
                    "from": "bookings",
                    "localField": "_id",
                    "foreignField": "trip_id",
                    "as": "manifest"
                }
            }
        ]
        
        trips = await self.trip_repo.collection.aggregate(pipeline).to_list(length=150)
        
        formatted = []
        for t in trips:
            ft = self.trip_repo._format_trip(t)
            
            # Clean and attach the manifest
            manifest_clean = []
            confirmed_pax_count = 0
            
            for b in t.get("manifest", []):
                clean_b = self.booking_repo._format_booking(b)
                manifest_clean.append(clean_b)
                
                # Accurately count seats taken by confirmed passengers
                if clean_b.get("status") in ["confirmed", "completed"]:
                    confirmed_pax_count += len(clean_b.get("seat_layout", [1]))
            
            ft["manifest"] = manifest_clean
            ft["confirmed_pax_count"] = confirmed_pax_count
            formatted.append(ft)
            
        return formatted

    async def force_trip_status(self, trip_id: str, new_status: str):
        """ADMIN OVERRIDE: Manually forces a trip into a new state."""
        from datetime import datetime, timezone

        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip: return {"success": False, "error": "Trip not found."}

        # 1. FORCE START
        if new_status == "in-progress":
            await self.trip_repo.update_trip_status(trip_id, "in-progress")
            return {"success": True, "message": "Trip manually started."}

        # 2. FORCE COMPLETE
        elif new_status == "completed":
            # 🎯 1. FETCH MANIFEST FIRST
            manifest = await self.booking_repo.get_trip_manifest(trip_id)
            
            # 🎯 2. INCREMENT LOYALTY & RESET DISCOUNT
            for b in manifest:
                p_id = str(b.get("passenger_id"))
                if p_id and p_id != "None":
                    # Existing loyalty logic
                    await self.user_repo.increment_completed_trips(p_id)
                    await self.user_repo.set_active_trip(p_id, None)
                    
                    # 🎯 NEW: Reset referral count ONLY if this specific booking used a discount
                    if b.get("use_discount") == True:
                        await self.user_repo.collection.update_one(
                            {"_id": self._to_id(p_id)},
                            {"$set": {"loyalty_meta.referral_count": 0}}
                        )
                        logger.info(f"Discount consumed for passenger {p_id} via Admin Force-Complete.")

            # 3. NOW UPDATE STATUS
            await self.trip_repo.update_trip_status(trip_id, "completed")
            await self.booking_repo.collection.update_many(
                {"trip_id": self.booking_repo._to_id(trip_id), "status": "confirmed"},
                {"$set": {
                    "status": "completed", 
                    "payout_status": "pending", 
                    "completed_at": datetime.now(timezone.utc)
                }}
            )
            
            # 4. Unlink driver
            d_id = str(trip.get("driver_id"))
            if d_id and d_id != "None":
                await self.user_repo.set_active_trip(d_id, None)

            return {"success": True, "message": "Trip manually completed. Ledger and Loyalty updated."}
        
        # 3. FORCE CANCEL / REJECT
        elif new_status == "cancelled":
            await self.trip_repo.update_trip_status(trip_id, "cancelled")
            await self.booking_repo.collection.update_many(
                {"trip_id": self.booking_repo._to_id(trip_id), "status": {"$in": ["pending", "confirmed"]}},
                {"$set": {"status": "cancelled", "cancellation_reason": "Admin manually cancelled trip"}}
            )
            return {"success": True, "message": "Trip cancelled and bookings voided."}

        return {"success": False, "error": "Invalid status."}