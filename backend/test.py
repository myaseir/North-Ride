import asyncio
from datetime import datetime, timezone
from bson import ObjectId
from app.db.mongodb import db, connect_to_mongo, close_mongo_connection
from app.core.security import get_password_hash

async def seed_admin():
    print("🚀 Connecting to Terminal...")
    await connect_to_mongo()
    
    try:
        # 1. Define the exact document structure
        admin_email = "admin@gmail.com"
        
        # We generate a fresh hash for 'fdsa1234' 
        # so you are 100% sure of the password
        hashed_pw = get_password_hash("fdsa1234")
        
        admin_doc = {
            "username": "muhd.yaseir",
            "email": admin_email,
            "password_hash": hashed_pw,
            "roles": ["ADMIN"],
            "is_email_verified": True,
            "is_approved": True,
            "is_driver": True, # Based on your format
            "is_verified": True,
            "driver_profile": {
                "is_verified": True,
                "vehicle_model": "Admin Command Mobile",
                "approved_at": datetime.now(timezone.utc)
            },
            "wallet_balance": 51000.0,
            "active_trip_id": None,
            "created_at": datetime.now(timezone.utc),
            "referral_code": "YASEIR01"
        }

        # 2. Check and Insert
        collection = db.db.users
        existing = await collection.find_one({"email": admin_email})
        
        if existing:
            print(f"⚠️ User {admin_email} already exists. Updating roles...")
            await collection.update_one(
                {"email": admin_email}, 
                {"$set": {"roles": ["ADMIN"], "is_approved": True}}
            )
        else:
            result = await collection.insert_one(admin_doc)
            print(f"✅ Admin Created! ID: {result.inserted_id}")

    except Exception as e:
        print(f"❌ Seed Failed: {e}")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(seed_admin())