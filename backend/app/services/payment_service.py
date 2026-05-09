from __future__ import annotations
from app.repositories.booking_repo import BookingRepository
from typing import List

class PaymentService:
    def __init__(self):
        self.booking_repo = BookingRepository()

    async def get_passenger_ledger(self, user_id: str) -> List[dict]:
    # Fetch data from repo
        payments = await self.booking_repo.get_passenger_payments(user_id)
    
        enriched_payments = []
        for payment in payments:
        # 🎯 FINAL SAFETY: If it's still a BSON type, kill it here
            p = {**payment}
            for key, value in p.items():
                if "ObjectId" in str(type(value)):
                    p[key] = str(value)

        # Your enrichment logic
            p["final_driver_contact"] = p.get("manual_driver_contact_1") or "Pending Verification"
            p["is_cleared"] = p.get("status") == "confirmed"
        
            enriched_payments.append(p)

        return enriched_payments