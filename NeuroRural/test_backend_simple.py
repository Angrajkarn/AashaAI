import requests
import sys

BASE_URL = "http://localhost:8000"

def log(msg):
    print(f"[TEST] {msg}")

def test_root():
    try:
        res = requests.get(f"{BASE_URL}/")
        assert res.status_code == 200
        assert res.json()["status"] == "online"
        log("Root endpoint: PASS")
    except Exception as e:
        log(f"Root endpoint: FAIL ({e})")
        return False
    return True

def test_login():
    try:
        res = requests.post(f"{BASE_URL}/api/auth/login", json={"biometric_id": "demo_fingerprint"})
        assert res.status_code == 200
        data = res.json()
        assert "token" in data
        log("Login: PASS")
    except Exception as e:
        log(f"Login: FAIL ({e})")
        return False
    return True

def test_patients():
    try:
        res = requests.get(f"{BASE_URL}/api/patients/")
        assert res.status_code == 200
        data = res.json()
        assert "stats" in data
        assert len(data["patients"]) > 0
        log("Patients List: PASS")
    except Exception as e:
        log(f"Patients List: FAIL ({e})")
        return False
    return True

def test_triage():
    try:
        payload = {"symptoms": "Fever", "age": 10}
        res = requests.post(f"{BASE_URL}/api/triage/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "diagnosis" in data
        log("Triage Analysis: PASS")
    except Exception as e:
        log(f"Triage Analysis: FAIL ({e})")
        return False
    return True

if __name__ == "__main__":
    if not test_root(): sys.exit(1)
    if not test_login(): sys.exit(1)
    if not test_patients(): sys.exit(1)
    if not test_triage(): sys.exit(1)
    print("ALL TESTS PASSED")
