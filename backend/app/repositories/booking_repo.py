from __future__ import annotations
from app.db.mongodb import db
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, List, Any
from pymongo import ReturnDocument
import logging

logger = logging.getLogger("uvicorn.error")

class BookingRepository:
    def __init__(self):
        from app.repositories.user_repo import UserRepository # Lazy import to avoid circular dependencies
        self.user_repo = UserRepository()

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

    def _format_booking(self, booking: dict) -> dict:
        """Manual ID string conversion for JSON safety"""
        if booking:
            booking["id"] = str(booking.get("_id"))
            booking["_id"] = booking["id"]
            
            if "trip_id" in booking:
                booking["trip_id"] = str(booking["trip_id"])
            if "passenger_id" in booking:
                booking["passenger_id"] = str(booking["passenger_id"])
            if "driver_id" in booking:
                booking["driver_id"] = str(booking["driver_id"])
            
            if "total_price" not in booking and "amount" in booking:
                booking["total_price"] = booking["amount"]
        return booking

    async def get_by_id(self, booking_id: str) -> Optional[dict]:
        booking = await self.collection.find_one({"_id": self._to_id(booking_id)})
        return self._format_booking(booking)
    
    async def get_booking_by_id(self, booking_id: str):
        return await self.get_by_id(booking_id)

    async def create_pending(
        self, 
        user_id: str, 
        passenger_name: str, 
        passenger_phone: str,
        trip_id: str, 
        amount: float, 
        trx_id: str, 
        seat_layout: list,
        account_number: str,
        sender_name: str = None,
        use_discount: bool = False
        
    ):
        FRONT_SEAT_SURCHARGE = 2500
        
        # Check for Seat Conflicts
        seat_conflict = await self.collection.find_one({
            "trip_id": self._to_id(trip_id),
            "seat_layout": {"$in": seat_layout},
            "status": {"$in": ["pending", "confirmed"]}
        })

        if seat_conflict:
            return "SEATS_TAKEN"

        has_front_seat = "FL" in seat_layout
        surcharge_total = FRONT_SEAT_SURCHARGE if has_front_seat else 0
        
        total_price = float(amount) 
        advance_paid = total_price * 0.20 
        
        booking_doc = {
            "passenger_id": self._to_id(user_id),
            "trip_id": self._to_id(trip_id),
            "passenger_name": passenger_name,
            "passenger_phone": passenger_phone,
            "sender_name": sender_name,
            "seat_layout": seat_layout,
            "base_fare": total_price - surcharge_total,
            "surcharge_amount": surcharge_total,
            "total_price": total_price,
            "amount_paid": advance_paid, 
            "remaining_balance": total_price - advance_paid,
            "transactionId": trx_id,
            "account_number": account_number,
            "status": "pending",
            "has_premium_seat": has_front_seat,
            "use_discount": use_discount,
            "created_at": datetime.now(timezone.utc)
        }

        result = await self.collection.insert_one(booking_doc)
        return str(result.inserted_id)

    async def mark_as_confirmed(self, booking_id: str, overwrites: dict = None):
        """Atomic confirmation and array sync"""
        oid = self._to_id(booking_id)
        booking = await self.collection.find_one({"_id": oid})
        if not booking: 
            return False

        data = overwrites or {}

        update_data = {
            "status": "confirmed",
            "payment_verified": True,
            "final_driver_name": data.get("name"),
            "final_driver_phone": data.get("contact_1"),
            "final_car_details": data.get("car_details"),
            "verified_at": datetime.now(timezone.utc)
        }
        await self.collection.update_one({"_id": oid}, {"$set": update_data})

        if "trip_id" in booking:
            p_id = booking.get("passenger_id")
            await self.trips.update_one(
                {
                    "_id": self._to_id(booking["trip_id"]), 
                    "passengers.passenger_id": str(p_id) # Keeps the safety shield so MongoDB doesn't crash
                },
                {
                    "$set": {
                        "passengers.$[elem].status": "confirmed",
                        "passengers.$[elem].final_driver_name": data.get("name"),
                        "passengers.$[elem].final_driver_phone": data.get("contact_1"),
                        "passengers.$[elem].final_car_details": data.get("car_details")
                    }
                },
                array_filters=[{"elem.passenger_id": str(p_id)}] # Updates EVERY seat for this passenger
            )
        return True
    # Inside your completion/verification logic:
    async def reward_user_for_trip(self, passenger_id: str):
    # Only increment the counter. Do not calculate discounts here.
        await db.db.users.find_one_and_update(
            {"_id": self._to_id(passenger_id)},
            {"$inc": {"loyalty_meta.completed_trips": 1}},
            return_document=ReturnDocument.AFTER
    )
    # Repository finished its job.
    async def get_trip_manifest(self, trip_id: str) -> List[dict]:
        cursor = self.collection.find({
            "trip_id": self._to_id(trip_id),
            "status": {"$in": ["confirmed", "pending"]} 
        })
        manifest = await cursor.to_list(length=100)
        return [self._format_booking(entry) for entry in manifest]

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

    async def get_passenger_payments(self, user_id: str) -> List[dict]:
        cursor = self.collection.find(
            {"passenger_id": self._to_id(user_id)}
        ).sort("created_at", -1)

        results = await cursor.to_list(length=100)
        return [self._format_booking(r) for r in results]

    async def get_passenger_history(self, passenger_id: str) -> list[dict]:
        pipeline = [
            {
                "$match": {
                    "passenger_id": self._to_id(passenger_id),
                    "status": {"$in": ["confirmed", "completed", "cancelled"]}
                }
            },
            {
                "$lookup": {
                    "from": "trips",
                    "localField": "trip_id",
                    "foreignField": "_id",
                    "as": "trip_details"
                }
            },
            {"$unwind": {"path": "$trip_details", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "id": {"$toString": "$_id"},
                    "_id": {"$toString": "$_id"},
                    "trip_id": {"$toString": "$trip_id"},
                    "passenger_id": {"$toString": "$passenger_id"},
                    "status": 1,
                    "rating": 1,
                    "review_text": 1,
                    "created_at": 1,
                    "total_price": {"$ifNull": ["$total_price", "$amount"]},
                    "origin": {"$ifNull": ["$trip_details.origin", "Unknown"]},
                    "destination": {"$ifNull": ["$trip_details.destination", "Unknown"]},
                    "final_driver_name": {
                        "$ifNull": ["$final_driver_name", "$trip_details.listing_driver_name", "Captain"]
                    },
                    # 🎯 ADDED FIELDS:
                    "seat_layout": 1, 
                    "booked_seat_count": { 
                        "$cond": {
                            "if": {"$isArray": "$seat_layout"},
                            "then": {"$size": "$seat_layout"},
                            "else": 1
                        }
                    }
                }
            },
            {"$sort": {"created_at": -1}}
        ]
        return await self.collection.aggregate(pipeline).to_list(length=50)
    async def get_pending_verifications(self):
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
        "status": 1,
        "amount": "$total_price",       
        "amount_paid": 1,               
        "trx_id": { "$ifNull": ["$transactionId", "$trx_id"] },
        "sender_name": { "$ifNull": ["$sender_name", "--- DATA MISSING IN DB ---"] },
        "account_no": { "$ifNull": ["$account_number", "$account_no"] },
        "created_at": {"$toString": "$created_at"},
        "trip_id": {"$toString": "$trip_id"},
        
        # 🎯 ADD THESE TWO LINES TO PROJECT THE TIME
        "departure_time": "$trip_info.departure_time",
        "trip_date": "$trip_info.date",
        
        "passenger_id": {"$toString": "$passenger_id"},
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

    async def get_unrated_booking_for_popup(self, user_id: str) -> Optional[dict]:
        booking = await self.collection.find_one_and_update(
            {
                "passenger_id": self._to_id(user_id),
                "status": "completed",
                "rating_popup_shown": {"$ne": True},
                "is_rated": {"$ne": True} 
            },
            {"$set": {"rating_popup_shown": True}},
            return_document=ReturnDocument.AFTER 
        )
        return self._format_booking(booking)

    async def save_rating_results(self, booking_id: str, rating: int, review: str):
        return await self.collection.update_one(
            {"_id": self._to_id(booking_id)},
            {"$set": {
                "rating": rating,
                "review_text": review,
                "rated_at": datetime.now(timezone.utc),
                "is_rated": True  
            }}
        )

    async def get_all_ratings_for_driver(self, driver_id: str) -> list[dict]:
        query = {
            "driver_id": self._to_id(driver_id),
            "rating": {"$exists": True, "$ne": None}  
        }
        cursor = self.collection.find(query)
        ratings = await cursor.to_list(length=None) 
        return [self._format_booking(r) for r in ratings]

    async def get_admin_pending_payouts(self):
        pipeline = [
            {"$match": {"status": "completed", "payout_status": "pending"}},
            {
                "$lookup": {
                    "from": "users",
                    "localField": "driver_id",
                    "foreignField": "_id",
                    "as": "driver_info"
                }
            },
            {"$unwind": {"path": "$driver_info", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "id": {"$toString": "$_id"},
                    "_id": {"$toString": "$_id"},
                    "driver_id": {"$toString": "$driver_id"},
                    "driver_name": "$driver_info.username",
                    "driver_phone": "$driver_info.phone_number",
                    "payout_method": "$driver_info.driver_profile.payout.method",
                    "payout_account": "$driver_info.driver_profile.payout.account",
                    "trip_id": {"$toString": "$trip_id"},
                    "passenger_id": {"$toString": "$passenger_id"},
                    "passenger_name": 1,
                    "advance_paid": "$amount_paid", 
                    "total_price": 1,
                    "completed_at": 1,
                    "transactionId": 1
                }
            },
            {"$sort": {"completed_at": 1}}
        ]
        
        results = await self.collection.aggregate(pipeline).to_list(length=100)
        
        for r in results:
            total_fare = float(r.get("total_price", 0))
            advance = float(r.get("advance_paid", 0))
            commission = total_fare * 0.05 
            net_payout = advance - commission 
            
            r["commission_fee"] = commission
            r["net_payout"] = net_payout
            
        return results

    async def get_driver_payout_ledger(self, driver_id: str):
        cursor = self.collection.find({
            "driver_id": self._to_id(driver_id),
            "status": "completed",
            "payout_status": {"$exists": True}
        }).sort("completed_at", -1)
        
        results = await cursor.to_list(length=100)
        
        ledger = []
        for b in results:
            item = self._format_booking(b)
            total_fare = float(item.get("total_price", 0))
            advance = float(item.get("amount_paid", 0))
            commission = total_fare * 0.05
            
            item["advance_collected"] = advance
            item["platform_commission"] = commission
            item["net_bank_transfer"] = advance - commission
            
            ledger.append(item)
            
        return ledger
    
    # 🎯 ADD THIS METHOD AT THE BOTTOM OF THE CLASS:
    async def expire_stale_unverified_bookings(self) -> int:
        """
        Rule 2: If a booking verification application is ignored 
        for more than 4 days, auto-cancel it, release seat holds, 
        and pull the passenger data out of the trip tracking arrays.
        """
        from datetime import timedelta
        four_days_ago = datetime.now(timezone.utc) - timedelta(days=4)
        
        query = {
            "status": "pending",  # Passenger applied, but admin hasn't confirmed yet
            "created_at": {"$lt": four_days_ago}
        }
        
        # 1. Fetch stale booking entries to process matching trip documents
        cursor = self.collection.find(query)
        stale_bookings = await cursor.to_list(length=200)
        
        for booking in stale_bookings:
            seats_to_release = len(booking.get("seat_layout", [1]))
            passenger_id = booking.get("passenger_id")
            
            # 🎯 THE DATA UNIFICATION FIX: 
            # Reverses structural array entries so passenger profiles are cleanly unlinked
            await self.trips.update_one(
                {"_id": booking["trip_id"]},
                {
                    "$inc": {"available_seats": seats_to_release},
                    "$pull": {
                        "seats": {"passenger_id": str(passenger_id)},
                        "passengers": {"passenger_id": passenger_id}
                    }
                }
            )
            
        # 2. Update all stale record flags atomically inside the bookings collection
        result = await self.collection.update_many(
            query,
            {"$set": {
                "status": "cancelled",
                "cancellation_reason": "Admin confirmation threshold timeout (4 Days)",
                "cancelled_at": datetime.now(timezone.utc)
            }}
        )
        return result.modified_count
    
    # ADD TO BookingRepository in booking_repo.py
    async def get_passenger_trip_thread(self, passenger_id: str, trip_id: str) -> List[dict]:
        """Fetches all existing bookings for a passenger on a specific trip."""
        cursor = self.collection.find({
            "passenger_id": self._to_id(passenger_id),
            "trip_id": self._to_id(trip_id),
            "status": {"$in": ["confirmed", "pending"]}
        })
        results = await cursor.to_list(length=10)
        return [self._format_booking(r) for r in results]
    
    async def reject_and_refund(self, booking_id: str, reason: str = "Admin rejected"):
        """
        Manually trigger a rejection and refund for a specific booking.
        """
        booking = await self.collection.find_one({"_id": self._to_id(booking_id)})
        if not booking: return False
        
        # 1. Release seats if it was confirmed
        if booking["status"] == "confirmed":
            seats_to_release = len(booking.get("seat_layout", [1]))
            await self.trips.update_one(
                {"_id": booking["trip_id"]},
                {
                    "$inc": {"available_seats": seats_to_release},
                    "$pull": {
                        "passengers": {"passenger_id": booking["passenger_id"]}
                    }
                }
            )
            
        # 2. Update booking status
        await self.collection.update_one(
            {"_id": self._to_id(booking_id)},
            {"$set": {
                "status": "cancelled",
                "cancellation_reason": reason,
                "cancelled_at": datetime.now(timezone.utc)
            }}
        )
        return True