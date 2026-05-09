from __future__ import annotations
from app.db.mongodb import db
from bson import ObjectId
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Any
import logging

logger = logging.getLogger("uvicorn.error")

class TripRepository:
    def __init__(self):
        pass

    def _to_id(self, id_val: Any) -> Optional[ObjectId]:
        """Safe conversion to ObjectId, handling strings and already-converted ObjectIds."""
        if not id_val: return None
        if isinstance(id_val, ObjectId):
            return id_val
        try:
            return ObjectId(str(id_val)) if ObjectId.is_valid(str(id_val)) else None
        except Exception:
            return None

    def _format_trip(self, trip: dict) -> dict:
        """Helper to ensure IDs are strings for JSON serialization."""
        if trip:
            trip["id"] = str(trip.get("_id"))
            trip["_id"] = trip["id"]
            if "driver_id" in trip:
                trip["driver_id"] = str(trip["driver_id"])
        return trip

    @property
    def collection(self):
        return db.db.trips

    async def create_trip(self, trip_data: dict) -> str:
        """
        Saves a trip. Fixes the 7-hour timezone shift by prioritizing 
        the local time string sent from the frontend.
        """
        # 1. 🎯 FIX: Store driver_id strictly as an ObjectId to maintain database integrity
        if "driver_id" in trip_data:
            trip_data["driver_id"] = self._to_id(trip_data["driver_id"])
        
        trip_data["origin"] = trip_data.get("origin", "").strip().lower()
        trip_data["destination"] = trip_data.get("destination", "").strip().lower()
        
        # 🎯 THE TIMEZONE & 7-HOUR FIX
        if "departure_time" in trip_data:
            dt = trip_data["departure_time"]
            
            # Convert ISO string to datetime object
            if isinstance(dt, str):
                dt_obj = datetime.fromisoformat(dt.replace('Z', '+00:00'))
            else:
                dt_obj = dt

            # 1. PRESERVE DATE: Use provided date or extract from object
            if "date" not in trip_data or not trip_data["date"]:
                trip_data["date"] = dt_obj.strftime('%Y-%m-%d')
            
            # 2. PRESERVE TIME: Keep frontend time if provided, else format from object
            if "time" not in trip_data or not trip_data["time"]:
                trip_data["time"] = dt_obj.strftime('%H:%M')
            
            # Ensure the database stores the object for proper sorting
            trip_data["departure_time"] = dt_obj
        
        # 2. Set standard defaults
        trip_data["status"] = trip_data.get("status", "scheduled")
        trip_data["created_at"] = datetime.now(timezone.utc)
        trip_data["available_seats"] = trip_data.get("total_seats", 4)
        
        if "seat_layout" not in trip_data:
            trip_data["seat_layout"] = ["FL", "RL", "RC", "RR"]
        
        # 3. Insert into MongoDB
        result = await self.collection.insert_one(trip_data)
        return str(result.inserted_id)

    async def find_trips(self, origin: str, destination: str, date_str: Optional[str] = None) -> List[dict]:
        """Finds trips matching the exact date with live Driver Info Enrichment."""
        match_query = {
            "origin": origin.strip().lower(),
            "destination": destination.strip().lower(),
            "status": "scheduled",
            "available_seats": {"$gt": 0}
        }
        if date_str:
            match_query["date"] = date_str

        return await self._execute_enriched_search(match_query)

    async def get_driver_active_trip(self, driver_id: str) -> Optional[dict]:
        """Fetches the current active trip for a driver and attaches profile details."""
        oid = self._to_id(driver_id)
        query = {
            "driver_id": oid,
            "status": {"$in": ["scheduled", "in-progress"]}
        }
        trip = await self.collection.find_one(query)
        if not trip:
            return None

        driver = await db.db.users.find_one({"_id": oid})
        if driver:
            trip["listing_driver_name"] = driver.get("full_name", "Captain")
            trip["listing_driver_phone"] = driver.get("phone", "No Contact")
            if "car_details" not in trip:
                trip["car_details"] = driver.get("driver_profile", {}).get("car_details", "Vehicle N/A")

        return self._format_trip(trip)

    async def update_trip_status(self, trip_id: str, new_status: str) -> bool:
        """Updates trip status (scheduled -> in-progress -> completed)."""
        result = await self.collection.update_one(
            {"_id": self._to_id(trip_id)},
            {"$set": {"status": new_status}}
        )
        return result.modified_count > 0

    async def get_by_id(self, trip_id: str) -> Optional[dict]:
        """Fetch a single trip's details."""
        trip = await self.collection.find_one({"_id": self._to_id(trip_id)})
        return self._format_trip(trip)
        
    async def get_history(self, driver_id: str) -> list[dict]:
        """Fetches past trips for history logs."""
        query = {
            "driver_id": self._to_id(driver_id), # 🎯 FIX: Query strictly as ObjectId
            "status": {"$in": ["completed", "cancelled"]}
        }
        cursor = self.collection.find(query).sort("created_at", -1)
        trips = await cursor.to_list(length=50)
        return [self._format_trip(t) for t in trips]

    async def find_upcoming_trips(self, origin: str, destination: str, date_str: str, limit: int = 20) -> List[dict]:
        """Finds fallback trips for future dates."""
        match_query = {
            "origin": origin.strip().lower(),
            "destination": destination.strip().lower(),
            "status": "scheduled",
            "available_seats": {"$gt": 0}
        }
        if date_str:
            match_query["date"] = {"$gt": date_str} 

        return await self._execute_enriched_search(match_query, limit)
    
    async def _execute_enriched_search(self, match_query: dict, limit: int = 100) -> List[dict]:
        """Private method to execute aggregation with User collection joins."""
        pipeline = [
            {"$match": match_query},
            {
                # 🎯 SERVERLESS OPTIMIZATION: Because we store driver_id as an ObjectId now,
                # we can drop the heavy $expr/$toObjectId pipeline and do a standard native lookup.
                # This executes significantly faster on Atlas.
                "$lookup": {
                    "from": "users",
                    "localField": "driver_id",
                    "foreignField": "_id",
                    "as": "driver_info"
                }
            },
            {"$unwind": {"path": "$driver_info", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "listing_driver_name": { "$ifNull": ["$driver_info.full_name", "$driver_info.username", "Glacia Captain"] },
                    "rating_avg": { "$ifNull": ["$driver_info.rating_avg", "$driver_info.driver_rating", 0] },
                    "rating_count": { "$ifNull": ["$driver_info.rating_count", "$driver_info.review_count", 0] }
                }
            },
            {"$project": {"driver_info": 0}},
            {"$sort": {"departure_time": 1, "rating_avg": -1, "price": 1}},
            {"$limit": limit}
        ]
        
        cursor = self.collection.aggregate(pipeline)
        trips = await cursor.to_list(length=limit)
        return [self._format_trip(t) for t in trips]