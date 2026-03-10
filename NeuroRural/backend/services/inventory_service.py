import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import InventoryItem, TriageRecord

class InventoryService:
    def get_inventory_status(self) -> List[Dict[str, Any]]:
        db = SessionLocal()
        try:
            items = db.query(InventoryItem).all()
            if not items:
                # Seed some data for the enterprise demo if empty
                self._seed_inventory(db)
                items = db.query(InventoryItem).all()
            
            # Update predictions based on recent triage activity
            return [self._format_item(item) for item in items]
        finally:
            db.close()

    def _format_item(self, item: InventoryItem) -> Dict[str, Any]:
        return {
            "id": item.id,
            "item_name": item.item_name,
            "current_stock": item.current_stock,
            "min_threshold": item.min_threshold,
            "unit": item.unit,
            "status": "Critical" if item.current_stock <= item.min_threshold else "Stable",
            "predicted_exhaustion": item.predicted_exhaustion_date.strftime("%Y-%m-%d") if item.predicted_exhaustion_date else "N/A"
        }

    def _seed_inventory(self, db: Session):
        initial_items = [
            InventoryItem(item_name="Paracetamol 500mg", current_stock=1200, min_threshold=500, unit="tablets"),
            InventoryItem(item_name="Anti-Venom (Polyvalent)", current_stock=5, min_threshold=10, unit="vials"),
            InventoryItem(item_name="Oral Rehydration Salts", current_stock=450, min_threshold=200, unit="packets"),
            InventoryItem(item_name="Diagnostic Kits (Malaria)", current_stock=50, min_threshold=100, unit="kits")
        ]
        db.add_all(initial_items)
        db.commit()

    def predict_demand(self):
        """
        AI Logic: Link Heatmap clusters to Inventory.
        If 'Fever' cluster volume > X, move 'Paracetamol' exhaustion date earlier.
        """
        db = SessionLocal()
        try:
            # Simple simulation: if we have more than 10 recent triage records, assume high demand
            recent_triage_count = db.query(TriageRecord).count()
            items = db.query(InventoryItem).all()
            
            for item in items:
                # Mock AI projection
                days_left = (item.current_stock / 50) if recent_triage_count < 10 else (item.current_stock / 150)
                item.predicted_exhaustion_date = datetime.utcnow() + timedelta(days=max(1, int(days_left)))
            
            db.commit()
        finally:
            db.close()

inventory_service = InventoryService()
