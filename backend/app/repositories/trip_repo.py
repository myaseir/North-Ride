from __future__ import annotations
from app.db.mongodb import db
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, List, Any
import logging

logger = logging.getLogger("uvicorn.error")

class TripRepository:
    def __init__(self):
        pass

    def _to_id(self, id_val: Any) -> Optional[ObjectId]:
        """Safe conversion to ObjectId, handling strings and already-converted ObjectIds."""
        if not id_val: return None
    # 🎯 FIX: If it's already an ObjectId, return it as is
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
        Saves a trip. Ensures data consistency and enables Passenger searchability.
        """
        # 1. Normalize IDs and Strings
        if "driver_id" in trip_data:
            trip_data["driver_id"] = str(trip_data["driver_id"])
        
        # 🎯 Normalize for search consistency (trim and lower)
        trip_data["origin"] = trip_data.get("origin", "").strip().lower()
        trip_data["destination"] = trip_data.get("destination", "").strip().lower()
        
        # 🎯 THE SEARCH FIX: Generate 'date' field from 'departure_time'
        # This allows the search query { "date": "2026-03-12" } to work.
        if "departure_time" in trip_data:
            dt = trip_data["departure_time"]
            # Handles both ISO string and datetime objects
            trip_data["date"] = dt.split('T')[0] if isinstance(dt, str) else dt.strftime('%Y-%m-%d')
        
        # 2. Set standard defaults
        trip_data["status"] = trip_data.get("status", "scheduled")
        trip_data["created_at"] = datetime.now(timezone.utc)
        trip_data["available_seats"] = trip_data.get("total_seats", 4)
        
        # 3. Ensure seat_layout exists for the UI logic
        if "seat_layout" not in trip_data:
            # 🎯 Changed from 1A/1B to match your Realistic Cabin Manager UI
            trip_data["seat_layout"] = ["FL", "RL", "RC", "RR"]
        
        # 4. Insert into MongoDB
        result = await self.collection.insert_one(trip_data)
        return str(result.inserted_id)

    async def find_trips(self, origin: str, destination: str, date_str: Optional[str] = None) -> List[dict]:
        query = {
            "origin": origin.strip().lower(),
            "destination": destination.strip().lower(),
            "status": "scheduled",
            "available_seats": {"$gt": 0}
        }

        if date_str:
            query["date"] = date_str

    # PROFESSIONAL SORT: 
    # 1. Date/Time (Soonest first)
    # 2. Driver Rating (Highest first -> -1)
    # 3. Price (Lowest first -> 1)
        cursor = self.collection.find(query).sort([
            ("departure_time", 1),
            ("driver_rating", -1), 
            ("price", 1)
        ])
    
        trips = await cursor.to_list(length=100)
        return [self._format_trip(t) for t in trips]

    async def get_driver_active_trip(self, driver_id: str) -> Optional[dict]:
        """
        Fetches the current active trip for a driver and attaches 
        their profile details (Name/Phone) for the UI fallbacks.
        """
    # 1. FIX: Convert string ID to ObjectId for the query
        oid = self._to_id(driver_id)
    
        query = {
            "driver_id": oid, # Use the ObjectId, not the string
            "status": {"$in": ["scheduled", "in-progress"]}
        }
    
        trip = await self.collection.find_one(query)
    
        if not trip:
            return None

    # 2. ENHANCEMENT: Attach Driver Details
    # This ensures the Passenger Dashboard sees the name even before Admin verification
        driver = await db.db.users.find_one({"_id": oid})
        if driver:
            trip["listing_driver_name"] = driver.get("full_name", "Captain")
            trip["listing_driver_phone"] = driver.get("phone", "No Contact")
        # Ensure the vehicle info is also present
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
        """Fetches all past trips for the Driver Sidebar."""
        query = {
            "driver_id": str(driver_id),
            "status": {"$in": ["completed", "cancelled"]}
        }
        cursor = self.collection.find(query).sort("created_at", -1)
        trips = await cursor.to_list(length=50)
        return [self._format_trip(t) for t in trips]

    async def get_active_trips(self, origin: str, destination: str, date_str: Optional[str] = None) -> List[dict]:
        """Secondary search method for nearest available logic."""
        query = {
            "origin": origin.strip().lower(),
            "destination": destination.strip().lower(),
            "status": "scheduled", 
            "available_seats": {"$gt": 0}
        }
        
        if date_str:
            try:
                search_date = datetime.fromisoformat(date_str.replace('Z', '')).replace(
                    hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
                )
                query["departure_time"] = {"$gte": search_date}
            except ValueError:
                logger.warning(f"Invalid date format: {date_str}")

        cursor = self.collection.find(query).sort("departure_time", 1)
        trips = await cursor.to_list(length=100)
        return [self._format_trip(t) for t in trips]
    
    async def find_upcoming_trips(self, origin: str, destination: str, date_str: str, limit: int = 20) -> List[dict]:
        """
        Fallback Search: Finds rides AFTER the requested date if the exact date is empty.
        """
        query = {
            "origin": origin.strip().lower(),
            "destination": destination.strip().lower(),
            "status": "scheduled",
            "available_seats": {"$gt": 0},
            "date": {"$gt": date_str}  # Find anything strictly after the searched date
        }

    # Sort by date and time so the closest future rides show first
        cursor = self.collection.find(query).sort([("date", 1), ("departure_time", 1)]).limit(limit)
        trips = await cursor.to_list(length=limit)
    
        return [self._format_trip(t) for t in trips]