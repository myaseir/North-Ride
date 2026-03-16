from __future__ import annotations
from app.repositories.booking_repo import BookingRepository
from typing import List, Optional # Added Optional

class PaymentService:
    def __init__(self):
        self.booking_repo = BookingRepository()

    async def get_passenger_ledger(self, user_id: str) -> List[dict]:
        """
        Business logic for the passenger financial history.
        """
        # 1. Fetch raw data from the repository
        payments = await self.booking_repo.get_passenger_payments(user_id)
        
        # 2. Enrich the ledger with the "Shadow Routing" logic
        for payment in payments:
            # If Admin provided custom contacts, prioritize them for the UI
            # This ensures the 'History' tab matches the 'Active Trip' tab
            payment["final_driver_contact"] = payment.get("manual_driver_contact_1") or "Default Driver Info"
            
            # Professional touch: Add a boolean for the frontend to show a "Verified" badge
            payment["is_cleared"] = payment.get("status") == "confirmed"

        return payments