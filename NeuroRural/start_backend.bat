@echo off
echo Starting AashaAI Backend...
REM Run from the root directory so python module path works
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
pause
