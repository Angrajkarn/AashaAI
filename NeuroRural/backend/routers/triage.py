from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import TriageRecord
from ..services.mock_ai import mock_ai_service # Deprecated: logic moved to protocol_engine for fallback if needed, but we use protocol_engine now.
# Actually, I should remove it.


router = APIRouter(
    prefix="/api/triage",
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SymptomRequest(BaseModel):
    symptoms: str
    patient_id: Optional[str] = None
    age: Optional[int] = None

class TriageResponse(BaseModel):
    diagnosis: str
    confidence: float
    urgent: bool
    recommendation: str
    referral_needed: bool

from ..services.protocol_engine import protocol_engine

@router.post("/analyze", response_model=TriageResponse)
async def analyze_symptoms(request: SymptomRequest, db: Session = Depends(get_db)):
    """
    Analyze text-based symptoms to provide a preliminary diagnosis.
    """
    if not request.symptoms:
        raise HTTPException(status_code=400, detail="Symptoms cannot be empty")
    
    # Use Protocol Engine
    result = protocol_engine.analyze(request.symptoms, request.age or 30)
    
    # Save to DB
    record = TriageRecord(
        patient_id=request.patient_id, # Can be None for new walk-ins, or we need to handle it.
        symptoms=request.symptoms,
        diagnosis=result["diagnosis"],
        confidence=result["confidence"],
        urgent=result["urgent"],
        recommendation=result["recommendation"],
        referral_needed=result["referral_needed"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return result

@router.post("/voice")
async def analyze_voice(file: UploadFile = File(...)):
    """
    Upload an audio file for speech-to-text and symptom analysis.
    (Simulated for now)
    """
    # 1. Save file locally (optional)
    # 2. Transcribe using Whisper (Mocked: "High fever and cough")
    mock_transcription = "High fever and severe cough"
    
    # 3. Analyze using Protocol Engine
    result = protocol_engine.analyze(mock_transcription)
    return {
        "transcription": mock_transcription,
        "analysis": result
    }
