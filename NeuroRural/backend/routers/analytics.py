from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from ..services.analytics_service import analytics_service

router = APIRouter(
    prefix="/api/analytics",
    tags=["analytics"]
)

@router.get("/hotspots")
async def get_hotspots():
    """
    Returns geographical hotspot data for the Heatmap.
    """
    return analytics_service.get_symptom_hotspots()

@router.get("/alerts")
async def get_alerts():
    """
    Returns public health early warning alerts.
    """
    return analytics_service.get_outbreak_alerts()
