from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import User

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class LoginRequest(BaseModel):
    biometric_id: str

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Backdoor for demo/dev
    if request.biometric_id == "demo_fingerprint":
        return {
            "token": "demo_token_123",
            "user": {
                "id": 1,
                "name": "Sita Devi",
                "role": "ASHA Worker"
            }
        }

    user = db.query(User).filter(User.biometric_id == request.biometric_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Biometric ID not recognized")
    
    return {
        "token": "mock_jwt_token",
        "user": {
            "id": user.id,
            "name": user.name,
            "role": user.role
        }
    }
