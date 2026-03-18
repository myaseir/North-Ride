from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# --- IMPORT YOUR MODULES ---
from app.api.auth import router as auth_router
from app.core.deps import get_current_user
from app.api.trips import router as trips_router
from app.api.user import router as user_router
from app.api.driver import router as driver_router
from app.api.admin_travel import router as admin_router
from app.api.system import router as system_router
from app.api import passenger

# Import connect functions and the db instance
from app.db.mongodb import connect_to_mongo, close_mongo_connection, db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs on startup
    await connect_to_mongo()
    yield
    # This runs on shutdown
    await close_mongo_connection()

app = FastAPI(title="GlaciaGo API", lifespan=lifespan)

# --- MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTER REGISTRATION ---
app.include_router(user_router, prefix="/api/users", tags=["Users"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(trips_router, prefix="/api/trips", tags=["Trips"])
app.include_router(driver_router, prefix="/api/driver", tags=["Driver"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(system_router, prefix="/api/system", tags=["System"])
app.include_router(passenger.router)


# --- ROOT ENDPOINT ---
@app.get("/")
async def root():
    return {
        "message": "Welcome to GlaciaGo API", 
        "docs": "/docs", 
        "status": "online"
    }

# --- PASSENGER ACTIVITY ENDPOINTS ---

@app.get("/api/users/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    # Convert MongoDB ObjectId to a string
    current_user["id"] = str(current_user["_id"])
    
    # Remove the original _id because it's still an ObjectId type
    del current_user["_id"]
    
    return current_user

@app.get("/api/passengers/rides")
async def get_ride_history(current_user: dict = Depends(get_current_user)):
    """
    Fetches all trips where the current user is recorded as the passenger.
    """
    try:
        # We search the 'trips' collection for this passenger's ID
        # .to_list(length=100) is required for Motor/Async drivers
        rides = await db.trips.find(
            {"passenger_id": str(current_user.get("_id"))}
        ).sort("created_at", -1).to_list(length=100)
        
        # Format MongoDB _id to string for JSON compatibility
        for ride in rides:
            ride["id"] = str(ride.pop("_id"))
            
        return rides
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database error: {str(e)}"
        )

@app.get("/api/passengers/payments")
async def get_payment_history(current_user: dict = Depends(get_current_user)):
    """
    Fetches all financial transactions for the current user.
    """
    try:
        # We search the 'transactions' collection
        payments = await db.transactions.find(
            {"user_id": str(current_user.get("_id"))}
        ).sort("created_at", -1).to_list(length=100)
        
        for pay in payments:
            pay["id"] = str(pay.pop("_id"))
            
        return payments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database error: {str(e)}"
        )

@app.get("/api/passengers/active-trip")
async def get_active_trip(current_user: dict = Depends(get_current_user)):
    """
    Returns details of the trip the passenger is currently booked on.
    This triggers the Car Image component on the dashboard.
    """
    active_trip_id = current_user.get("active_trip_id")
    
    if not active_trip_id:
        # Returning 404 is correct here; it tells the frontend 
        # "No active trip, keep showing the search bar"
        raise HTTPException(status_code=404, detail="No active trip")

    trip = await db.trips.find_one({"_id": active_trip_id})
    
    if not trip:
        raise HTTPException(status_code=404, detail="Trip record not found")

    # Format for Frontend component
    return {
        "id": str(trip["_id"]),
        "origin": trip.get("origin"),
        "destination": trip.get("destination"),
        "driver_name": trip.get("driver_name", "Glacia Captain"),
        "status": trip.get("status", "Confirmed"),
        "departure_time": trip.get("departure_time"),
        "vehicle_image": "/car-placeholder.png", # You can add actual logic for this later
        "seats": [s for s in trip.get("seats", []) if s.get("passenger_id") == str(current_user.get("_id"))]
    }
    
@app.get("/api/passengers/referrals")
async def get_referral_data(current_user: dict = Depends(get_current_user)):
    # Simple placeholder logic to satisfy the frontend request
    return {
        "total_referrals": current_user.get("referral_count", 0),
        "used_discounts": current_user.get("used_discounts", 0),
        "referral_code": current_user.get("username", "USER").upper() + "10"
    }

@app.get("/api/passengers/rides/recent")
async def get_recent_passenger_rides(current_user: dict = Depends(get_current_user)):
    try:
        # Look for trips where this user's ID is in the seats list
        rides = await db.trips.find({
            "seats.passenger_id": str(current_user.get("_id"))
        }).sort("departure_date", -1).to_list(length=5)
        
        for r in rides:
            r["id"] = str(r.pop("_id"))
        return rides
    except Exception as e:
        return []