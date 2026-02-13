class RAGService:
    """
    Mock Service to retrieve medical guidelines.
    In production, this would query a Vector DB (ChromaDB).
    """
    
    def retrieve_guidelines(self, query: str):
        """
        Returns relevant WHO/IPHS guidelines based on query.
        """
        # Mock retrieval based on keywords
        query_lower = query.lower()
        
        if "fever" in query_lower:
            return [
                "WHO Guideline: Fever in children under 5 - Assess for danger signs (convulsions, lethargy).",
                "IPHS Protocol: Administer Paracetamol 15mg/kg if temp > 38.5C."
            ]
        elif "rash" in query_lower:
            return [
                "Dermatology Atlas: Measles presents with maculopapular rash starting on face.",
                "RBSK Guidelines: Check for vitamin A deficiency signs."
            ]
        else:
            return ["General Care: Maintain hydration and monitor vitals."]

rag_service = RAGService()
