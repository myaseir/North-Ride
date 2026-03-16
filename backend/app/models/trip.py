from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import Optional, List
from datetime import datetime
from .booking import BookingInDB 

class TripBase(BaseModel):
    origin: str = Field(..., min_length=2, json_schema_extra={"example": "Gilgit"})
    destination: str = Field(..., min_length=2, json_schema_extra={"example": "Skardu"})
    departure_time: datetime
    total_seats: int = Field(default=4, gt=0)
    price: float = Field(..., gt=0)
    car_details: Optional[str] = Field(default="Toyota Sedan", json_schema_extra={"example": "Toyota Corolla - White"})

    # Pydantic v2 modern validator
    @model_validator(mode='after')
    def check_locations(self) -> 'TripBase':
        if self.origin.strip().lower() == self.destination.strip().lower():
            raise ValueError('Departure and Arrival hubs must be different.')
        return self

class TripCreate(TripBase):
    """Data sent by the frontend when publishing a new trip."""
    pass

class TripUpdate(BaseModel):
    """Fields allowed during a PATCH/PUT update."""
    status: Optional[str] = None # scheduled, in-progress, completed, cancelled
    available_seats: Optional[int] = None
    price: Optional[float] = None
    description: Optional[str] = None

class TripInDB(TripBase):
    """The full Trip object as it exists in MongoDB."""
    id: str = Field(alias="_id")
    driver_id: str
    available_seats: int
    status: str = "scheduled" 
    
    # Track the specific seats for the 3-state logic (Green/Yellow/Red)
    # Defaulting to 4 seats if not provided
    seat_layout: List[str] = Field(default=["1A", "1B", "2A", "2B"])
    
    passengers: List[BookingInDB] = [] 
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # 🎯 MODERN CONFIG (Pydantic v2)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        # Ensures datetime objects are serializable to ISO strings automatically
        json_encoders={datetime: lambda v: v.isoformat()} 
    )