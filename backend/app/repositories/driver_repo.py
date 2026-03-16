from models.driver_assignment import DriverAssignment
class DriverRepository:
    def __init__(self, db):
        self.collection = db["driver_assignments"]

    async def save_assignment(self, assignment: DriverAssignment):
        # Convert Pydantic model to dict for DB insertion
        data = assignment.model_dump()
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_driver_by_id(self, driver_id: str):
        # Fetch the original driver profile from the main drivers table
        return await self.db["drivers"].find_one({"_id": driver_id})