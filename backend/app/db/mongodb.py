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
        # The actual class is used here during runtime, where it won't cause type errors
        db.client = AsyncIOMotorClient(
            settings.MONGO_URL,
            maxPoolSize=100, 
            minPoolSize=10,
            retryWrites=True
        )
        db._db = db.client[settings.DATABASE_NAME]
        
        # --- INITIALIZE INDEXES ---
        # This prevents a driver from creating two 'scheduled' rides
        await db.db["trips"].create_index(
            [("driver_id", 1), ("status", 1)],
            unique=True,
            partialFilterExpression={"status": "scheduled"}
        )
        
        await db.client.admin.command('ping')
        logger.info(f"✅ MongoDB Connected & Indexes Initialized: {settings.DATABASE_NAME}")
        
    except Exception as e:
        logger.error(f"❌ MongoDB Connection Failed: {e}")
        raise e

async def close_mongo_connection():
    try:
        db.client = AsyncIOMotorClient(settings.MONGO_URL, ...)
        db._db = db.client[settings.DATABASE_NAME]
        
        # --- INITIALIZE INDEXES ---
        try:
            await db.db["trips"].create_index(
                [("driver_id", 1), ("status", 1)],
                unique=True,
                partialFilterExpression={"status": "scheduled"}
            )
        except Exception as index_err:
            logger.warning(f"⚠️ Could not create unique index (likely duplicate data exists): {index_err}")
        
        await db.client.admin.command('ping')
        logger.info(f"✅ MongoDB Connected: {settings.DATABASE_NAME}")
        
    except Exception as e:
        logger.error(f"❌ MongoDB Connection Failed: {e}")
        raise e