from pydantic import BaseModel, Field
from typing import Optional

class TriageOutputSchema(BaseModel):
    """
    Strict Pydantic schema enforcing the expected JSON output from the AI Provider.
    This replaces the manual key extraction and ensures validation at the boundary.
    """
    diagnosis: str = Field(..., description="Structured WHO syndrome or preliminary diagnosis")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    urgent: bool = Field(..., description="True if this is a Red or Yellow WHO category emergency")
    recommendation: str = Field(..., description="Step-by-step action plan or immediate instruction")
    referral_needed: bool = Field(..., description="True if patient requires referral to a PHC/Hospital")

class AIProviderRequest(BaseModel):
    """
    Standardized request format sent to any AI provider (Bedrock, OpenAI, etc.)
    """
    symptoms: str
    age: int
    image_bytes: Optional[bytes] = None
    image_mime_type: str = "image/jpeg"
