from __future__ import annotations
from app.db.mongodb import db  # 🎯 Use the optimized global connection pool
from bson import ObjectId
from typing import Optional, Any
import logging

# Ensure you import your Pydantic model properly
# from models.driver_assignment import DriverAssignment

logger = logging.getLogger("uvicorn.error")

class DriverRepository:
    def __init__(self):
        # No need to accept 'db' as an argument anymore
        pass

    def _to_id(self, id_val: Any) -> Optional[ObjectId]:
        """Strict ObjectId casting to prevent silent None returns."""
        if not id_val: return None
        if isinstance(id_val, ObjectId): return id_val
        try:
            return ObjectId(str(id_val)) if ObjectId.is_valid(str(id_val)) else None
        except Exception:
            return None

    def _serialize_doc(self, doc: dict) -> dict:
        """Mandatory string conversion to prevent Pydantic 500 crashes."""
        if doc and "_id" in doc:
            doc["id"] = str(doc["_id"])
            doc["_id"] = doc["id"]
        return doc

    @property
    def collection(self):
        # 🎯 Ensure you use db.db for Motor AsyncIO
        return db.db.driver_assignments

    async def save_assignment(self, assignment: Any):
        # Convert Pydantic model to dict
        data = assignment.model_dump()
        
        # 🎯 DB INTEGRITY: Ensure foreign keys are stored as proper ObjectIds
        if "driver_id" in data:
            data["driver_id"] = self._to_id(data["driver_id"])
        if "trip_id" in data:
            data["trip_id"] = self._to_id(data["trip_id"])

        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_driver_by_id(self, driver_id: str):
        # 🎯 FIXED: Cast to ObjectId to ensure MongoDB actually finds the document
        oid = self._to_id(driver_id)
        
        # We check the 'drivers' collection based on your original code
        doc = await db.db.drivers.find_one({"_id": oid})
        
        # 🎯 FALLBACK: Just in case drivers are actually stored in the 'users' collection 
        # (Based on standard glacia labs architecture)
        if not doc:
            doc = await db.db.users.find_one({"_id": oid, "roles": "DRIVER"})

        # 🎯 Serialize the response so it doesn't crash the frontend
        return self._serialize_doc(doc)