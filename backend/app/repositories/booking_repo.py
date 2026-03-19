from __future__ import annotations
from app.db.mongodb import db
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, List, Any
import logging

logger = logging.getLogger("uvicorn.error")

class BookingRepository:
    def __init__(self):
        pass

    def _to_id(self, id_val: Any) -> Optional[ObjectId]:
        """Safe conversion of string/any to MongoDB ObjectId."""
        if not id_val: return None
        try:
            return ObjectId(str(id_val)) if ObjectId.is_valid(str(id_val)) else None
        except Exception:
            return None

    @property
    def collection(self):
        return db.db.bookings

    @property
    def trips(self):
        return db.db.trips

    async def get_by_id(self, booking_id: str) -> Optional[dict]:
        booking = await self.collection.find_one({"_id": self._to_id(booking_id)})
        if booking:
            booking["id"] = str(booking["_id"])
            booking["_id"] = booking["id"]
            booking["trip_id"] = str(booking["trip_id"])
            booking["passenger_id"] = str(booking.get("passenger_id", ""))
            if "total_price" not in booking and "amount" in booking:
                booking["total_price"] = booking["amount"]
        return booking

    async def create_pending(
        self, 
        user_id: str, 
        passenger_name: str, 
        trip_id: str, 
        amount: float, 
        trx_id: str, 
        seat_layout: list,
        account_number: str ,
        sender_name: str = None
        ):
        """
        Creates a new booking document. Allows multiple bookings per user 
        as long as the SEATS are different.
        """
    
    # 🎯 THE CHANGE: Check if these SPECIFIC SEATS are already booked by ANYONE
    # instead of checking if the USER has a booking.
        seat_conflict = await self.collection.find_one({
            "trip_id": self._to_id(trip_id),
            "seat_layout": {"$in": seat_layout}, # Check if any requested seat overlaps
            "status": {"$in": ["pending", "confirmed"]}
        })
    
        if seat_conflict:
            return "SEATS_TAKEN"

    # Prepare the document
        booking_doc = {
            "passenger_id": self._to_id(user_id),
            "trip_id": self._to_id(trip_id),
            "passenger_name": passenger_name,
            "sender_name": sender_name,
            "seat_layout": seat_layout,
            "total_price": float(amount),
            "transactionId": trx_id,
            "account_number": account_number,
            "status": "pending",
            "created_at": datetime.now(timezone.utc)
        }

        result = await self.collection.insert_one(booking_doc)
        return str(result.inserted_id)
    async def get_pending_verifications(self):
        """
        Admin Tool: Lists all bookings requiring manual verification.
        Joins with Trips and Users to fetch real-time Driver/Vehicle info.
        """
        pipeline = [
            {"$match": {"status": "pending"}},
            {
                "$lookup": {
                    "from": "trips",
                    "localField": "trip_id",
                    "foreignField": "_id",
                    "as": "trip_info"
                }
            },
            {"$unwind": {"path": "$trip_info", "preserveNullAndEmptyArrays": True}},
            {
                "$lookup": {
                    "from": "users",
                    "let": { "d_id": "$trip_info.driver_id" },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": ["$_id", { "$toObjectId": "$$d_id" }]
                                }
                            }
                        }
                    ],
                    "as": "user_info"
                }
            },
            {"$unwind": {"path": "$user_info", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "id": {"$toString": "$_id"},
                    "_id": {"$toString": "$_id"},
                    "passenger_name": "$passenger_name",
                    
                    "amount": 1,
                    "trx_id": 1,
                    "status": 1,
                    "amount": "$total_price",       
                    "amount_paid": 1,               
                    "trx_id": { "$ifNull": ["$transactionId", "$trx_id"] },
    
    # This line is the fix: It looks for senderName, falls back to passenger_name
                    "sender_name": { "$ifNull": ["$sender_name", "--- DATA MISSING IN DB ---"] },
    
                    "account_no": { "$ifNull": ["$account_number", "$account_no"] },
                    "created_at": {"$toString": "$created_at"},
                    "trip_id": {"$toString": "$trip_id"},
                    "listing_driver_id": {"$toString": "$user_info._id"},
                    "listing_driver_name": { "$ifNull": ["$user_info.username", "Unknown Driver"] },
                    "listing_driver_phone": {
                        "$ifNull": [
                            { "$arrayElemAt": ["$user_info.driver_profile.contacts", 0] },
                            { "$ifNull": ["$user_info.phone_number", "No Phone"] }
                        ]
                    },
                    "listing_car_details": {
                        "$concat": [
                            { "$ifNull": ["$user_info.driver_profile.vehicle.make_model", "Vehicle"] },
                            " - ",
                            { "$ifNull": ["$user_info.driver_profile.vehicle.plate_number", "N/A"] }
                        ]
                    }
                }
            },
            {"$sort": {"created_at": -1}}
        ]
        return await self.collection.aggregate(pipeline).to_list(length=100)

    async def mark_as_confirmed(self, booking_id: str, overwrites: dict = None):
        """
        🎯 CORE UPDATE: This method now updates both the 'bookings' collection
        and the 'passengers' array inside the 'trips' collection.
        """
        oid = self._to_id(booking_id)
        booking = await self.collection.find_one({"_id": oid})
        if not booking: 
            return False

        data = overwrites or {}

        # 1. Update the Booking Document (for audit logs/history)
        update_data = {
            "status": "confirmed",
            "payment_verified": True,
            "final_driver_name": data.get("name"),
            "final_driver_phone": data.get("contact_1"),
            "final_car_details": data.get("car_details"),
            "verified_at": datetime.now(timezone.utc)
        }
        await self.collection.update_one({"_id": oid}, {"$set": update_data})

        # 2. Sync to the Trip's passenger list (For the Passenger Dashboard)
        # We match by trip_id AND the passenger's ID to update the specific array element
        if "trip_id" in booking:
            # We use passenger_id or email as a secondary identifier for the array match
            p_id = booking.get("passenger_id")
            
            await self.trips.update_one(
                {
                    "_id": self._to_id(booking["trip_id"]), 
                    "passengers.passenger_id": str(p_id) 
                },
                {
                    "$set": {
                        "passengers.$.status": "confirmed",
                        "passengers.$.final_driver_name": data.get("name"),
                        "passengers.$.final_driver_phone": data.get("contact_1"),
                        "passengers.$.final_car_details": data.get("car_details")
                    }
                }
            )
            logger.info(f"✅ Synced Driver info to Trip {booking['trip_id']} for passenger {p_id}")

        return True

    async def get_trip_manifest(self, trip_id: str) -> List[dict]:
        cursor = self.collection.find({
            "trip_id": self._to_id(trip_id),
            "status": {"$in": ["confirmed", "pending"]} 
        })
        manifest = await cursor.to_list(length=100)
        for entry in manifest:
            entry["id"] = str(entry["_id"])
            entry["_id"] = entry["id"]
            entry["passenger_id"] = str(entry.get("passenger_id", ""))
            entry["trip_id"] = str(entry.get("trip_id", ""))
        return manifest

    async def cancel_booking(self, booking_id: str):
        booking = await self.collection.find_one({"_id": self._to_id(booking_id)})
        if not booking or booking["status"] == "cancelled":
            return False

        if booking["status"] == "confirmed":
            seats_to_restore = len(booking.get("seat_layout", [1]))
            await self.trips.update_one(
                {"_id": booking["trip_id"]},
                {"$inc": {"available_seats": seats_to_restore}}
            )

        await self.collection.update_one(
            {"_id": booking["_id"]},
            {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc)}}
        )
        return True

    async def get_booking_by_id(self, booking_id: str):
        return await self.get_by_id(booking_id)
    
    async def get_passenger_payments(self, user_id: str) -> List[dict]:
        cursor = self.collection.find(
            {"passenger_id": self._to_id(user_id)}
        ).sort("created_at", -1)
        results = await cursor.to_list(length=100)
        for r in results:
            r["id"] = str(r["_id"])
            r["_id"] = r["id"]
            r["amount"] = r.get("amount", r.get("total_price", 0))
            r["status"] = r.get("status", "pending").lower()
            if "passenger_id" in r: r["passenger_id"] = str(r["passenger_id"])
            if "trip_id" in r: r["trip_id"] = str(r["trip_id"])
        return results
    
    async def get_passenger_history(self, passenger_id: str):
        """Fetches all completed or cancelled bookings for a passenger."""
        cursor = self.collection.find({
            "passenger_id": self._to_id(passenger_id)
        }).sort("created_at", -1) # Latest first
    
        return await cursor.to_list(length=50)

    async def get_unrated_booking_for_popup(self, user_id: str) -> Optional[dict]:
        """
        Finds a completed booking that hasn't triggered a popup yet.
        🎯 The 'One-Time' Logic: We flip the flag to True immediately.
        """
        # 1. Search for a candidate
        booking = await self.collection.find_one({
            "passenger_id": self._to_id(user_id),
            "status": "completed",
            "rating_popup_shown": False
        })

        if not booking:
            return None

        # 2. FLIP THE FLAG IMMEDIATELY 
        # This prevents the popup from showing again on the next refresh
        await self.collection.update_one(
            {"_id": booking["_id"]},
            {"$set": {"rating_popup_shown": True}}
        )

        # 3. Clean up IDs for frontend
        booking["id"] = str(booking["_id"])
        return booking

    async def save_rating_results(self, booking_id: str, rating: int, review: str):
        """Saves the actual star rating and text to the booking."""
        return await self.collection.update_one(
            {"_id": self._to_id(booking_id)},
            {"$set": {
                "rating": rating,
                "review_text": review,
                "rated_at": datetime.now(timezone.utc)
            }}
        )
    
    def _format_booking(self, booking: dict) -> dict:
        """Manual ID string conversion for JSON safety (The 'Driver Repo' Style)"""
        if booking:
            # Standardize the IDs
            booking["id"] = str(booking.get("_id"))
            booking["_id"] = booking["id"]
            
            if "trip_id" in booking:
                booking["trip_id"] = str(booking["trip_id"])
            if "passenger_id" in booking:
                booking["passenger_id"] = str(booking["passenger_id"])
            
            # Ensure price field name consistency for the UI
            if "total_price" not in booking and "amount" in booking:
                booking["total_price"] = booking["amount"]
                
        return booking

    async def get_passenger_history(self, passenger_id: str) -> list[dict]:
        """
        Fetches enriched history. 
        Joins 'bookings' with 'trips' to get Route and Driver info.
        """
        pipeline = [
        # 1. Find bookings for this passenger
            {
            "$match": {
            "passenger_id": self._to_id(passenger_id),
            "status": {"$in": ["confirmed", "completed", "cancelled"]}
            }},
        # 2. Join with Trips collection to get Route (Origin/Destination)
        {
                "$lookup": {
                    "from": "trips",
                    "localField": "trip_id",
                    "foreignField": "_id",
                    "as": "trip_details"
            }
        },
        {   "$unwind": {"path": "$trip_details", "preserveNullAndEmptyArrays": True}},
        # 3. Clean up the output for the Frontend
        {
                "$project": {
                    "id": {"$toString": "$_id"},
                    "trip_id": {"$toString": "$trip_id"},
                    "status": 1,
                    "rating": 1,
                    "review_text": 1,
                    "created_at": 1,
                    "total_price": {"$ifNull": ["$total_price", "$amount"]},
                    # 🎯 Pulling enriched details from the joined Trip
                    "origin": {"$ifNull": ["$trip_details.origin", "Unknown"]},
                    "destination": {"$ifNull": ["$trip_details.destination", "Unknown"]},
                    "final_driver_name": {
                    "$ifNull": ["$final_driver_name", "$trip_details.listing_driver_name", "Captain"]
                }
            }
        },
        {   "$sort": {"created_at": -1}}
    ]
    
        results = await self.collection.aggregate(pipeline).to_list(length=50)
        return results
    
    async def get_all_ratings_for_driver(self, driver_id: str) -> list[dict]:
        """
        Fetches all bookings for a specific driver that contain a rating.
        Used to calculate the driver's global average.
        """
        query = {
            "driver_id": self._to_id(driver_id),
            "rating": {"$exists": True, "$ne": None}  # Only get bookings that actually have a rating
        }
        
        cursor = self.collection.find(query)
        ratings = await cursor.to_list(length=None) 
        
        return ratings