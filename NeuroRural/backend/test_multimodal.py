import requests
import json
import os

BASE_URL = "http://localhost:8000/api/triage"

def test_text_only_triage():
    print("--- Testing Text-Only Triage ---")
    payload = {
        "symptoms": "Child is 3 years old, has a very high fever (40C), is lethargic and having convulsions.",
        "age": 3
    }
    response = requests.post(f"{BASE_URL}/analyze", json=payload)
    print("Status Code:", response.status_code)
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))

def create_dummy_image():
    # Create a 1x1 black pixel image for testing
    import base64
    img_data = b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    with open("dummy_test.png", "wb") as f:
        f.write(base64.b64decode(img_data))
    return "dummy_test.png"

def test_multimodal_triage():
    print("\n--- Testing Multimodal Triage ---")
    img_path = create_dummy_image()
    
    with open(img_path, "rb") as img_file:
        files = {"image": ("test_rash.png", img_file, "image/png")}
        data = {
            "symptoms": "Patient has a severe spreading rash, fever, and neck stiffness.",
            "age": 12,
            "patient_id": 123
        }
        
        response = requests.post(f"{BASE_URL}/multimodal", data=data, files=files)
        print("Status Code:", response.status_code)
        
        if response.status_code == 200:
            print("Response JSON:")
            print(json.dumps(response.json(), indent=2))
        else:
            print("Error:", response.text)
            
    # Cleanup
    if os.path.exists(img_path):
        os.remove(img_path)

if __name__ == "__main__":
    print("Running API Integration Tests against local server...")
    try:
        test_text_only_triage()
        test_multimodal_triage()
    except Exception as e:
        print(f"Test Failed: {e}")
