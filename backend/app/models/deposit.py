from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# ==========================================
# 1. DEPOSIT SCHEMAS
# ==========================================
class DepositCreate(BaseModel):
    """
    The payload sent when a user submits a payment screenshot/ID.
    """
    # 🆕 NEW: Link this payment to a specific booking/seat hold
    booking_id: Optional[str] = Field(None, example="64f1abc...") 
    
    full_name: str = Field(..., min_length=3, description="Full name of the sender")
    sender_number: str = Field(..., min_length=10, description="The Easypaisa/JazzCash number")
    amount: float = Field(..., gt=0, description="Amount sent in PKR")
    trx_id: str = Field(..., min_length=4, description="The unique Transaction ID")

    class Config:
        json_schema_extra = {
            "example": {
                "booking_id": "64f1abc...",
                "full_name": "M Yasir",
                "sender_number": "03001234567",
                "amount": 500.0,
                "trx_id": "882736451"
            }
        }

class DepositTransaction(DepositCreate):
    """
    The document stored in MongoDB.
    """
    id: str = Field(alias="_id") # 🆕 Added standard ID field
    user_id: str 
    username: str
    
    # 🆕 Logic: When status moves to COMPLETED, the linked booking becomes "Red"
    status: str = Field(default="PENDING", description="PENDING, COMPLETED, REJECTED")
    
    created_at: datetime = Field(default_factory=datetime.utcnow) # Changed to utcnow
    admin_note: Optional[str] = None
    approved_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

# ==========================================
# 2. WITHDRAWAL SCHEMAS
# ==========================================
class WithdrawalRequest(BaseModel):
    amount: float = Field(..., gt=0)
    method: str = Field(..., example="Easypaisa")
    account_number: str = Field(..., min_length=10)
    account_name: str = Field(..., min_length=3)

class WithdrawalTransaction(WithdrawalRequest):
    """
    🆕 Added InDB version for withdrawals to track progress.
    """
    id: str = Field(alias="_id")
    user_id: str
    status: str = "PENDING" # PENDING, PAID, REJECTED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True