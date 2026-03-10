import json
import base64
import boto3
from typing import Dict, Any, Optional
from botocore.exceptions import ClientError
from backend.core.config import settings
from backend.core.logger import logger
from backend.services.who_protocols import WHO_TRIAGE_INSTRUCTIONS

class MultimodalAIService:
    """
    Advanced AWS Bedrock integration supporting Multimodal Inputs (Text + Images)
    and strict WHO Triage guideline enforcement.
    """
    def __init__(self):
        self.region = settings.AWS_REGION
        self.model_id = settings.BEDROCK_MODEL_ID
        try:
            self.client = boto3.client("bedrock-runtime", region_name=self.region)
            logger.info(f"Initialized Bedrock client with model: {self.model_id}")
        except Exception as e:
            logger.error(f"Failed to initialize Bedrock client: {e}")
            self.client = None

    def analyze_triage(
        self, 
        symptoms: str, 
        age: int = 30, 
        image_bytes: Optional[bytes] = None, 
        image_mime_type: str = "image/jpeg"
    ) -> Dict[str, Any]:
        """
        Analyze multimodal symptoms and images using Claude 3 vision capabilities.
        """
        if not self.client:
            logger.warning("AWS Bedrock not configured. Falling back to rule-based engine.")
            return self._fallback_analysis(symptoms)

        prompt_text = f"""
        {WHO_TRIAGE_INSTRUCTIONS}

        You are an advanced medical triage AI assisting a rural healthcare worker.
        Analyze the patient's symptoms and any provided images.

        Patient Age: {age}
        Symptoms reported: {symptoms}

        You must output ONLY a valid JSON object matching exactly this schema:
        {{
            "diagnosis": "Structured WHO syndrome (e.g., 'Suspected Severe Infection')",
            "confidence": 0.85,
            "urgent": true,
            "recommendation": "Step-by-step action",
            "referral_needed": true
        }}
        Do not include markdown or explanations. Output pure JSON.
        """

        # Construct Claude 3 message content block
        content_blocks = [
            {"type": "text", "text": prompt_text}
        ]

        # Attach image if provided
        if image_bytes:
            base64_image = base64.b64encode(image_bytes).decode("utf-8")
            content_blocks.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": image_mime_type,
                    "data": base64_image
                }
            })

        try:
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "messages": [
                    {
                        "role": "user",
                        "content": content_blocks
                    }
                ]
            })
            
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=body,
                contentType="application/json",
                accept="application/json"
            )
            
            response_body = json.loads(response['body'].read().decode('utf-8'))
            output_text = response_body['content'][0]['text']
            
            # Clean possible markdown
            if "```json" in output_text:
                output_text = output_text.split("```json")[1]
            if "```" in output_text:
                output_text = output_text.split("```")[0]
                
            result = json.loads(output_text.strip())
            return result
            
        except Exception as e:
            logger.error(f"Multimodal AI Error: {str(e)}")
            return self._fallback_analysis(symptoms)

    def _fallback_analysis(self, symptoms: str) -> Dict[str, Any]:
        symptoms_lower = symptoms.lower()
        if "fever" in symptoms_lower or "blood" in symptoms_lower or "emergency" in symptoms_lower:
            return {
                "diagnosis": "EMERGENCY: Fallback Rule Triggered",
                "confidence": 0.9,
                "urgent": True,
                "recommendation": "IMMEDIATE REFERRAL AND RESUSCITATION.",
                "referral_needed": True
            }
        return {
            "diagnosis": "NON-URGENT: Fallback",
            "confidence": 0.5,
            "urgent": False,
            "recommendation": "Standard home care and monitor.",
            "referral_needed": False
        }

multimodal_ai = MultimodalAIService()
