from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from ..services.inventory_service import inventory_service

router = APIRouter(
    prefix="/api/inventory",
    tags=["inventory"]
)

@router.get("/status")
async def get_inventory_status():
    """
    Returns the current stock levels and AI-predicted exhaustion dates.
    """
    # Trigger a prediction update for the demo
    inventory_service.predict_demand()
    return inventory_service.get_inventory_status()

from ..services.websocket_manager import manager
import asyncio

@router.post("/reorder/{item_id}")
async def trigger_reorder(item_id: int):
    """
    Simulates sending an automated procurement request to the district hospital.
    """
    # Simulate DB update / status change
    inventory_service.predict_demand()
    
    # Broadcast to all clients
    asyncio.create_task(manager.broadcast({
        "type": "INVENTORY_REORDER",
        "item_id": item_id,
        "message": f"Procurement request initiated for Item #{item_id}"
    }))
    
    return {"message": f"Procurement request sent for item ID {item_id}", "status": "Request Pending"}
