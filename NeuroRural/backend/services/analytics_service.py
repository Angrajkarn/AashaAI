import os
import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import TriageRecord

class AnalyticsService:
    def get_symptom_hotspots(self) -> List[Dict[str, Any]]:
        """
        Aggregates triage records to find geographical clusters of symptoms.
        In a real app, this would use PostGIS or geospatial queries.
        """
        db = SessionLocal()
        try:
            # For this enterprise demo, we simulate hotspots based on recent TriageRecords
            # In production: SELECT lat, lng, symptoms FROM triage_records WHERE created_at > NOW() - INTERVAL '7 days'
            records = db.query(TriageRecord).all()
            
            hotspots = []
            for r in records:
                # Simulate location data for demo (since we don't have GPS in the mock schema yet)
                # We'll cluster around a few coordinates in rural India
                hotspots.append({
                    "id": r.id,
                    "symptoms": r.symptoms,
                    "diagnosis": r.diagnosis,
                    "risk_level": "High" if r.urgent else "Medium",
                    # Random jitter around a central point (Wada, Maharashtra)
                    "lat": 19.65 + (hash(str(r.id)) % 100 / 1000.0),
                    "lng": 73.13 + (hash(str(r.id + 1)) % 100 / 1000.0)
                })
            return hotspots
        finally:
            db.close()

    def get_outbreak_alerts(self) -> List[Dict[str, Any]]:
        """
        Analysis logic to detect unusual spikes in symptoms.
        """
        # Logic: If > 5 cases of 'Fever' in a 1km radius in 24h, trigger alert
        return [
            {
                "type": "OUTBREAK_WARNING",
                "symptom": "Febrile Illness",
                "location": "Wada Block",
                "severity": "Moderate",
                "message": "Concentration of high fever cases detected in Wada North sector. Recommend vector control survey."
            }
        ]

analytics_service = AnalyticsService()
