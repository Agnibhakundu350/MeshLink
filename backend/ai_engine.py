from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List


TEMP_WARNING = 35
TEMP_CRITICAL = 42
VIBRATION_HIGH = 70
SOUND_HIGH = 600


@dataclass(frozen=True)
class SensorEvent:
    temperature: float
    vibration: float
    sound: float
    node: str
    event_type: str = "sensor"


def clamp(value: float, low: int = 0, high: int = 100) -> int:
    return max(low, min(high, round(value)))


def analyze_event(event: SensorEvent) -> Dict[str, Any]:
    temp_high = event.temperature > TEMP_CRITICAL
    temp_warning = TEMP_WARNING <= event.temperature <= TEMP_CRITICAL
    vibration_high = event.vibration >= VIBRATION_HIGH
    sound_high = event.sound >= SOUND_HIGH

    severity = "NORMAL"
    incident = "Nominal operating state"
    recommendation = "Continue monitoring node telemetry"
    tags: List[str] = []
    risk = 18

    if temp_warning:
        severity = "WARNING"
        incident = "Thermal drift detected"
        recommendation = "Increase cooling and inspect local airflow"
        tags.append("temperature")
        risk = 46

    if temp_high:
        severity = "CRITICAL"
        incident = "Thermal anomaly"
        recommendation = "Isolate node and activate emergency cooling"
        tags.append("temperature")
        risk = 76

    if vibration_high:
        severity = "WARNING" if severity == "NORMAL" else severity
        incident = "Infrastructure instability"
        recommendation = "Inspect mounts, load paths, and vibration damping"
        tags.append("vibration")
        risk = max(risk, 63)

    if sound_high:
        severity = "WARNING" if severity == "NORMAL" else severity
        incident = "Noise anomaly"
        recommendation = "Check acoustic signature for bearing or enclosure failure"
        tags.append("sound")
        risk = max(risk, 58)

    if temp_high and vibration_high:
        severity = "CRITICAL"
        incident = "Thermal + vibration anomaly"
        recommendation = "Isolate node and activate emergency shutdown"
        tags.append("cascading-risk")
        risk = 82

    if event.event_type == "cyber":
        severity = "CRITICAL"
        incident = "Cyber intrusion pattern detected"
        recommendation = "Quarantine affected node and rotate access credentials"
        tags.append("cyber")
        risk = max(risk, 88)

    if event.event_type == "cascading":
        severity = "CRITICAL"
        incident = "Cascading failure risk"
        recommendation = "Shift load to backup systems and initiate recovery protocol"
        tags.append("cascade")
        risk = max(risk, 94)

    sensor_pressure = (
        (event.temperature / 55 * 36)
        + (event.vibration / 100 * 34)
        + (event.sound / 900 * 30)
    )
    risk = max(risk, clamp(sensor_pressure))

    return {
        "severity": severity,
        "incident": incident,
        "risk": clamp(risk),
        "recommendation": recommendation,
        "tags": sorted(set(tags)),
        "node": event.node,
        "input": {
            "temperature": event.temperature,
            "vibration": event.vibration,
            "sound": event.sound,
        },
    }


def event_from_payload(payload: Dict[str, Any]) -> SensorEvent:
    return SensorEvent(
        temperature=float(payload.get("temperature", 25)),
        vibration=float(payload.get("vibration", 20)),
        sound=float(payload.get("sound", 240)),
        node=str(payload.get("node", "ESP32-NODE-01")),
        event_type=str(payload.get("event_type", "sensor")),
    )
