from typing import Dict, Any, Type
from backend.services.ai.providers.base import BaseAIProvider
from backend.services.ai.providers.bedrock import BedrockProvider
from backend.services.ai.schemas import AIProviderRequest, TriageOutputSchema
from backend.core.logger import logger

class AIEngine:
    """
    Enterprise Factory orchestrating the AI subsystem.
    Handles fallbacks unconditionally when providers fail.
    """
    def __init__(self, provider_class: Type[BaseAIProvider] = BedrockProvider):
        # Allow dependency injection or configuration overrides
        self.provider = provider_class()
        
    def analyze_triage(self, request: AIProviderRequest) -> Dict[str, Any]:
        """
        Executes the AI provider workflow.
        Returns a strongly-typed dictionary mimicking the previous system to minimize structural changes in the router initially.
        """
        try:
            # The provider itself handles AWS retries and Schema Validation internally via tenacity retries.
            schema_output: TriageOutputSchema = self.provider.analyze_triage(request)
            return schema_output.model_dump()
            
        except Exception as e:
            logger.error(f"FATAL: All AI Retries Failed. Falling back to rule-based engine. Cause: {e}")
            return self._fallback_analysis(request)

    def _fallback_analysis(self, request: AIProviderRequest) -> Dict[str, Any]:
        """
        Hard fallback rule-based system if the API, Internet, or LLM fails.
        """
        symptoms_lower = request.symptoms.lower()
        if "fever" in symptoms_lower or "blood" in symptoms_lower or "emergency" in symptoms_lower or "convulsion" in symptoms_lower:
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

# Global singleton instance for routing
ai_engine = AIEngine()
