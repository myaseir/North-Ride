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

@router.get("/payments")
async def get_my_payment_history(current_user: dict = Depends(get_current_user)):
    try:
        # Ensure we use a clean string ID
        user_id = str(current_user["_id"])
        return await payment_service.get_passenger_ledger(user_id)
    except Exception as e:
        logger.error(f"Ledger Crash: {str(e)}")
        # Return detail as a STRING to prevent React "Object" crash
        raise HTTPException(status_code=500, detail=f"Ledger Sync Error: {str(e)}")