from models.driver_assignment import DriverAssignment
class DriverService:
    def __init__(self, driver_repo):
        self.driver_repo = driver_repo

    async def approve_and_assign(self, booking_id: str, driver_id: str, overwrites: dict = None):
        # 1. Get original driver info from DB
        original_driver = await self.driver_repo.get_driver_by_id(driver_id)
        if not original_driver:
            raise Exception("Driver not found")

        # 2. Logic: Priority to Overwrites, Fallback to Original Driver info
        # We ensure contact_1 and name always have a value
        final_data = DriverAssignment(
            booking_id=booking_id,
            driver_id=driver_id,
            display_name=overwrites.get("name") or original_driver.get("full_name"),
            contact_1=overwrites.get("contact_1") or original_driver.get("phone_number"),
            contact_2=overwrites.get("contact_2"), # Optional
            car_details=overwrites.get("car_details") or f"{original_driver.get('car_model')} - {original_driver.get('plate_no')}"
        )

        # 3. Persist the assignment
        return await self.driver_repo.save_assignment(final_data)