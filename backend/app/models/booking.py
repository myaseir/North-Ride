from pydantic import BaseModel, Field, computed_field
from typing import Optional, List
from datetime import datetime, timezone

class BookingCreate(BaseModel):
    trip_id: str
    seat_layout: List[str]
    transactionId: str
    senderName: str
    account_number: str
    amount_paid: float   # This is the 100% total (Base + Surcharge)
    apply_discount: bool = False

class BookingUpdate(BaseModel):
    status: str 
    manual_driver_contact_1: Optional[str] = None
    manual_driver_contact_2: Optional[str] = None
    admin_notes: Optional[str] = None

class BookingInDB(BaseModel):
    id: str = Field(alias="_id")
    trip_id: str
    passenger_id: str
    passenger_name: Optional[str] = None
    passenger_phone: Optional[str] = None
    
    seat_layout: List[str] 
    
    # --- 🎯 NEW FINANCIAL FIELDS ---
    total_price: float         # The full cost (e.g., 7500)
    amount_paid: float = 0.0   # The 20% advance actually paid (e.g., 1500)
    surcharge_amount: float = 0.0 # The +2500 if Front Seat was picked
    has_premium_seat: bool = False # Easy flag for UI/Admin
    
    status: str = "pending" 
    
    manual_driver_contact_1: Optional[str] = None
    manual_driver_contact_2: Optional[str] = None
    
    rating_popup_shown: bool = False
    rating: Optional[int] = None
    review_text: Optional[str] = None
    rated_at: Optional[datetime] = None
    
    
    payout_status: Optional[str] = None # "pending", "credited", "rejected"
    commission_deducted: Optional[float] = None
    amount_transferred: Optional[float] = None
    bank_transfer_ref: Optional[str] = None
    payout_processed_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    verified_at: Optional[datetime] = None

    # --- 🎯 NEW COMPUTED FIELD FOR THE DRIVER ---
    @computed_field 
    @property
    def remaining_balance(self) -> float:
        """The 'Collect Cash' amount for the Driver."""
        return self.total_price - self.amount_paid

    @computed_field 
    @property
    def is_verified(self) -> bool:
        return self.status == "confirmed"

    class Config:
        populate_by_name = True