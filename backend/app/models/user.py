from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

# --- 1. VEHICLE SCHEMA ---
class VehicleDetails(BaseModel):
    make_model: str = Field(default="Vehicle - N/A", example="Toyota Corolla")
    plate_number: str = Field(default="N/A", example="ABC-1234")
    color: Optional[str] = None
    total_seats: int = Field(4, ge=1, le=10) 
    car_type: str = Field(default="sedan", example="sedan") 
    
    # Optional because testing data might not have these URLs yet
    exterior_photo_url: Optional[str] = None
    interior_photo_url: Optional[str] = None
    registration_doc_url: Optional[str] = None

# --- 2. DRIVER SPECIFIC SCHEMA ---
class DriverProfile(BaseModel):
    # 🎯 UPDATED: Matches your DB "cnic" key
    cnic: str = Field(..., example="435345") 
    
    # 🎯 UPDATED: Matches your DB "contacts" array
    contacts: List[str] = Field(default_factory=list)
    
    license_number: Optional[str] = None
    cnic_front_url: Optional[str] = None
    cnic_back_url: Optional[str] = None
    license_front_url: Optional[str] = None
    
    # Nested Vehicle
    vehicle: VehicleDetails = Field(default_factory=VehicleDetails)
    
    is_verified: bool = False
    applied_at: datetime = Field(default_factory=datetime.utcnow)

# --- 3. MAIN USER SCHEMA ---
class UserBase(BaseModel):
    username: str
    email: EmailStr
    # Keep phone_number as optional top-level for Passenger roles
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str
    device_fingerprint: str
    referral_code_used: Optional[str] = None

class UserInDB(UserBase):
    # Support for MongoDB _id conversion
    id: str = Field(alias="_id")
    wallet_balance: float = 0.0
    
    roles: List[str] = ["PASSENGER"]
    is_driver: bool = False
    
    # DRIVER DATA (Matches your nested DB Object)
    driver_profile: Optional[DriverProfile] = None 
    
    active_trip_id: Any = None 
    rating: float = 5.0
    total_trips: int = 0
    referral_code: str
    referred_by: Optional[str] = None
    is_verified: bool = False 

    # Pydantic v2 Configuration
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )