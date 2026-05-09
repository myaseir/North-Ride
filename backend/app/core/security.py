import secrets
import string
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def generate_otp(length: int = 6) -> str:
    # 'secrets' module is cryptographically secure, perfect for OTPs
    return "".join(secrets.choice(string.digits) for _ in range(length))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Creates a JWT token. 
    'data' includes 'sub' (user_id) and 'roles' (list of strings).
    """
    to_encode = data.copy()
    
    # Calculate expiration
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": str(uuid.uuid4()),
        "iss": settings.PROJECT_NAME
    })
    
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes the token and validates the structure.
    Returns the full payload including roles if valid.
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # Verify that the essential 'sub' (user_id) field exists
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
            
        return payload
    except (JWTError, AttributeError):
        return None

def create_refresh_token(user_id: str) -> str:
    """
    Optional: Create a longer-lived token for 'Remember Me' functionality.
    """
    # 🎯 THE FIX: Pass a timedelta directly, not a calculated datetime.
    delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    return create_access_token(
        data={"sub": user_id, "type": "refresh"}, 
        expires_delta=delta
    )