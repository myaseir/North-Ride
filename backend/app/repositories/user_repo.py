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
            # Optional: del doc["_id"] if you want a clean JSON response
        return doc

    @property
    def collection(self):
        return db.db.users

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

    async def get_pending_drivers(self, limit: int = 50) -> List[dict]:
        """
        Review Queue: Fetches drivers waiting for approval.
        Added serialization to prevent 'Empty Object' frontend errors.
        """
        cursor = self.collection.find({
            "roles": "DRIVER",
            "is_approved": False,
            "is_driver": True  # Ensures we don't fetch previously rejected users
        }).sort("created_at", 1).limit(limit)
        
        docs = await cursor.to_list(length=limit)
        return [self._serialize_doc(d) for d in docs]

    async def admin_verify_driver(self, user_id: str, status: bool) -> bool:
        oid = self._to_id(user_id)
        if not oid: return False

        if status:
            # Approved
            update_query = {
                "$set": {
                    "is_approved": True,
                    "is_verified": True,
                    "driver_profile.is_verified": True, # Match your route logic
                    "driver_profile.approved_at": datetime.now(timezone.utc)
                }
            }
        else:
            # Rejected
            update_query = {
                "$set": {
                    "is_approved": False, # Keep false so they don't show in 'Approved' lists
                    "is_driver": False,
                    "driver_profile.is_verified": False
                },
                "$pull": {"roles": "DRIVER"} # Remove role so they vanish from 'Pending' list
            }

        result = await self.collection.update_one({"_id": oid}, update_query)
        return result.modified_count > 0

    async def update_wallet(self, user_id: str, amount: Any) -> bool:
        """Atomic wallet increment with strict type casting."""
        try:
        # Convert to float and round to 2 decimals to avoid floating point math errors
            clean_amount = round(float(amount), 2)
        
            result = await self.collection.update_one(
            {"_id": self._to_id(user_id)},
            {"$inc": {"wallet_balance": clean_amount}} # Ensure field name matches DB
            )
            return result.modified_count > 0
        except (ValueError, TypeError) as e:
            logger.error(f"❌ Wallet Update Failed: Invalid amount {amount} - {e}")
            return False

    async def get_pending_drivers(self, limit: int = 50) -> List[dict]:
        cursor = self.collection.find({
        "roles": "DRIVER",
        "is_approved": False
        }).sort("created_at", 1)
    
    # You MUST await the conversion to a list
        drivers = await cursor.to_list(length=limit)
        return drivers if drivers else []

    async def admin_verify_driver(self, user_id: str, status: bool):
        """
        Step 6: Admin approval logic.
        """
        oid = self._to_id(user_id)
        if not oid: return False

        if status:
            # Approved
            update_query = {
                "$set": {
                    "is_approved": True,
                    "is_verified": True,
                    "driver_profile.approved_at": datetime.now(timezone.utc)
                }
            }
        else:
            # Rejected: Strip driver capabilities but keep the user record
            update_query = {
                "$set": {
                    "is_approved": False,
                    "is_driver": False
                },
                "$pull": {"roles": "DRIVER"}
            }

        result = await self.collection.update_one({"_id": oid}, update_query)
        return result.modified_count > 0

    async def update_wallet(self, user_id: str, amount: float) -> bool:
        """Atomic wallet increment/decrement."""
        result = await self.collection.update_one(
            {"_id": self._to_id(user_id)},
            {"$inc": {"wallet_balance": round(amount, 2)}}
        )
        return result.modified_count > 0

    async def set_active_trip(self, user_id: str, trip_id: Optional[str]):
        """Locks/Unlocks a driver's status."""
        target_id = self._to_id(trip_id) if trip_id else None
        return await self.collection.update_one(
            {"_id": self._to_id(user_id)},
            {"$set": {"active_trip_id": target_id}}
        )