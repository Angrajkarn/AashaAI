import re
from typing import Dict, Any

class ProtocolEngine:
    """
    Detailed Rule-Based Engine to simulate RAG (Retrieval-Augmented Generation).
    In a full scale system, this would retrieve from a vector DB.
    Here, we use a structured dictionary of medical protocols.
    """
    
    PROTOCOLS = {
        "fever_high_risk": {
            "keywords": ["fever", "hot", "temperature"],
            "conditions": lambda age, temp: age < 5 or temp > 102,
            "diagnosis": "High Fever (Potential Infection)",
            "confidence": 0.88,
            "urgent": True,
            "recommendation": "IMMEDIATE ACTION: Administer Paracetamol. Tepid sponging. Refer to PHC if convulsions occur.",
            "guideline_ref": "IPHS Guidelines for Child Care"
        },
        "respiratory_infection": {
            "keywords": ["cough", "breath", "cold", "runny nose"],
            "conditions": lambda age, _: True, 
            "diagnosis": "Acute Respiratory Infection (ARI)",
            "confidence": 0.75,
            "urgent": False,
            "recommendation": "Keep warm. Steam inhalation. If fast breathing -> Refer to hospital.",
            "guideline_ref": "WHO ARI Management"
        },
        "dehydration": {
            "keywords": ["vomit", "diarrhea", "loose motion", "stomach"],
            "conditions": lambda age, _: True,
            "diagnosis": "Gastroenteritis / Dehydration",
            "confidence": 0.90,
            "urgent": True,
            "recommendation": "Start ORS immediately. Zinc supplements for 14 days. Monitor skin pinch return.",
            "guideline_ref": "National Diarrhea Control Program"
        },
        "skin_infection": {
            "keywords": ["rash", "itch", "redness", "spots"],
            "conditions": lambda age, _: True,
            "diagnosis": "Dermatitis / Potential Viral Exanthem",
            "confidence": 0.70,
            "urgent": False,
            "recommendation": "Keep area dry and clean. Apply Calamine lotion if itching. Check for measles signs.",
            "guideline_ref": "Dermatology Atlas"
        },
        "anemia": {
            "keywords": ["tired", "weak", "pale", "fatigue"],
            "conditions": lambda age, _: True,
            "diagnosis": "Suspected Anemia",
            "confidence": 0.65,
            "urgent": False,
            "recommendation": "Check Iron/Folic Acid supplementation. Encourage green leafy vegetables.",
            "guideline_ref": "Anemia Mukt Bharat"
        }
    }

    def analyze(self, symptoms: str, age: int = 30) -> Dict[str, Any]:
        """
        Analyze symptoms against protocols.
        """
        symptoms_lower = symptoms.lower()
        matched_protocol = None
        max_matches = 0

        # Simple keyword matching scoring
        for key, protocol in self.PROTOCOLS.items():
            matches = sum(1 for k in protocol["keywords"] if k in symptoms_lower)
            if matches > max_matches:
                max_matches = matches
                matched_protocol = protocol
        
        if matched_protocol:
            return {
                "diagnosis": matched_protocol["diagnosis"],
                "confidence": matched_protocol["confidence"],
                "urgent": matched_protocol["urgent"],
                "recommendation": f"{matched_protocol['recommendation']} (Ref: {matched_protocol['guideline_ref']})",
                "referral_needed": matched_protocol["urgent"]
            }
        else:
            return {
                "diagnosis": "Undifferentiated Illness",
                "confidence": 0.50,
                "urgent": False,
                "recommendation": "Monitor vitals. Symptomatic treatment. Refer if symptoms worsen.",
                "referral_needed": False
            }

protocol_engine = ProtocolEngine()
