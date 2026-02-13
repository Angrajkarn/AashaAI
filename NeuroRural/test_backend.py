import requests
import time
import subprocess
import sys
import psutil

def wait_for_server(url, timeout=10):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return True
        except requests.ConnectionError:
            pass
        time.sleep(0.5)
    return False

def test_backend():
    print("Starting Backend Server...")
    # Start uvicorn process
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=".",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    try:
        if wait_for_server("http://127.0.0.1:8000/health"):
            print("✅ Backend is UP")
            
            # Test Triage
            print("Testing Triage Endpoint...")
            payload = {"symptoms": "High fever and rash on face", "age": 5}
            response = requests.post("http://127.0.0.1:8000/api/triage/analyze", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Triage Response: {data['diagnosis']}")
                print(f"   Recommendation: {data['recommendation']}")
            else:
                print(f"❌ Triage Failed: {response.text}")
                
        else:
            print("❌ Backend failed to start")
            # Print stderr
            _, stderr = process.communicate(timeout=2)
            print(stderr.decode())

    finally:
        # Kill process and children
        parent = psutil.Process(process.pid)
        for child in parent.children(recursive=True):
            child.terminate()
        parent.terminate()
        print("Backend Stopped")

if __name__ == "__main__":
    test_backend()
