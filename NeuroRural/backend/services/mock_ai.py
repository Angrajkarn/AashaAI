import random
import time

class MockAIService:
    """
    Simulates AI responses for development without incurring API costs.
    """
    
    def analyze_symptoms(self, symptoms: str):
        """
        Simulates analyzing symptoms and providing a diagnosis.
        """
        # Simulate processing delay
        time.sleep(1.5)
        
        # Simple keyword matching for demo purposes
        symptoms_lower = symptoms.lower()
        
        if "fever" in symptoms_lower and "rash" in symptoms_lower:
            return {
                "diagnosis": "Suspected Measles",
                "confidence": 0.85,
                "urgent": True,
                "recommendation": "Isolate the patient. Check for Koplik spots in mouth. Administer Vitamin A if available.",
                "referral_needed": True
            }
        elif "cough" in symptoms_lower and "fever" in symptoms_lower:
            return {
                "diagnosis": "Viral URI / Potential Pneumonia",
                "confidence": 0.75,
                "urgent": False,
                "recommendation": "Monitor breathing rate. Paracetamol for fever. Warm fluids.",
                "referral_needed": False
            }
        elif "stomach" in symptoms_lower or "vomit" in symptoms_lower:
             return {
                "diagnosis": "Gastroenteritis",
                "confidence": 0.80,
                "urgent": False,
                "recommendation": "ORS (Oral Rehydration Solution) immediately. Zinc supplements for 14 days.",
                "referral_needed": False
            }
        else:
            return {
                "diagnosis": "General Viral Infection",
                "confidence": 0.60,
                "urgent": False,
                "recommendation": "Symptomatic treatment. Watch for danger signs.",
                "referral_needed": False
            }

mock_ai_service = MockAIService()
