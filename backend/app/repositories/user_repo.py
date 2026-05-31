from __future__ import annotations
from app.db.mongodb import db 
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, Any, List
import logging

logger = logging.getLogger("uvicorn.error")

class UserRepository:
    def __init__(self):
        pass

    def _to_id(self, id_val: Any) -> Optional[ObjectId]:
        if not id_val: return None
        try:
            return ObjectId(str(id_val)) if ObjectId.is_valid(str(id_val)) else None
        except Exception:
            return None

    def _serialize_doc(self, doc: dict) -> dict:
        """Helper to convert ObjectId to string for JSON compatibility."""
        if doc and "_id" in doc:
            doc["id"] = str(doc["_id"])
            doc["_id"] = doc["id"] # Guarantee consistency for Pydantic
        return doc

    @property
    def collection(self):
        return db.db.users

    async def create_user(self, user_data: dict) -> str:
        """Inserts a new passenger/user document."""
        result = await self.collection.insert_one(user_data)
        return str(result.inserted_id)

    async def create_driver_application(self, driver_data: dict) -> str:
        """Inserts a new driver application document."""
        result = await self.collection.insert_one(driver_data)
        return str(result.inserted_id)
    
    async def get_by_email(self, email: str) -> Optional[dict]:
        """Fetches a user by email for login/auth."""
        try:
            doc = await self.collection.find_one({"email": email})
            return self._serialize_doc(doc) if doc else None
        except Exception as e:
            logger.error(f"❌ Error fetching user by email: {e}")
            return None
            
    async def get_by_id(self, user_id: str):
        doc = await self.collection.find_one({"_id": self._to_id(user_id)})
        return self._serialize_doc(doc)

    # 🎯 MERGED: get_pending_drivers (Kept serialization and strict filtering)
    async def get_pending_drivers(self, limit: int = 50) -> List[dict]:
        """
        Review Queue: Fetches drivers waiting for approval.
        Uses serialization to prevent 'Empty Object' frontend errors.
        """
        cursor = self.collection.find({
            "roles": "DRIVER",
            "is_approved": False,
            "is_driver": True  # Ensures we don't fetch previously rejected users
        }).sort("created_at", 1).limit(limit)
        
        docs = await cursor.to_list(length=limit)
        return [self._serialize_doc(d) for d in docs]

    # 🎯 MERGED: admin_verify_driver (Kept the detailed driver_profile updates)
    async def admin_verify_driver(self, user_id: str, status: bool) -> bool:
        """
        Admin approval logic. Automatically synchronizes published 
        trip states when a captain profile changes approval status.
        """
        oid = self._to_id(user_id)
        if not oid: 
            return False

        if status:
            # Approved
            update_query = {
                "$set": {
                    "is_approved": True,
                    "is_verified": True,
                    "driver_profile.verification_status": "approved",
                    "driver_profile.is_verified": True, 
                    "driver_profile.approved_at": datetime.now(timezone.utc)
                }
            }
            
            # 🎯 STATE SYNC: Ensure pre-published trips by this driver 
            # become active and visible in the passenger feed search engines
            await db.db.trips.update_many(
                {"driver_id": oid, "status": "scheduled"},
                {"$set": {"is_driver_approved": True, "updated_at": datetime.now(timezone.utc)}}
            )
        else:
            # Rejected: Strip driver capabilities but preserve the base passenger profile account
            update_query = {
                "$set": {
                    "is_approved": False, 
                    "is_driver": False,
                    "driver_profile.is_verified": False,
                    "driver_profile.verification_status": "rejected"
                },
                "$pull": {"roles": "DRIVER"} # Removes role so they vanish from pending review logs
            }
            
            # 🎯 STATE SYNC: If rejected, pull down their upcoming scheduled trips automatically
            await db.db.trips.update_many(
                {"driver_id": oid, "status": "scheduled"},
                {"$set": {
                    "status": "cancelled", 
                    "system_note": "Captain verification profile was rejected by Admin dispatch team.",
                    "updated_at": datetime.now(timezone.utc)
                }}
            )

        result = await self.collection.update_one({"_id": oid}, update_query)
        return result.modified_count > 0

    # 🎯 MERGED: update_wallet (Kept the safe float casting and error handling)
    async def update_wallet(self, user_id: str, amount: Any) -> bool:
        """Atomic wallet increment with strict type casting."""
        try:
            # Convert to float and round to 2 decimals to avoid floating point math errors
            clean_amount = round(float(amount), 2)
            
            result = await self.collection.update_one(
                {"_id": self._to_id(user_id)},
                {"$inc": {"wallet_balance": clean_amount}} 
            )
            return result.modified_count > 0
        except (ValueError, TypeError) as e:
            logger.error(f"❌ Wallet Update Failed: Invalid amount {amount} - {e}")
            return False

    async def set_active_trip(self, user_id: str, trip_id: Optional[str]):
        """Locks/Unlocks a driver or passenger's status."""
        target_id = self._to_id(trip_id) if trip_id else None
        return await self.collection.update_one(
            {"_id": self._to_id(user_id)},
            {"$set": {"active_trip_id": target_id}}
        )
        
    async def update_driver_average_rating(self, driver_id: str, new_avg: float, count: int):
        """Updates the driver's public profile with their latest rating stats."""
        await self.collection.update_one(
            {"_id": self._to_id(driver_id)},
            {"$set": {
                "rating_avg": round(new_avg, 1),
                "rating_count": count
            }}
        )