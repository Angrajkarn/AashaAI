import boto3
import json
import os
from typing import Dict, Any, Optional
from backend.services.rag_service import rag_service
from botocore.exceptions import ClientError

class OCRService:
    def __init__(self):
        self.region = os.getenv("AWS_REGION", "us-east-1")
        try:
            self.textract = boto3.client("textract", region_name=self.region)
        except Exception as e:
            print(f"Warning: Could not initialize Textract client: {e}")
            self.textract = None

    def digitize_prescription(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Uses AWS Textract to extract text and Claude 3 Opus to structure it clinicaly.
        """
        if not self.textract:
            return {"error": "OCR Service (Textract) not configured."}

        try:
            # 1. Extract raw text via Textract
            response = self.textract.detect_document_text(
                Document={'Bytes': image_bytes}
            )
            
            raw_text = ""
            for item in response['Blocks']:
                if item['BlockType'] == 'LINE':
                    raw_text += item['Text'] + "\n"

            if not raw_text.strip():
                return {"error": "No text detected in the image."}

            # 2. Use Claude 3 Opus to structure the raw text
            return self._structure_clinical_data(raw_text)

        except ClientError as e:
            print(f"Textract Error: {e}")
            return {"error": f"Textract failed: {str(e)}"}
        except Exception as e:
            print(f"OCR Error: {e}")
            return {"error": str(e)}

    def _structure_clinical_data(self, raw_text: str) -> Dict[str, Any]:
        """
        Use RAG/LLM logic to turn a mess of OCR lines into a structured EHR record.
        """
        prompt = f"""
        You are an expert Medical Registrar. I have a raw OCR transcript from a handwritten prescription.
        Extract the following information into a valid JSON object:
        {{
            "patient_name": "string or null",
            "age": "number or null",
            "date": "string or null",
            "medications": [
                {{
                    "name": "string",
                    "dosage": "string",
                    "frequency": "string",
                    "duration": "string"
                }}
            ],
            "diagnosis_notes": "string summary",
            "hospital_name": "string or null"
        }}

        Raw OCR Text:
        ---
        {raw_text}
        ---

        Return ONLY the JSON. If a field is missing, use null.
        """
        
        # We can reuse the Bedrock logic from rag_service but with a different prompt
        # For simplicity in this enterprise demo, we'll call a private method on rag_service or implement local bedrock call
        try:
            # Reuse the generic bedrock invocation if possible, or just call bedrock directly here
            # Since we have rag_service, lets use it as a helper or just do a quick invoke
            client = rag_service.client
            model_id = rag_service.model_id
            
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}]
            })
            
            resp = client.invoke_model(
                modelId=model_id,
                body=body,
                contentType="application/json",
                accept="application/json"
            )
            
            resp_body = json.loads(resp['body'].read().decode('utf-8'))
            text = resp_body['content'][0]['text']
            
            # Extract JSON
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end != -1:
                return json.loads(text[start:end])
            
            return {"error": "Failed to structure data", "raw": raw_text}

        except Exception as e:
            return {"error": f"Structuring failed: {str(e)}", "raw": raw_text}

ocr_service = OCRService()
