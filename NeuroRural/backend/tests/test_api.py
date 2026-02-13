import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_login_demo():
    """Test the backdoor login"""
    response = client.post("/api/auth/login", json={"biometric_id": "demo_fingerprint"})
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["name"] == "Sita Devi"

def test_get_patients():
    """Test fetching patient list"""
    response = client.get("/api/patients/")
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert "patients" in data
    assert len(data["patients"]) >= 3

def test_triage_analysis():
    """Test symptom analysis"""
    payload = {
        "symptoms": "Severe chest pain and sweating",
        "age": 45
    }
    response = client.post("/api/triage/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["urgent"] == True
    assert "Heart Attack" in data["diagnosis"]
