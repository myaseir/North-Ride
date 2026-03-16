from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from typing import Any
import json
from bson import ObjectId

router = APIRouter()

def serialize_mongo(data: Any) -> Any:
    """Helper to recursively convert MongoDB ObjectIds to strings."""
    if isinstance(data, list):
        return [serialize_mongo(item) for item in data]
    if isinstance(data, dict):
        return {k: serialize_mongo(v) for k, v in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    return data

@router.get("/me")
async def get_me(current_user: Any = Depends(get_current_user)):
    # 1. Force the object into a dictionary if it isn't one
    if hasattr(current_user, "to_dict"):
        user_data = current_user.to_dict()
    elif hasattr(current_user, "__dict__"):
        user_data = vars(current_user)
    else:
        user_data = current_user

    # 2. Use the recursive helper to wipe out all ObjectIds
    clean_user = serialize_mongo(user_data)

    # 3. Final polish for the frontend
    if "id" not in clean_user and "_id" in clean_user:
        clean_user["id"] = clean_user["_id"]
    
    # 4. Remove sensitive data
    clean_user.pop("_id", None)
    clean_user.pop("password", None)
    clean_user.pop("password_hash", None)

    return clean_user