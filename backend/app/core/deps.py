from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token
from app.db.redis import redis_mgr 
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn.error")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Local import to prevent circular dependency
    from app.repositories.user_repo import UserRepository
    repo = UserRepository()

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session expired or invalid. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
        
    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception
        
    # --- 🛡️ REDIS HEARTBEAT ---
    try:
        await redis_mgr.set_player_online(user_id)
    except Exception as e:
        logger.error(f"Redis Heartbeat Failed: {e}")
    
    # Fetch User
    user = await repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User account not found.")
    
    # Standardize ID for the rest of the app
    if "_id" in user:
        user["id"] = str(user["_id"])
        
    return user

# --- 🚀 ROLE GUARDS ---

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    """
    FIXED: Now checks the 'roles' array for 'ADMIN'.
    """
    roles = current_user.get("roles", [])
    
    # Check for ADMIN in the roles list
    if "ADMIN" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Administrative access required."
        )
    return current_user

async def require_driver(current_user: dict = Depends(get_current_user)):
    roles = current_user.get("roles", [])
    
    if "DRIVER" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Driver profile required."
        )
    
    if not current_user.get("is_approved", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "DRIVER_PENDING_APPROVAL",
                "message": "Your documents are currently being reviewed."
            }
        )
    
    return current_user

async def require_verified_email(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address to continue."
        )
    return current_user