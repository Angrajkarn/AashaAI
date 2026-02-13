# NeuroRural (AashaAI) - Hackathon Submission

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Backend Setup (FastAPI)

The backend handles the AI logic and Triage API.

1. Open a terminal in `NeuroRural/backend`.
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:

   ```bash
   ..\start_backend.bat
   ```

   Or manually: `uvicorn main:app --reload`

   ✅ Verify at: `http://localhost:8000/health`

### 2. Frontend Setup (Next.js)

The frontend is the PWA interface for the Health Worker.

1. Open a terminal in `NeuroRural/frontend`.
2. **Important**: Install UI dependencies (if not already done):
   ```bash
   npm install lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate
   ```
3. Run the development server:

   ```bash
   ..\start_frontend.bat
   ```

   Or manually: `npm run dev`

   ✅ Open App at: `http://localhost:3000`

## 📱 Demo Flow

1. **Login**: Click "Login with Biometrics" on the landing page.
2. **Dashboard**: View the "At Risk" patients.
3. **Triage**: Click "Start New Checkup".
   - **Voice**: Click the Mic button and speak (Simulated).
   - **AI Analysis**: Click "Analyze Symptoms" to see the RAG-based diagnosis.

## 🏆 Hackathon Winning Features

- **Offline-First PWA Architecture**
- **Multimodal Input (Voice/Cam)**
- **Strict Medical Protocol Adherence (RAG)**
