from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging

# ✅ FIX: Point this to your deps file where the function actually exists
from app.core.deps import get_current_user 
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/api/passengers", tags=["passengers"])
payment_service = PaymentService()
logger = logging.getLogger("uvicorn.error")

@router.get("/payments", response_model=List[dict])
async def get_my_payment_history(current_user: dict = Depends(get_current_user)):
    """
    Endpoint for the Passenger Finance Log sidebar.
    Uses PaymentService to handle business logic and repository calls.
    """
    try:
        # 1. Extract User ID safely from the token context
        user_id = current_user.get("id") or str(current_user.get("_id"))
        
        if not user_id:
            logger.error("Payment Fetch Error: User ID missing from token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid authentication context"
            )

        # 2. Call the Service layer instead of the Repository directly
        # This allows for future logic like currency formatting or filtering
        payments = await payment_service.get_passenger_ledger(user_id)
        
        return payments

    except Exception as e:
        logger.error(f"Failed to retrieve passenger ledger: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Ledger Sync Failure"
        )