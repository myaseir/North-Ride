import logging
from typing import Any
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class MongoDB:
    def __init__(self):
        self.client = None 
        self._db = None 
        self.users = None
        self.trips = None
        self.audit_requests = None

    @property
    def db(self):
        return self._db

db = MongoDB()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGO_URL,
            maxPoolSize=50,
            minPoolSize=0,
            retryWrites=True,
            connectTimeoutMS=5000
        )
        db._db = db.client[settings.DATABASE_NAME]
        
        # Explicitly assign collections
        db.users = db._db["users"]
        db.trips = db._db["trips"]
        db.audit_requests = db._db["audit_requests"]
        
        await db.trips.create_index([("driver_id", 1), ("status", 1)], sparse=True)
        await db.trips.create_index([("origin", 1), ("destination", 1), ("status", 1)])
        
        await db.client.admin.command('ping')
        logger.info(f"✅ MongoDB Connected: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.error(f"❌ MongoDB Connection Failed: {e}")
        raise e

async def close_mongo_connection():
    if db.client:
        db.client.close()
        logger.info("👋 MongoDB Connection Cleanly Closed.")