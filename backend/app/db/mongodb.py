from __future__ import annotations
import logging
from typing import Any, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class MongoDB:
    def __init__(self):
        # We use 'Any' or a string forward reference to stop the linter error
        self.client: Optional[Any] = None 
        self._db: Any = None 

    @property
    def db(self):
        if self._db is None:
            logger.warning("⚠️ MongoDB.db accessed before connection was established!")
        return self._db

    def get_collection(self, name: str):
        return self.db[name]

db = MongoDB()

async def connect_to_mongo():
    try:
        # 🎯 SERVERLESS OPTIMIZATIONS APPLIED HERE
        db.client = AsyncIOMotorClient(
            settings.MONGO_URL,
            maxPoolSize=50,       # Cap connections to stay within Atlas free tier limits
            minPoolSize=0,        # Crucial for Vercel: Do not keep idle connections open
            retryWrites=True,
            connectTimeoutMS=5000 # Fail fast if network is degraded
        )
        db._db = db.client[settings.DATABASE_NAME]
        
        # --- INITIALIZE INDEXES ---
        # 1. Driver constraint: prevents a driver from creating two 'scheduled' rides
        await db.db["trips"].create_index(
            [("driver_id", 1), ("status", 1)],
            unique=True,
            partialFilterExpression={"status": "scheduled"}
        )
        
        # 2. 🎯 Search optimization: makes NorthRide route finding instant
        await db.db["trips"].create_index(
            [("origin", 1), ("destination", 1), ("status", 1)]
        )
        
        await db.client.admin.command('ping')
        logger.info(f"✅ MongoDB Connected & Serverless Indexes Initialized: {settings.DATABASE_NAME}")
        
    except Exception as e:
        logger.error(f"❌ MongoDB Connection Failed: {e}")
        raise e

async def close_mongo_connection():
    try:
        # 🎯 THE FIX: Actually close the connection to prevent Zombie connections on Vercel
        if db.client:
            db.client.close()
            logger.info("👋 MongoDB Connection Cleanly Closed.")
    except Exception as e:
        logger.error(f"❌ Error during MongoDB shutdown: {e}")