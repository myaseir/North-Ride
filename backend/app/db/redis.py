from upstash_redis.asyncio import Redis 
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn.error")

# Initialize Upstash Redis Client (HTTP Based for Serverless/Vercel)
redis_client = Redis(
    url=settings.UPSTASH_REDIS_REST_URL, 
    token=settings.UPSTASH_REDIS_REST_TOKEN
)

class RedisManager:
    """
    Centralized manager for Redis operations optimized for serverless architecture.
    Focuses purely on stateless operations: Auth, Geo-tracking, and Atomic Locks.
    """
    
    @property
    def client(self):
        return redis_client

    # --- 🔐 AUTH & VERIFICATION HELPERS ---

    async def set_verification_token(self, email: str, status: str = "true", expiry: int = 900):
        """Marks email as verified for 15 mins to allow registration."""
        await redis_client.set(f"verified_status:{email}", status, ex=expiry)

    async def check_verification(self, email: str) -> bool:
        """Safety check before final DB commit."""
        val = await redis_client.get(f"verified_status:{email}")
        return val == "true"

    # --- 📍 GEOSPATIAL & TRACKING ---

    async def update_driver_location(self, driver_id: str, lat: float, lng: float):
        """Updates driver location using Geospatial indexes."""
        try:
            # Note: Upstash uses (longitude, latitude) order for GEOADD
            await redis_client.geoadd("driver_locations", (lng, lat, driver_id))
        except Exception as e:
            logger.error(f"Redis Location Error: {e}")

    async def remove_driver_location(self, driver_id: str):
        """Crucial: Removes driver from map when they go offline or are on a trip."""
        await redis_client.zrem("driver_locations", driver_id)

    async def get_nearby_drivers(self, lng: float, lat: float, radius_km: int = 5):
        """Finds drivers within a specific radius using GEOSEARCH."""
        try:
            # Professional apps use geosearch (newer/faster than georadius)
            return await redis_client.geosearch(
                "driver_locations",
                longitude=lng,
                latitude=lat,
                radius=radius_km,
                unit="km",
                withdist=True
            )
        except Exception as e:
            logger.error(f"Redis Search Error: {e}")
            return []

    # --- 🔒 ATOMIC LOCKING (NO HEARTBEATS) ---
        
    # 🎯 FIX: Added user_id to the arguments
    async def acquire_seat_locks(self, trip_id: str, seats: list[str], user_id: str, expiry: int = 600) -> bool:
        """
        Attempts to lock seats atomically for North Ride.
        Stores the user_id as the value so the system knows who owns the hold.
        """
        try:
            t_id = str(trip_id)
            keys = [f"lock:trip:{t_id}:seat:{seat}" for seat in seats]
            
            # 1. Pre-check: If any are locked, return False
            existing_locks = await redis_client.exists(*keys)
            if existing_locks > 0:
                return False

            # 2. Attempt Atomic Lock via Pipeline
            pipe = redis_client.pipeline()
            for seat in seats:
                lock_key = f"lock:trip:{t_id}:seat:{seat}"
                # 🎯 FIX: Store user_id instead of "hold"
                pipe.set(lock_key, str(user_id), ex=expiry, nx=True)
            
            results = await pipe.exec()
            
            # 3. Validation
            if any(r != "OK" and r is not True for r in results):
                await self.release_seat_locks(t_id, seats)
                return False
            
            return True
        except Exception as e:
            logger.error(f"Redis Locking Error: {e}")
            return False

    async def release_seat_locks(self, trip_id: str, seats: list[str]):
        """Removes the 'Hold' status so seats can be free or permanently booked."""
        if not seats:
            return
        keys = [f"lock:trip:{trip_id}:seat:{seat}" for seat in seats]
        try:
            await redis_client.delete(*keys)
        except Exception as e:
            logger.error(f"Redis Release Error: {e}")

# Export the instance
redis_mgr = RedisManager()