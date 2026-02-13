from backend.database import engine, SessionLocal, Base
from backend.models import User, Patient, TriageRecord
from sqlalchemy.orm import Session

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

def seed_data(db: Session):
    # Check if data exists
    if db.query(User).first():
        print("Data already exists. Skipping seed.")
        return

    print("Seeding data...")
    # Seed User
    user = User(name="Sita Devi", role="ASHA Worker", biometric_id="bio_sita_123")
    db.add(user)

    # Seed Patients
    p1 = Patient(name="Ravi Kumar", age=5, gender="Male", risk_level="High", status="Pending Visit")
    p2 = Patient(name="Lakshmi Amma", age=65, gender="Female", risk_level="Medium", status="Follow-up")
    p3 = Patient(name="Rajesh Singh", age=42, gender="Male", risk_level="Low", status="Resolved")
    
    db.add_all([p1, p2, p3])
    db.commit()

    # Seed Triage Records (linked to patients)
    t1 = TriageRecord(patient_id=p1.id, symptoms="High fever, Rash", diagnosis="Likely Measles", confidence=0.85, urgent=True, recommendation="Isolate & Vitamin A")
    t2 = TriageRecord(patient_id=p2.id, symptoms="Joint pain, Fatigue", diagnosis="Arthritis / Viral", confidence=0.70, urgent=False, recommendation="Rest & Paracetamol")
    t3 = TriageRecord(patient_id=p3.id, symptoms="Cough, Mild Fever", diagnosis="Viral URI", confidence=0.90, urgent=False, recommendation="Fluids")
    
    db.add_all([t1, t2, t3])
    db.commit()
    print("Data seeded successfully.")

if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    seed_data(db)
    
    # Verify
    users = db.query(User).all()
    patients = db.query(Patient).all()
    print(f"Users: {len(users)}")
    print(f"Patients: {len(patients)}")
    db.close()
