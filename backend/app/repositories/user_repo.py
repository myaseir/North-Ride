from __future__ import annotations
from app.db.mongodb import db 
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, Any, List
import logging
from pymongo import ReturnDocument
logger = logging.getLogger("uvicorn.error")

class UserRepository:
    def __init__(self):
        pass
    
    @property
    def collection(self):
        # 🎯 This is the ONLY source of truth. 
        # It retrieves the live reference from 'db' every time it's accessed.
        # This will return the correct collection after connection.
        return db.users

    def _to_id(self, id_val: Any) -> Optional[ObjectId]:
        if not id_val: return None
        try:
            return ObjectId(str(id_val)) if ObjectId.is_valid(str(id_val)) else None
        except Exception:
            return None

    def _serialize_doc(self, doc):
        """Recursively converts ObjectIds to strings in lists and dicts."""
        if isinstance(doc, list):
            return [self._serialize_doc(i) for i in doc]
        elif isinstance(doc, dict):
            return {k: self._serialize_doc(v) for k, v in doc.items()}
        elif isinstance(doc, ObjectId):
            return str(doc)
        return doc

   

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
        


    # 🎯 NEW: Set the loyalty tier badge
    async def set_loyalty_tier(self, user_id: str, tier_name: str):
        """Updates the user's loyalty rank (Bronze, Silver, Gold, etc.)."""
        await self.collection.update_one(
            {"_id": self._to_id(user_id)},
            {"$set": {"loyalty_meta.tier": tier_name}}
        )
    
    async def find_user_by_fingerprint(self, fingerprint: str):
        """Finds a user who has previously registered with this device."""
        if not fingerprint:
            return None
        # This searches your collection for the fingerprint
        return await self.collection.find_one({"device_fingerprint": fingerprint})
    
    async def create_audit_request(self, referrer_id: str, new_user_id: str, reason: str):
        """Logs a suspicious referral for admin review."""
        audit_data = {
            "referrer_id": referrer_id,
            "new_user_id": new_user_id,
            "reason": reason,
            "status": "pending",
            "created_at": datetime.now(timezone.utc)
        }
        # 🎯 FIX: Access the collection via dictionary syntax to bypass the missing attribute
        return await db.db["audit_requests"].insert_one(audit_data)
    
    # In app/repositories/user_repo.py

    async def get_pending_audit_requests_enriched(self) -> list:
        pipeline = [
        # 1. Filter
            {"$match": {"status": "pending"}},
        
        # 2. Lookup New User (Joined by _id)
            {"$addFields": {"new_user_oid": {"$toObjectId": "$new_user_id"}}},
            {"$lookup": {
                "from": "users",
                "localField": "new_user_oid",
                "foreignField": "_id",
                "as": "user_details"
            }},
            {"$unwind": {"path": "$user_details", "preserveNullAndEmptyArrays": True}},

        # 3. Lookup Referrer (Joined by personal_referral_code)
            {"$lookup": {
                "from": "users",
                "localField": "referrer_id", 
                "foreignField": "personal_referral_code", 
                "as": "referrer_details"
            }},
            {"$unwind": {"path": "$referrer_details", "preserveNullAndEmptyArrays": True}}
        ]
    
        cursor = db.db["audit_requests"].aggregate(pipeline)
        results = await cursor.to_list(length=100)
        return [self._serialize_doc(d) for d in results]
    
    async def get_pending_referrals_by_activity(self) -> List[dict]:
        """2. Fetches referrals who haven't completed a trip yet."""
        # Query users who have a referrer but 0 completed trips
        cursor = self.collection.find({
            "referred_by": {"$ne": None},
            "loyalty_meta.completed_trips": 0
        })
        results = await cursor.to_list(length=100)
        return [self._serialize_doc(d) for d in results]
        
  
    async def get_referrals_by_code(self, referral_code: str) -> List[dict]:
        """Finds all passengers who joined using this code."""
        # 🎯 Ensure 'loyalty_meta' is included in the projection
        cursor = self.collection.find(
            {"referred_by": referral_code},
            {
                "username": 1, 
                "loyalty_meta": 1,  # <--- MUST BE HERE
                "created_at": 1
            }
        )
        return await cursor.to_list(length=50)
    
    async def increment_completed_trips(self, user_id: str):
        # Change return_document=True to ReturnDocument.AFTER
        result = await self.collection.find_one_and_update(
            {"_id": self._to_id(user_id)},
            {"$inc": {"loyalty_meta.completed_trips": 1}},
            return_document=ReturnDocument.AFTER 
        )
        return result
        
        