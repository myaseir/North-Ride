from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DriverAssignment(BaseModel):
    booking_id: str
    driver_id: str
    display_name: str       
    contact_1: str          
    contact_2: Optional[str] = None
    car_details: str        
    assigned_at: datetime = datetime.now()