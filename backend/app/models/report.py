from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ReportCreate(BaseModel) :
    trip_id: Optional[str] = None
    # 🆕 NEW: specific seats related to the report (e.g., "RL", "RC")
    # Helpful for "Seat was dirty" or "Payment not received for these seats"
    affected_seats: Optional[List[str]] = Field(default=[], example=["RL"])
    
    report_type: str = Field(..., example="Safety", description="Safety, Technical, or Payment")
    description: str = Field(..., min_length=10)
    
    # 🆕 NEW: Evidence URL (e.g., photo of a technical issue or payment proof)
    evidence_url: Optional[str] = None

class ReportInDB(ReportCreate):
    id: str = Field(alias="_id")
    reporter_id: str
    
    # 🆕 NEW: Who the report is against (usually the Driver or a specific Passenger)
    target_user_id: Optional[str] = None
    
    status: str = "open" # open, investigating, resolved
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True