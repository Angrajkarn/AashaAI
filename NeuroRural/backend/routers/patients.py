from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Patient

router = APIRouter(prefix="/api/patients", tags=["Patients"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
async def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    
    # Calculate stats
    high_risk_count = db.query(Patient).filter(Patient.risk_level == 'High').count()
    pending_count = db.query(Patient).filter(Patient.status == 'Pending Visit').count()
    
    return {
        "stats": {
            "high_risk": high_risk_count,
            "pending": pending_count
        },
        "patients": patients
    }

@router.get("/{patient_id}")
async def get_patient_details(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Manually serialize to include relationship
    return {
        "id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "address": patient.address,
        "contact_number": patient.contact_number,
        "risk_level": patient.risk_level,
        "status": patient.status,
        "last_visit": patient.last_visit,
        "triage_history": [
            {
                "id": t.id,
                "timestamp": t.timestamp,
                "symptoms": t.symptoms,
                "diagnosis": t.diagnosis,
                "confidence": t.confidence,
                "urgent": t.urgent,
                "recommendation": t.recommendation,
                "referral_needed": t.referral_needed,
                "image_url": t.image_url
            } for t in patient.triage_records
        ]
    }

from ..services.report_service import report_service

@router.post("/{patient_id}/report")
async def generate_patient_report(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Use triage_records relationship
    history = [
        {
            "timestamp": t.timestamp.isoformat(),
            "diagnosis": t.diagnosis,
            "symptoms": t.symptoms,
            "recommendation": t.recommendation
        } for t in patient.triage_records
    ]

    if not history:
         raise HTTPException(status_code=400, detail="No clinical history available for this patient.")

    patient_data = {
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "contact_number": patient.contact_number
    }

    report_content = report_service.generate_referral_report(patient_data, history)
    return {"report": report_content}
