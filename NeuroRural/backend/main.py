from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.routers import triage, auth, patients, analytics, inventory

app = FastAPI(
    title="AashaAI Backend",
    description="API for Rural Healthcare Assistant",
    version="1.0.0"
)

# Static files for patient images
import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(triage.router)
app.include_router(analytics.router)
app.include_router(inventory.router)

@app.get("/")
async def root():
    return {"message": "AashaAI Backend is Running", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

from fastapi import WebSocket, WebSocketDisconnect
from backend.services.websocket_manager import manager

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from client, but we must receive to keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
