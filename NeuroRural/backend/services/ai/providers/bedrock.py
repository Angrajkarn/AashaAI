import json
import base64
import boto3
import time
from botocore.exceptions import ClientError
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from pydantic import ValidationError

from backend.core.config import settings
from backend.core.logger import logger
from backend.services.who_protocols import WHO_TRIAGE_INSTRUCTIONS
from backend.services.ai.providers.base import BaseAIProvider
from backend.services.ai.schemas import AIProviderRequest, TriageOutputSchema

class BedrockProvider(BaseAIProvider):
    """
    Enterprise Bedrock Provider.
    Includes explicit schema enforcement, timing metrics, and exponential backoff.
    """
    
    def __init__(self):
        self.region = settings.AWS_REGION
        self.model_id = settings.BEDROCK_MODEL_ID
        try:
            self.client = boto3.client("bedrock-runtime", region_name=self.region)
            logger.info(f"Initialized {self.provider_name} with model: {self.model_id}")
        except Exception as e:
            logger.error(f"Failed to initialize {self.provider_name}: {e}")
            self.client = None

    @property
    def provider_name(self) -> str:
        return "AWS Bedrock (Claude 3)"

    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        retry=retry_if_exception_type((ClientError, ValidationError)),
        reraise=True
    )
    def analyze_triage(self, request: AIProviderRequest) -> TriageOutputSchema:
        """
        Invokes Claude 3 via Bedrock, strictly enforcing Pydantic schemas.
        Will retry automatically on HTTP errors or schema validation failures.
        """
        if not self.client:
            raise RuntimeError(f"{self.provider_name} client is offline.")

        prompt_text = f"""
        {WHO_TRIAGE_INSTRUCTIONS}

        You are an advanced medical triage AI assisting a rural healthcare worker.
        Analyze the patient's symptoms and any provided images.

        Patient Age: {request.age}
        Symptoms reported: {request.symptoms}

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

        content_blocks = [{"type": "text", "text": prompt_text}]

        if request.image_bytes:
            base64_image = base64.b64encode(request.image_bytes).decode("utf-8")
            content_blocks.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": request.image_mime_type,
                    "data": base64_image
                }
            })

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [{"role": "user", "content": content_blocks}]
        })
        
        start_time = time.time()
        try:
            logger.info(f"Invoking {self.provider_name} for Triage Analysis...")
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=body,
                contentType="application/json",
                accept="application/json"
            )
        except ClientError as e:
            logger.error(f"AWS Bedrock API Error: {str(e)}. Retrying...")
            raise e
            
        latency = round((time.time() - start_time) * 1000, 2)
        
        response_body = json.loads(response['body'].read().decode('utf-8'))
        raw_output = response_body['content'][0]['text']
        
        # Guard against conversational markdown wrapping
        if "```json" in raw_output:
            raw_output = raw_output.split("```json")[1]
        if "```" in raw_output:
            raw_output = raw_output.split("```")[0]
            
        raw_output = raw_output.strip()

        try:
            # Pydantic will rigorously validate types and required keys.
            valid_schema = TriageOutputSchema.model_validate_json(raw_output)
            logger.info(f"{self.provider_name} analysis complete in {latency}ms.")
            return valid_schema
        except ValidationError as e:
            logger.error(f"AI returned invalid schema: {raw_output}. Triggering retry. Error: {e}")
            raise e
