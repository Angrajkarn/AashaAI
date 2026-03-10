from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend.models import Base, Patient, TriageRecord, InventoryItem, User
from datetime import datetime, timedelta

# Create tables
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # 1. Create Demo User
    if not db.query(User).filter(User.biometric_id == "demo_fingerprint_001").first():
        user = User(name="Asha Jyoti", role="ASHA Worker", biometric_id="demo_fingerprint_001")
        db.add(user)

    # 2. Create Sample Patients with History
    patients_data = [
        {"name": "Rajesh Kumar", "age": 45, "gender": "Male", "risk_level": "High", "status": "Pending Visit"},
        {"name": "Sunita Devi", "age": 32, "gender": "Female", "risk_level": "Medium", "status": "Active"},
        {"name": "Amit Singh", "age": 12, "gender": "Male", "risk_level": "Low", "status": "Resolved"}
    ]

    for p_data in patients_data:
        p = db.query(Patient).filter(Patient.name == p_data["name"]).first()
        if not p:
            p = Patient(**p_data)
            db.add(p)
            db.commit()
            db.refresh(p)
            
            # Add historical triage records
            t1 = TriageRecord(
                patient_id=p.id,
                symptoms="Fever and mild cough",
                diagnosis="Viral Infection",
                confidence=0.85,
                urgent=False,
                recommendation="Rest and Paracetamol",
                referral_needed=False,
                timestamp=datetime.utcnow() - timedelta(days=10)
            )
            t2 = TriageRecord(
                patient_id=p.id,
                symptoms="Severe chest pain and sweating",
                diagnosis="Potential Cardiac Event",
                confidence=0.92,
                urgent=True,
                recommendation="Immediate Referral to District Hospital",
                referral_needed=True,
                timestamp=datetime.utcnow() - timedelta(days=1)
            )
            db.add(t1)
            db.add(t2)

    # 3. Create Sample Inventory
    items = [
        {"item_name": "Paracetamol", "current_stock": 50, "min_threshold": 100, "unit": "tablets"},
        {"item_name": "Anti-Venom", "current_stock": 5, "min_threshold": 10, "unit": "vials"},
        {"item_name": "ORS Packets", "current_stock": 200, "min_threshold": 50, "unit": "pouches"}
    ]

    for i_data in items:
        item = db.query(InventoryItem).filter(InventoryItem.item_name == i_data["item_name"]).first()
        if not item:
            item = InventoryItem(**i_data)
            db.add(item)

    db.commit()
    db.close()
    print("Database seeded successfully with enterprise-grade data.")

if __name__ == "__main__":
    seed_data()
