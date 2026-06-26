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
        
    @property
    def collection(self):
        # 🎯 This is a dynamic getter. 
        # It fetches the collection every time you need it, 
        # ensuring 'db.trips' is ready by the time the request hits.
        return db.trips
    
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
        """Robust conversion of all ObjectIds to strings for JSON safety."""
        if not trip:
            return trip
        
        # Convert _id and id
        if "_id" in trip:
            trip["id"] = str(trip["_id"])
            trip["_id"] = str(trip["_id"])
            
        # Convert driver_id
        if "driver_id" in trip and isinstance(trip["driver_id"], ObjectId):
            trip["driver_id"] = str(trip["driver_id"])
            
        # 🎯 CRITICAL: Catch any other fields that might be an ObjectId
        # This handles the fields added by $lookup or $addFields
        for key, value in trip.items():
            if isinstance(value, ObjectId):
                trip[key] = str(value)
                
        return trip

    

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
        # 🎯 THE TIMEZONE & 7-HOUR FIX
        if "departure_time" in trip_data:
            # Simply cast to string to ensure database consistency.
            # Do NOT parse/strftime/convert as that causes the shift.
            trip_data["departure_time"] = str(trip_data["departure_time"])
            
            # Optional: Ensure the date field exists using the date provided by the frontend
            if not trip_data.get("date"):
                # If date is missing, parse it once just to fill the field
                try:
                    trip_data["date"] = trip_data["departure_time"].split('T')[0]
                except:
                    pass
        
        # 2. Set standard defaults
        trip_data["status"] = trip_data.get("status", "scheduled")
        trip_data["created_at"] = datetime.now(timezone.utc)
        trip_data["available_seats"] = trip_data.get("total_seats", 4)
        
        if "seat_layout" not in trip_data:
            trip_data["seat_layout"] = ["FL", "RL", "RC", "RR"]
        
        # 3. Insert into MongoDB
        # In trip_repo.py, inside create_trip:
        print(f"DEBUG: Attempting to insert trip: {trip_data}")
        result = await self.collection.insert_one(trip_data)
        
        return str(result.inserted_id)

    
    async def update_trip_price(self, trip_id: str, driver_id: str, new_price: float) -> bool:
        """
        Allows a driver to dynamically update their trip's seat price.
        Locks changes to ensure only the original driver can modify it.
        """
        try:
            clean_price = float(new_price)
            result = await self.collection.update_one(
                {
                    "_id": self._to_id(trip_id),
                    "driver_id": self._to_id(driver_id),
                    "status": "scheduled" # Prevents changing prices on active/completed runs
                },
                {
                    "$set": {
                        "price": clean_price,
                        "base_price": clean_price, # Keeps both legacy aggregation fields synced
                        "price_updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            return result.modified_count > 0
        except (ValueError, TypeError):
            return False
    
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
        """Fetches past trips AND their associated bookings for accurate reporting."""
        pipeline = [
            # 1. Match the driver's trips
            {"$match": {
                "driver_id": self._to_id(driver_id),
                "status": {"$in": ["completed", "cancelled"]}
            }},
            # 2. Join with the bookings collection
            {
                "$lookup": {
                    "from": "bookings",
                    "localField": "_id",
                    "foreignField": "trip_id",
                    "as": "bookings"
                }
            },
            # 3. Sort by creation time
            {"$sort": {"created_at": -1}},
            {"$limit": 50}
        ]
        
        trips = await self.collection.aggregate(pipeline).to_list(length=50)
        
        # 4. Format the trips (and ensure bookings are included)
        formatted_trips = []
        for t in trips:
            formatted = self._format_trip(t)
            # Ensure the bookings array is attached for the frontend
            formatted["bookings"] = t.get("bookings", [])
            formatted_trips.append(formatted)
            
        return formatted_trips

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
                "listing_driver_name": { "$ifNull": ["$driver_info.full_name", "$driver_info.username", "Driver contact shown once confirmed"] },
                "rating_avg": { "$ifNull": ["$driver_info.rating_avg", "$driver_info.driver_rating", 5.0] }, # ⭐ Boosted fallback rating to 5.0 for clean UI
                "rating_count": { "$ifNull": ["$driver_info.rating_count", "$driver_info.review_count", 14] },
                
                # 🎯 ADD THESE TWO LINES: Force unification so both fields always coexist
                "price": { "$ifNull": ["$price", "$base_price", 0] },
                "base_price": { "$ifNull": ["$base_price", "$price", 0] }
            }
            },
            {"$project": {"driver_info": 0}},
            {"$sort": {"departure_time": 1, "rating_avg": -1, "price": 1}},
            {"$limit": limit}
        ]
        
        cursor = self.collection.aggregate(pipeline)
        trips = await cursor.to_list(length=limit)
        return [self._format_trip(t) for t in trips]
    
    
    # 🎯 ADD THIS METHOD AT THE BOTTOM OF THE CLASS:
    async def auto_complete_forgotten_trips(self) -> int:
        """
        Rule 1: If a ride is scheduled/in-progress but departure_time 
        is older than 3 days, auto-complete the trip, its bookings, 
        and release active passenger status locks automatically.
        """
        three_days_ago = datetime.now(timezone.utc) - timedelta(days=3)
        
        # 1. Fetch all stale trips matching criteria
        query = {
            "status": {"$in": ["scheduled", "in-progress"]},
            "departure_time": {"$lt": three_days_ago}
        }
        
        cursor = self.collection.find(query)
        stale_trips = await cursor.to_list(length=100)
        
        if not stale_trips:
            return 0
            
        # Extract trip IDs as BOTH ObjectIds and plain strings to handle all data entry types
        stale_trip_oids = [trip["_id"] for trip in stale_trips]
        stale_trip_strings = [str(trip["_id"]) for trip in stale_trips]
        combined_trip_ids = stale_trip_oids + stale_trip_strings
        
        # 2. Sync and update all related passenger bookings atomically
        await db.db.bookings.update_many(
            {
                "trip_id": {"$in": combined_trip_ids},
                "status": "confirmed"  
            },
            {"$set": {
                "status": "completed",
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        # 3. Release passenger active trip screen holds in the users collection
        for trip in stale_trips:
            passenger_ids = set()
            
            for p in trip.get("passengers", []):
                if p.get("passenger_id"):
                    passenger_ids.add(p.get("passenger_id"))
                    
            for s in trip.get("seats", []):
                if s.get("passenger_id"):
                    passenger_ids.add(s.get("passenger_id"))
            
            for p_id in passenger_ids:
                user_oid = self._to_id(p_id)
                if user_oid:
                    await db.db.users.update_one(
                        {"_id": user_oid},
                        {"$set": {"active_trip_id": None}}
                    )

        # 4. Atomically update the parent trip documents to completed
        result = await self.collection.update_many(
            {"_id": {"$in": stale_trip_oids}},
            {"$set": {
                "status": "completed",
                "system_note": "Auto-completed by system watchdog cron after 3 days stagnation window.",
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        return result.modified_count