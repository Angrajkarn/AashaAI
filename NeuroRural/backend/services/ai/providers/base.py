from abc import ABC, abstractmethod
from typing import Optional
from backend.services.ai.schemas import AIProviderRequest, TriageOutputSchema

class BaseAIProvider(ABC):
    """
    Abstract Base Class for Multimodal AI Providers.
    All enterprise AI integrations (Bedrock, OpenAI) must implement this interface.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the name of the AI provider."""
        pass

    @abstractmethod
    def analyze_triage(self, request: AIProviderRequest) -> TriageOutputSchema:
        """
        Process the text and optional image constraints into a strongly-typed TriageOutputSchema.
        Should raise appropriate exceptions on failure so the engine can retry or fallback.
        """
        pass
