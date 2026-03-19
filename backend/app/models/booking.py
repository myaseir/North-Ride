from pydantic import BaseModel, Field, computed_field
from typing import Optional, List
from datetime import datetime, timezone

class BookingCreate(BaseModel):
    trip_id: str
    seat_layout: List[str]
    transactionId: str
    senderName: str
    account_number: str  # Required    # Required
    amount_paid: float   # Required
    apply_discount: bool = False
    

class BookingUpdate(BaseModel):
    # status: pending, confirmed, cancelled, completed
    status: str 
    # 🎯 NEW: Fields for Admin to provide custom driver contacts during verification
    manual_driver_contact_1: Optional[str] = None
    manual_driver_contact_2: Optional[str] = None
    admin_notes: Optional[str] = None

class BookingInDB(BaseModel):
    id: str = Field(alias="_id")
    trip_id: str
    passenger_id: str
    # 🎯 NEW: Store passenger name/phone snapshot for the Driver's Manifest
    # This prevents issues if a passenger changes their profile later
    passenger_name: Optional[str] = None
    passenger_phone: Optional[str] = None
    
    
    seat_layout: List[str] 
    total_price: float
    status: str = "pending" 
    
    # 🎯 NEW: Shadow Routing fields stored in DB
    manual_driver_contact_1: Optional[str] = None
    manual_driver_contact_2: Optional[str] = None
    
    rating_popup_shown: bool = False  # The "One-Time" gatekeeper
    rating: Optional[int] = None      # 1-5 Stars
    review_text: Optional[str] = None # Optional user comment
    rated_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    verified_at: Optional[datetime] = None

    @computed_field 
    @property
    def is_verified(self) -> bool:
        return self.status == "confirmed"

    class Config:
        populate_by_name = True