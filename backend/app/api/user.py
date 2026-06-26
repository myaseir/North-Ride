from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from bson import ObjectId
from app.repositories.user_repo import UserRepository
router = APIRouter()

def serialize_mongo(data):
    """Helper to recursively convert MongoDB ObjectIds to strings."""
    if isinstance(data, list):
        return [serialize_mongo(item) for item in data]
    if isinstance(data, dict):
        return {k: serialize_mongo(v) for k, v in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    return data

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    # 1. Use the recursive helper to wipe out all deeply nested ObjectIds
    # (e.g., inside driver_profile.vehicle or active_trip_id)
    clean_user = serialize_mongo(current_user)

    # 2. Final polish for the frontend
    if "id" not in clean_user and "_id" in clean_user:
        clean_user["id"] = clean_user["_id"]
    
    # 3. Remove sensitive and redundant data
    clean_user.pop("_id", None)
    clean_user.pop("password", None)
    clean_user.pop("password_hash", None)

    return clean_user

# In app/api/user.py

@router.get("/referrals/my-status")
async def get_my_referral_status(
    current_user: dict = Depends(get_current_user),
    user_repo: UserRepository = Depends(lambda: UserRepository())
):
    referral_code = current_user.get("personal_referral_code")
    if not referral_code:
        return {"referrals": []}

    referrals = await user_repo.get_referrals_by_code(referral_code)
    
    # Format the data for the frontend
    return [
        {
            "username": r.get("username"),
            "status": "Completed" if r.get("loyalty_meta", {}).get("completed_trips", 0) > 0 else "Pending Ride",
            "joined_at": r.get("created_at")
        } for r in referrals
    ]