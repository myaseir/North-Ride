from app.repositories.trip_repo import TripRepository
from app.repositories.booking_repo import BookingRepository
from app.repositories.user_repo import UserRepository  # 🎯 Added
from app.db.redis import redis_mgr 
from fastapi import HTTPException, status
import logging

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
        sender_name: str, 
        trip_id: str, 
        transaction_id: str, 
        seat_layout: list[str],
        account_number: str,  # 🎯 NEW: Accept from route
        amount_paid: float     # 🎯 NEW: Accept from route
    ):
        """
        Locks seats in Redis and creates a Pending Booking + Links Passenger.
        """
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

        if trip.get("status") != "scheduled":
            raise HTTPException(status_code=400, detail="Trip no longer accepting bookings.")

    # 🛡️ REDIS SAFETY: Only attempt lock if Redis is actually connected
    # This prevents the [getaddrinfo failed] error from crashing the booking
        lock_acquired = True
        try:
            lock_acquired = await self.redis.acquire_seat_locks(trip_id, seat_layout)
        except Exception as redis_err:
            logger.warning(f"Redis unavailable, skipping lock: {redis_err}")
        # We continue so the user can still book even if Redis is down

        if not lock_acquired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="Seats are currently on hold by another user."
            )

        try:
        # 🎯 Pass the new fields to your repository
            booking_id = await self.booking_repo.create_pending(
                user_id=user_id,
                passenger_name=sender_name,
                trip_id=trip_id,
                amount=amount_paid,      # Use the verified amount from frontend
                trx_id=transaction_id,
                seat_layout=seat_layout,
                account_number=account_number # 🎯 Ensure repo handles this
            )

            if booking_id == "ALREADY_BOOKED":
                try:
                    await self.redis.release_seat_locks(trip_id, seat_layout)
                except: pass
                raise HTTPException(status_code=400, detail="User already has a booking.")

        # Link the passenger to this trip for /api/trips/active
            await self.user_repo.set_active_trip(user_id, trip_id)

            return booking_id

        except Exception as e:
        # Clean up Redis on failure
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

        manifest = await self.booking_repo.get_trip_manifest(trip_id)
        total_revenue = sum(b.get("amount", 0) for b in manifest if b["status"] == "confirmed")
        
        # 1. Update Trip Status
        await self.trip_repo.update_trip_status(trip_id, "completed")

        # 2. 🎯 CLEANUP: Unlink all passengers so they can book again
        for booking in manifest:
            passenger_id = str(booking.get("passenger_id"))
            await self.user_repo.set_active_trip(passenger_id, None)

        # 3. 🎯 CLEANUP: Unlink the driver
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
        """Search logic for passengers."""
        if not origin or not destination:
            raise HTTPException(status_code=400, detail="Origin and Destination required.")
        return await self.trip_repo.find_trips(origin, destination, date_str)