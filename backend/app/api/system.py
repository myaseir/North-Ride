from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

# Matches: GET /api/system/health
@router.get("/health")
async def health():
    return {"status": "running"}

# Matches: GET /api/system/status (Fixes MaintenanceGuard.jsx 404)
@router.get("/status")
async def get_system_status():
    return {
        "maintenance": False, 
        "message": "All systems operational",
        "estimated_time": "Soon"
    }

# Matches: GET /api/system/version-check (Fixes UpdateGuard.jsx 404)
@router.get("/version-check")
async def version_check(v: str = Query(...)):
    # You can compare 'v' against your latest version here
    latest_version = "4.9.2"
    return {
        "must_update": v != latest_version,
        "latest_version": latest_version,
        "download_url": "https://brainbufferofficial.com/download"
    }