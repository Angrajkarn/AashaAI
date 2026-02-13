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
    return patient
