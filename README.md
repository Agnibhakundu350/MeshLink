# NEXUS War Room

Simulation-first operational intelligence dashboard.

## Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

On Windows, you can also run:

```powershell
powershell -ExecutionPolicy Bypass -File backend\run_backend.ps1
```

API runs at `http://127.0.0.1:8000`.

Routes:

- `POST /sensor-event`
- `GET /incidents`
- `POST /ai-analysis`
- `GET /postmortem`
- `WS /ws`

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

On Windows, you can also run:

```powershell
powershell -ExecutionPolicy Bypass -File frontend\run_frontend.ps1
```

Dashboard runs at `http://127.0.0.1:5173`.

## Demo Path

1. Start the FastAPI backend.
2. Start the React frontend.
3. Use the simulated hardware buttons:
   - Trigger Overheating
   - Trigger Vibration Failure
   - Trigger Cyber Attack
   - Trigger Cascading Failure
   - Reset System

ESP32 can be connected later by posting sensor payloads to `/sensor-event`.
