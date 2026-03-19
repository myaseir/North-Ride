from pydantic import BaseModel, Field
from typing import Optional

class RatingSubmit(BaseModel):
    booking_id: str
    rating: int = Field(ge=1, le=5, description="Stars must be between 1 and 5")
    review_text: Optional[str] = None