import os
import json
import boto3
from typing import Dict, Any, Optional
from botocore.exceptions import ClientError

class RAGService:
    """
    AWS Bedrock integration for intelligent Medical Triage.
    Replaces the mock protocol engine.
    """
    def __init__(self):
        # Relies on standard AWS credentials in environment or ~/.aws/credentials
        self.region = os.getenv("AWS_REGION", "us-east-1")
        self.model_id = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-opus-20240229-v1:0")
        try:
            self.client = boto3.client("bedrock-runtime", region_name=self.region)
        except Exception as e:
            print(f"Warning: Could not initialize Bedrock client: {e}")
            self.client = None

    def analyze_symptoms(self, symptoms: str, age: int = 30) -> Dict[str, Any]:
        """
        Analyze symptoms using Claude 3 via AWS Bedrock.
        """
        if not self.client:
            # Fallback if AWS is not configured, to not break the app completely
            return self._fallback_analysis(symptoms)

        prompt = f"""
        You are a medical triage AI assisting a rural healthcare worker (ASHA worker) in India.
        You must analyze the patient's symptoms and output a valid JSON response matching this schema EXACTLY:
        {{
            "diagnosis": "Short preliminary diagnosis string",
            "confidence": 0.85,  // float between 0.0 and 1.0
            "urgent": true, // boolean
            "recommendation": "Clear actionable step according to WHO/IPHS guidelines",
            "referral_needed": true // boolean: whether to refer to a hospital/PHC
        }}

        Patient Age: {age}
        Symptoms reported: {symptoms}

        Output ONLY the raw JSON object. Do not include markdown formatting or explanations.
        """
        
        try:
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 500,
                "messages": [
                    {"role": "user", "content": prompt}
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
            
            # Clean possible markdown from the LLM response
            if output_text.startswith("```json"):
                output_text = output_text[7:]
            if output_text.endswith("```"):
                output_text = output_text[:-3]
                
            result = json.loads(output_text.strip())
            
            # Ensure required keys exist
            required_keys = ["diagnosis", "confidence", "urgent", "recommendation", "referral_needed"]
            for key in required_keys:
                if key not in result:
                    raise ValueError(f"Missing key in LLM response: {key}")
                    
            return result
            
        except ClientError as e:
            print(f"Bedrock ClientError: {e}")
            return self._fallback_analysis(symptoms)
        except json.JSONDecodeError as e:
            print(f"JSON Parsing Error: {e}")
            return self._fallback_analysis(symptoms)
        except Exception as e:
            print(f"Unexpected Error during Bedrock invocation: {e}")
            return self._fallback_analysis(symptoms)

    def _fallback_analysis(self, symptoms: str) -> Dict[str, Any]:
        """Fallback rule-based analysis if AWS Bedrock fails."""
        symptoms_lower = symptoms.lower()
        if "fever" in symptoms_lower and ("high" in symptoms_lower or "convulsion" in symptoms_lower):
            return {
                "diagnosis": "High Fever (Fallback Engine)",
                "confidence": 0.8,
                "urgent": True,
                "recommendation": "Administer Paracetamol. Refer to PHC immediately.",
                "referral_needed": True
            }
        return {
            "diagnosis": "Undifferentiated Illness (Fallback Engine)",
            "confidence": 0.5,
            "urgent": False,
            "recommendation": "Monitor vitals. Consult doctor if symptoms worsen.",
            "referral_needed": False
        }

    def ask_mentor(self, question: str, context: Optional[str] = None) -> str:
        """
        AI Mentor feature: Provides clinical guidance and protocol answers.
        """
        if not self.client:
            return "Mentor is currently offline. Please refer to physical WHO manuals."

        prompt = f"""
        You are 'Aasha Mentor', an expert clinical consultant for ASHA workers in rural India.
        Your goal is to provide clear, accurate, and actionable medical guidance based on official health protocols.
        
        Question: {question}
        Additional Context: {context if context else 'None'}
        
        Guidelines:
        1. Be supportive and professional.
        2. If the case sounds urgent, prioritize immediate referral instructions.
        3. Use simple clinical language suitable for health workers.
        4. If you are unsure, advise consulting a Medical Officer (MO) at the nearest PHC.
        
        Response:
        """
        
        try:
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            })
            
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=body,
                contentType="application/json",
                accept="application/json"
            )
            
            response_body = json.loads(response['body'].read().decode('utf-8'))
            return response_body['content'][0]['text']
            
        except Exception as e:
            print(f"Mentor Error: {e}")
            return "I'm having trouble connecting to my knowledge base. Please consult your local supervisor."

rag_service = RAGService()
