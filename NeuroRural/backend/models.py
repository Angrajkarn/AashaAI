from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String)
    biometric_id = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    address = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    risk_level = Column(String, default="Low") # Low, Medium, High
    status = Column(String, default="Active") # Active, Resolved, Pending Visit
    last_visit = Column(DateTime, default=datetime.utcnow)

    triage_records = relationship("TriageRecord", back_populates="patient")

class TriageRecord(Base):
    __tablename__ = "triage_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    symptoms = Column(String)
    diagnosis = Column(String)
    confidence = Column(Float)
    urgent = Column(Boolean)
    recommendation = Column(String)
    referral_needed = Column(Boolean)
    image_url = Column(String, nullable=True) # Multimodal support: local path or S3 URL
    timestamp = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="triage_records")

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    current_stock = Column(Integer)
    min_threshold = Column(Integer)
    unit = Column(String) # e.g., "vials", "tablets"
    last_updated = Column(DateTime, default=datetime.utcnow)
    predicted_exhaustion_date = Column(DateTime, nullable=True)
