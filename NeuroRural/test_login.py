import requests
import json

url = "http://localhost:8000/api/auth/login"
data = {"biometric_id": "demo_fingerprint"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
