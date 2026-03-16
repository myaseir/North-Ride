from app.repositories.booking_repo import BookingRepository
from app.repositories.user_repo import UserRepository
from app.services.notification_service import NotificationService
from app.repositories.trip_repo import TripRepository
import logging

logger = logging.getLogger("uvicorn.error")

class TravelAdminService:
    def __init__(self):
        self.booking_repo = BookingRepository()
        self.user_repo = UserRepository()
        self.trip_repo = TripRepository()
        self.notif_service = NotificationService()

    # 🎯 FIX: Indented inside the class
    async def verify_and_confirm_booking(self, booking_id: str, driver_id: str, overwrites: dict = None):
        """
        The Fixed 'Gold Flow': 
        1. Fetches base driver data.
        2. Merges overwrites (Admin inputs) with base data.
        3. Passes merged data to booking_repo to update BOTH Booking and Trip collections.
        """
        
        # 1. Gather Driver info from DB as the "Base" layer first
        original_driver = await self.user_repo.get_by_id(driver_id)
        if not original_driver:
            return {"success": False, "error": "Assigned driver ID does not exist in the system."}

        # 2. Merge Logic: Defensive dictionary access for driver_profile
        profile = original_driver.get('driver_profile') or {}
        
        final_overwrites = {
            "name": (overwrites.get("name") if overwrites and overwrites.get("name") else None) 
                    or original_driver.get("full_name", "Professional Captain"),
            
            "contact_1": (overwrites.get("contact_1") if overwrites and overwrites.get("contact_1") else None) 
                         or original_driver.get("phone", "Contact via App"),
            
            "contact_2": overwrites.get("contact_2") if overwrites else None,
            
            "car_details": (overwrites.get("car_details") if overwrites and overwrites.get("car_details") else None) 
                           or f"{profile.get('car_model', 'Vehicle')} - {profile.get('plate_no', 'N/A')}"
        }

        # 3. Update the Database via Repository
        booking_success = await self.booking_repo.mark_as_confirmed(booking_id, overwrites=final_overwrites)
        
        if not booking_success:
            return {"success": False, "error": "Booking not found or already processed."}
        
        if booking_success == "NO_SEATS":
            return {"success": False, "error": "Cannot confirm: The cabin reached full capacity."}

        # 4. Re-fetch for notification metadata (Passenger ID, Trip ID)
        booking = await self.booking_repo.get_by_id(booking_id)

        # 5. Notification Logic
        try:
            if booking:
                user = await self.user_repo.get_by_id(str(booking.get("passenger_id")))
                trip = await self.trip_repo.get_by_id(str(booking.get("trip_id")))
                
                if user and trip:
                    await self.notif_service.send_booking_confirmation(
                        user_email=user["email"],
                        user_name=user["username"],
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