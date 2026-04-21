from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
# Ensure this import path is correct for your project structure
from .booking import BookingInDB 

class TripBase(BaseModel):
    origin: str = Field(..., min_length=2, json_schema_extra={"example": "Gilgit"})
    destination: str = Field(..., min_length=2, json_schema_extra={"example": "Skardu"})
    departure_time: datetime
    
    # 🎯 THE CRITICAL FIX: Add these so Pydantic doesn't delete them!
    # These preserve the "11:05" local time string from your frontend.
    time: Optional[str] = Field(None, json_schema_extra={"example": "11:05"})
    date: Optional[str] = Field(None, json_schema_extra={"example": "2026-04-22"})
    
    total_seats: int = Field(default=4, gt=0)
    price: float = Field(..., gt=0)
    car_details: Optional[str] = Field(default="Toyota Sedan", json_schema_extra={"example": "Toyota Corolla - White"})

    @model_validator(mode='after')
    def check_locations(self) -> 'TripBase':
        if self.origin.strip().lower() == self.destination.strip().lower():
            raise ValueError('Departure and Arrival hubs must be different.')
        return self

class TripCreate(TripBase):
    """Data sent by the frontend when publishing a new trip."""
    pass

class TripUpdate(BaseModel):
    status: Optional[str] = None 
    available_seats: Optional[int] = None
    price: Optional[float] = None
    description: Optional[str] = None

class TripInDB(TripBase):
    id: str = Field(alias="_id")
    driver_id: str
    available_seats: int
    status: str = "scheduled" 
    
    # 🎯 ALIGNMENT FIX: Matches your "Realistic Cabin" logic
    seat_layout: List[str] = Field(default=["FL", "RL", "RC", "RR"])
    
    passengers: List[BookingInDB] = [] 
    
    # 🎯 MODERN FIX: Use timezone-aware now
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )