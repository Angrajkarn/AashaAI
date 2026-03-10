import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_triage_alert():
    print("\n[1] Testing High-Risk Triage Alert...")
    payload = {
        "symptoms": "I have severe crushing chest pain, difficulty breathing, and sweating. I am 55 years old.",
        "age": 55
    }
    response = requests.post(f"{BASE_URL}/api/triage/analyze", json=payload)
    if response.status_code == 200:
        data = response.json()
        print(f"Success: Urgent={data.get('urgent')}")
        print(f"Diagnosis: {data.get('diagnosis')}")
    else:
        print(f"Failed: {response.status_code} - {response.text}")

def test_inventory_alert():
    print("\n[2] Testing Inventory Reorder Alert...")
    response = requests.post(f"{BASE_URL}/api/inventory/reorder/1")
    if response.status_code == 200:
        print(f"Success: {response.json()}")
    else:
        print(f"Failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_triage_alert()
    time.sleep(1)
    test_inventory_alert()
