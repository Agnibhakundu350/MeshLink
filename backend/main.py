from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List
from uuid import uuid4

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai_engine import analyze_event, event_from_payload


app = FastAPI(title="NEXUS Operational Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SensorPayload(BaseModel):
    temperature: float = Field(default=25, ge=-20, le=120)
    vibration: float = Field(default=20, ge=0, le=150)
    sound: float = Field(default=240, ge=0, le=1400)
    node: str = "ESP32-NODE-01"
    event_type: str = "sensor"


SIMULATIONS: Dict[str, Dict[str, Any]] = {
    "normal": {
        "temperature": 26,
        "vibration": 18,
        "sound": 220,
        "node": "ESP32-01",
        "event_type": "normal",
    },
    "overheat": {
        "temperature": 46,
        "vibration": 38,
        "sound": 410,
        "node": "ESP32-01",
        "event_type": "overheat",
    },
    "vibration": {
        "temperature": 34,
        "vibration": 86,
        "sound": 520,
        "node": "ESP32-01",
        "event_type": "vibration",
    },
    "noise": {
        "temperature": 31,
        "vibration": 28,
        "sound": 720,
        "node": "ESP32-01",
        "event_type": "noise",
    },
    "cyber": {
        "temperature": 32,
        "vibration": 24,
        "sound": 330,
        "node": "ESP32-01",
        "event_type": "cyber",
    },
    "cascading": {
        "temperature": 49,
        "vibration": 92,
        "sound": 760,
        "node": "ESP32-01",
        "event_type": "cascading",
    },
    "reset": {
        "temperature": 26,
        "vibration": 18,
        "sound": 220,
        "node": "ESP32-01",
        "event_type": "reset",
    },
}


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> bool:
        try:
            await websocket.accept()
        except (WebSocketDisconnect, RuntimeError, Exception):
            self.disconnect(websocket)
            return False

        if websocket not in self.active_connections:
            self.active_connections.append(websocket)
        return True

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_json(self, websocket: WebSocket, message: Dict[str, Any]) -> bool:
        try:
            await websocket.send_json(message)
            return True
        except (WebSocketDisconnect, RuntimeError, Exception):
            self.disconnect(websocket)
            return False

    async def broadcast(self, message: Dict[str, Any]) -> None:
        stale_connections: List[WebSocket] = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except (WebSocketDisconnect, RuntimeError, Exception):
                stale_connections.append(connection)

        for connection in stale_connections:
            self.disconnect(connection)


manager = ConnectionManager()
incidents: List[Dict[str, Any]] = []


def create_incident(payload: Dict[str, Any]) -> Dict[str, Any]:
    analysis = analyze_event(event_from_payload(payload))
    incident = {
        "id": str(uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_type": payload.get("event_type", "sensor"),
        **analysis,
    }
    incidents.insert(0, incident)
    del incidents[50:]
    return incident


@app.get("/")
def read_root() -> Dict[str, str]:
    return {"service": "NEXUS API", "mode": "simulation"}


@app.post("/sensor-event")
async def sensor_event(payload: SensorPayload) -> Dict[str, Any]:
    incident = create_incident(payload.model_dump())
    await manager.broadcast({"type": "incident", "payload": incident})
    return incident


@app.post("/simulate/{scenario}")
async def simulate_scenario(scenario: str) -> Dict[str, Any]:
    payload = SIMULATIONS.get(scenario)
    if payload is None:
        payload = SIMULATIONS["normal"]
    incident = create_incident(payload)
    await manager.broadcast({"type": "incident", "payload": incident})
    return incident


@app.post("/reset")
async def reset_system() -> Dict[str, Any]:
    incidents.clear()
    incident = create_incident(SIMULATIONS["reset"])
    await manager.broadcast({"type": "reset", "payload": incident})
    return incident


@app.get("/incidents")
def get_incidents() -> List[Dict[str, Any]]:
    return incidents


@app.post("/ai-analysis")
def ai_analysis(payload: SensorPayload) -> Dict[str, Any]:
    return analyze_event(event_from_payload(payload.model_dump()))


@app.get("/postmortem")
def postmortem() -> Dict[str, Any]:
    critical_count = sum(1 for incident in incidents if incident["severity"] == "CRITICAL")
    warning_count = sum(1 for incident in incidents if incident["severity"] == "WARNING")
    highest_risk = max((incident["risk"] for incident in incidents), default=0)

    return {
        "title": "NEXUS Simulation Postmortem",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_incidents": len(incidents),
        "critical_count": critical_count,
        "warning_count": warning_count,
        "highest_risk": highest_risk,
        "latest_recommendation": incidents[0]["recommendation"] if incidents else "No incidents recorded",
        "timeline": incidents,
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    connected = await manager.connect(websocket)
    if not connected:
        return

    snapshot_sent = await manager.send_json(websocket, {"type": "snapshot", "payload": incidents})
    if not snapshot_sent:
        return

    try:
        while True:
            payload = await websocket.receive_json()
            incident = create_incident(payload)
            await manager.broadcast({"type": "incident", "payload": incident})
    except (WebSocketDisconnect, RuntimeError):
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
