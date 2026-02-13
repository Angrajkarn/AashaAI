import json
import os
from typing import List, Optional, Dict, Any

DB_FILE = "db.json"

INITIAL_DATA = {
    "users": [
        {
            "id": "u1",
            "name": "Sita Devi",
            "role": "ASHA Worker",
            "biometric_id": "bio_sita_123"
        }
    ],
    "patients": [
        {
            "id": "p1",
            "name": "Ravi Kumar",
            "age": 5,
            "gender": "Male",
            "symptoms": "High fever, Rash",
            "risk_level": "High",
            "status": "Pending Visit",
            "last_visit": "2023-10-25"
        },
        {
            "id": "p2",
            "name": "Lakshmi Amma",
            "age": 65,
            "gender": "Female",
            "symptoms": "Joint pain, Fatigue",
            "risk_level": "Medium",
            "status": "Follow-up",
            "last_visit": "2023-10-20"
        },
        {
            "id": "p3",
            "name": "Rajesh Singh",
            "age": 42,
            "gender": "Male",
            "symptoms": "Cough, Mild Fever",
            "risk_level": "Low",
            "status": "Resolved",
            "last_visit": "2023-10-15"
        }
    ],
    "triage_records": []
}

class JSONDatabase:
    def __init__(self, db_file=DB_FILE):
        self.db_file = db_file
        self._ensure_db()

    def _ensure_db(self):
        if not os.path.exists(self.db_file):
            print(f"Creating new database at {self.db_file}")
            self._save(INITIAL_DATA)
    
    def _load(self) -> Dict[str, Any]:
        try:
            with open(self.db_file, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
             return INITIAL_DATA

    def _save(self, data: Dict[str, Any]):
        with open(self.db_file, "w") as f:
            json.dump(data, f, indent=4)

    def get_user_by_biometric(self, bio_id: str) -> Optional[Dict]:
        data = self._load()
        for user in data["users"]:
            if user["biometric_id"] == bio_id:
                return user
        return None

    def get_patients(self) -> List[Dict]:
        data = self._load()
        return data["patients"]

    def get_patient(self, patient_id: str) -> Optional[Dict]:
        data = self._load()
        for p in data["patients"]:
            if p["id"] == patient_id:
                return p
        return None
    
    def save_triage_record(self, record: Dict):
        data = self._load()
        data["triage_records"].append(record)
        
        # If High Risk, also add/update patient status (simplified logic)
        if record.get("urgent"):
             # In a real app we'd link this to a specific patient properly
             pass
             
        self._save(data)

db = JSONDatabase()
