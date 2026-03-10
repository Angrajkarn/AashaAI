from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Form
from ..database import SessionLocal
from ..models import TriageRecord



router = APIRouter(
    prefix="/api/triage",
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TriageRequest(BaseModel):
    symptoms: str
    age: Optional[int] = 30

class MentorRequest(BaseModel):
    question: str
    context: Optional[str] = None

class TriageResponse(BaseModel):
    diagnosis: str
    confidence: float
    urgent: bool
    recommendation: str
    referral_needed: bool

from ..services.rag_service import rag_service
from ..services.ocr_service import ocr_service
from ..services.websocket_manager import manager

@router.post("/analyze", response_model=TriageResponse)
async def analyze(request: TriageRequest, db: Session = Depends(get_db)):
    """
    Analyze symptoms using the RAGService (Claude 3 Opus).
    """
    result = rag_service.analyze_symptoms(request.symptoms, request.age)
    
    # Save to DB
    record = TriageRecord(
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
    
    # Broadcast real-time urgent alert if risk is high
    if result["urgent"]:
        import asyncio
        asyncio.create_task(manager.broadcast({
            "type": "NEW_HIGH_RISK_PATIENT",
            "diagnosis": result["diagnosis"],
            "recommendation": result["recommendation"]
        }))
    
    return result

@router.post("/mentor")
async def mentor(request: MentorRequest):
    """
    AI Mentor endpoint for clinical guidance.
    """
    return {"response": rag_service.ask_mentor(request.question, request.context)}

@router.post("/voice")
async def analyze_voice(file: UploadFile = File(...)):
    """
    Enterprise Voice endpoint: Transcribes audio using Amazon Transcribe and triage with Claude 3.
    """
    from ..services.voice_service import voice_service
    audio_bytes = await file.read()
    
    # 1. Transcribe
    transcription = voice_service.transcribe_audio(audio_bytes)
    
    # 2. Analyze symptoms from transcription
    result = rag_service.analyze_symptoms(transcription)
    
    return {
        "transcription": transcription,
        "analysis": result
    }

@router.post("/digitize")
async def digitize(image: UploadFile = File(...)):
    """
    Enterprise OCR endpoint: Scans prescriptions using AWS Textract + Claude 3.
    """
    image_bytes = await image.read()
    return ocr_service.digitize_prescription(image_bytes)

import os
import shutil
import uuid

# Multimodal endpoint
@router.post("/multimodal")
async def analyze_multimodal(
    symptoms: str = Form(...),
    age: int = Form(30),
    patient_id: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Enterprise-level multimodal triage endpoint.
    Processes clinical text symptoms along with optional images (wounds, rashes) using Claude 3 Vision.
    Enforces WHO guidelines for the output.
    """
    if not symptoms:
        raise HTTPException(status_code=400, detail="Symptoms cannot be empty")
        
    image_bytes = None
    image_mime_type = "image/jpeg"
    saved_image_path = None
    
    # Process image if uploaded
    if image:
        try:
            image_bytes = await image.read()
            image_mime_type = image.content_type
            
            # Save file locally for reference (in production this would be S3)
            os.makedirs("uploads", exist_ok=True)
            saved_image_path = f"uploads/{uuid.uuid4()}_{image.filename}"
            
            with open(saved_image_path, "wb") as f:
                f.write(image_bytes)
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

    # 1. Analyze via Enterprise RAGService
    result = rag_service.analyze_symptoms(symptoms, age, image_bytes, image_mime_type)
    
    # 2. Save structurally to Database
    record = TriageRecord(
        patient_id=patient_id,
        symptoms=symptoms,
        diagnosis=result.get("diagnosis", "Unknown"),
        confidence=result.get("confidence", 0.0),
        urgent=result.get("urgent", False),
        recommendation=result.get("recommendation", "N/A"),
        referral_needed=result.get("referral_needed", False),
        image_url=saved_image_path
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    # 3. Real-time WebSocket Broadcast for Critical Cases (WHO Red/Yellow)
    if result.get("urgent") or result.get("referral_needed"):
        import asyncio
        asyncio.create_task(manager.broadcast({
            "type": "NEW_HIGH_RISK_PATIENT",
            "patient_id": patient_id,
            "diagnosis": result.get("diagnosis"),
            "recommendation": result.get("recommendation"),
            "image_url": saved_image_path
        }))
        
    return result
