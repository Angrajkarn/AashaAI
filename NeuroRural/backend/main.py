from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import triage, auth, patients

app = FastAPI(
    title="AashaAI Backend",
    description="API for Rural Healthcare Assistant",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "*"  # For development, allow all
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

@app.get("/")
async def root():
    return {"message": "AashaAI Backend is Running", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
