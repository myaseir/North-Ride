from __future__ import annotations
from fastapi import HTTPException, status
from app.repositories.driver_repo import DriverRepository
from models.driver_assignment import DriverAssignment  # 🎯 Explicitly imported here
import logging

logger = logging.getLogger("uvicorn.error")

class DriverService:
    def __init__(self):
        # Ensure consistency with your other services
        self.driver_repo = DriverRepository()

    async def approve_and_assign(self, booking_id: str, driver_id: str, overwrites: dict = None):
        # Guarantee overwrites is a dictionary to prevent AttributeError crashes
        safe_overwrites = overwrites or {}

        # 1. Get original driver info from DB
        original_driver = await self.driver_repo.get_driver_by_id(driver_id)
        if not original_driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Driver profile not found."
            )

        # Safely navigate the nested driver profile for vehicle data
        profile = original_driver.get("driver_profile", {})
        vehicle = profile.get("vehicle", {})

        # 2. Logic: Priority to Overwrites, Fallback to Original Driver info
        final_data = DriverAssignment(
            booking_id=booking_id,
            driver_id=driver_id,
            display_name=safe_overwrites.get("name") or original_driver.get("full_name") or original_driver.get("username", "Glacia Captain"),
            contact_1=safe_overwrites.get("contact_1") or original_driver.get("phone_number") or original_driver.get("phone", "No Contact"),
            contact_2=safe_overwrites.get("contact_2"), 
            
            # Align with your actual database structure
            car_details=safe_overwrites.get("car_details") or f"{vehicle.get('make_model', 'Vehicle')} - {vehicle.get('plate_number', 'N/A')}"
        )

        # 3. Persist the assignment
        return await self.driver_repo.save_assignment(final_data)