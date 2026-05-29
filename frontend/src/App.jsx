import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  BrainCircuit,
  Flame,
  Network,
  Radio,
  Router,
  Satellite,
  ShieldAlert,
  Siren,
  Waves,
  WifiOff,
  Zap
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "leaflet/dist/leaflet.css";
import "./index.css";
import DisasterMap from "./components/DisasterMap";
import MeshGraph from "./components/MeshGraph";

const scenarios = {
  fire: {
    label: "Fire Detected",
    emergency: "FIRE RISK DETECTED",
    severity: "CRITICAL",
    priority: "CRITICAL",
    risk: 88,
    confidence: 94,
    node: "NODE-A",
    impact: "Thermal plume expanding near ESP32-A. Smoke density indicates unsafe interior access.",
    prediction: "AI predicts rapid thermal escalation across nearby nodes.",
    recommendation: "Activate emergency shutdown, dispatch fire response, and reroute civilians away from the thermal zone.",
    actions: ["Activate emergency shutdown", "Dispatch fire response unit", "Reroute civilians away from zone", "Increase thermal sensor polling rate"],
    overlayCritical: true,
    deltas: { temperature: 15, vibration: 8, sound: 18, smoke: 34, stability: -12 },
    icon: Flame
  },
  collapse: {
    label: "Structural Collapse",
    emergency: "POSSIBLE STRUCTURAL COLLAPSE",
    severity: "CRITICAL",
    priority: "CRITICAL",
    risk: 96,
    confidence: 97,
    node: "NODE-B",
    impact: "Structural collapse signature detected near ESP32-B. Motion gaps suggest possible trapped victims.",
    prediction: "AI predicts elevated structural instability propagation risk.",
    recommendation: "Reroute SOS packets, prioritize rescue dispatch, and deploy structural scan swarm.",
    actions: ["Lock unsafe sector", "Deploy structural scan swarm", "Prioritize trapped victim search", "Reroute SOS packets through RELAY-01"],
    overlayCritical: true,
    deltas: { temperature: 3, vibration: 38, sound: 26, smoke: 7, stability: -38 },
    icon: AlertTriangle
  },
  panic: {
    label: "Panic Alert",
    emergency: "PANIC ANOMALY DETECTED",
    severity: "WARNING",
    priority: "HIGH",
    risk: 72,
    confidence: 91,
    node: "NODE-C",
    impact: "Panic sound profile spiking near ESP32-C. Crowd movement is becoming unstable.",
    prediction: "AI predicts 78% probability of crowd-flow instability near the east corridor.",
    recommendation: "Open voice guidance channel, send rescue route beacon, and de-escalate crowd flow.",
    actions: ["Broadcast calm evacuation guidance", "Open local voice beacon", "Dispatch crowd-control responder", "Prioritize nearest SOS packets"],
    overlayCritical: true,
    deltas: { temperature: 2, vibration: 11, sound: 43, smoke: 3, stability: -8 },
    icon: Siren
  },
  flood: {
    label: "Flood Warning",
    emergency: "FLOOD PROPAGATION RISK",
    severity: "WARNING",
    priority: "MEDIUM",
    risk: 68,
    confidence: 89,
    node: "NODE-D",
    impact: "Flood risk rising near RELAY-01. Low-ground rescue paths may become unavailable.",
    prediction: "AI predicts regional mobility disruption and communication instability.",
    recommendation: "Activate elevated relay path, start evacuation guidance, and protect mesh power nodes.",
    actions: ["Issue flood evacuation route", "Move packets to elevated relay", "Protect backup power nodes", "Mark low-ground sectors unsafe"],
    deltas: { temperature: -2, vibration: 12, sound: 14, smoke: 0, stability: -15 },
    icon: Waves
  },
  sos: {
    label: "SOS Trigger",
    emergency: "RESCUE PRIORITY: CRITICAL",
    severity: "CRITICAL",
    priority: "CRITICAL",
    risk: 91,
    confidence: 96,
    node: "NODE-E",
    impact: "Victim SOS packet received near NODE-E. Local mesh confirms survivable signal strength.",
    prediction: "AI predicts high rescue success if response arrives within the next seven minutes.",
    recommendation: "Dispatch autonomous responder and broadcast victim location over the rescue mesh.",
    actions: ["Dispatch nearest rescue drone", "Broadcast victim coordinates", "Open bidirectional SOS channel", "Reserve route for medical response"],
    overlayCritical: true,
    deltas: { temperature: 4, vibration: 18, sound: 35, smoke: 10, stability: -18 },
    icon: Bell
  },
  failure: {
    label: "Node Failure",
    emergency: "NODE DISCONNECTED - SELF HEALING ACTIVE",
    severity: "CRITICAL",
    priority: "HIGH",
    risk: 84,
    confidence: 93,
    node: "NODE-F",
    impact: "NODE-F is offline. Packet loss detected on outer swarm edge, but reroute capacity remains available.",
    prediction: "AI predicts temporary packet rerouting congestion.",
    recommendation: "Activate self-healing mesh reroute, isolate failed node, and route packets through RELAY-01.",
    actions: ["Activate self-healing mesh reroute", "Mark failed node offline", "Route packets through nearest active node", "Notify rescue command"],
    deltas: { temperature: 1, vibration: 22, sound: 12, smoke: 4, stability: -28 },
    icon: WifiOff
  },
  restore: {
    label: "Restore Network",
    emergency: "RESCUE NETWORK STABILIZED",
    severity: "NORMAL",
    priority: "LOW",
    risk: 28,
    confidence: 86,
    node: "AI-CORE",
    impact: "All rescue services nominal. Local mesh is ready for disconnected operation.",
    prediction: "AI predicts stable rescue communication coverage across the active mesh.",
    recommendation: "Maintain local mesh autonomy and continue distributed telemetry.",
    actions: ["Restore stable node colors", "Clear active emergency queue", "Reset alert feed", "Resume normal telemetry cadence"],
    deltas: { temperature: -8, vibration: -24, sound: -22, smoke: -20, stability: 32 },
    icon: Router
  }
};

const initialIntel = {
  emergency: "MESH RESCUE GRID NOMINAL",
  severity: "NORMAL",
  priority: "LOW",
  risk: 28,
  confidence: 86,
  node: "AI-CORE",
  impact: "All rescue services nominal. Local mesh is ready for disconnected operation.",
  prediction: "AI predicts stable rescue communication coverage across the active mesh.",
  recommendation: "Continue edge-AI monitoring. Internet is optional; mesh response remains active."
};

const defaultEmergencies = [
  {
    id: "default-smoke",
    time: "Live",
    node: "NODE-B",
    emergency: "Smoke Risk detected near NODE-B",
    priority: "LOW",
    risk: 31,
    severity: "NORMAL",
    impact: "Low smoke signature under observation."
  },
  {
    id: "default-mesh",
    time: "Live",
    node: "NODE-C",
    emergency: "Mesh Interruption on NODE-C",
    priority: "MEDIUM",
    risk: 47,
    severity: "WARNING",
    impact: "Intermittent packet latency detected."
  },
  {
    id: "default-structure",
    time: "Live",
    node: "NODE-D",
    emergency: "Structural Instability near NODE-D",
    priority: "MEDIUM",
    risk: 52,
    severity: "WARNING",
    impact: "Vibration drift remains below critical threshold."
  }
];

const normalTelemetry = [
  { time: "T-11", temperature: 31, vibration: 18, sound: 42, smoke: 8, stability: 96 },
  { time: "T-10", temperature: 32, vibration: 19, sound: 44, smoke: 9, stability: 96 },
  { time: "T-09", temperature: 32, vibration: 20, sound: 45, smoke: 10, stability: 95 },
  { time: "T-08", temperature: 33, vibration: 21, sound: 43, smoke: 9, stability: 95 },
  { time: "T-07", temperature: 33, vibration: 20, sound: 46, smoke: 10, stability: 94 },
  { time: "T-06", temperature: 34, vibration: 22, sound: 48, smoke: 11, stability: 94 },
  { time: "T-05", temperature: 33, vibration: 21, sound: 47, smoke: 10, stability: 95 },
  { time: "T-04", temperature: 32, vibration: 20, sound: 45, smoke: 9, stability: 96 },
  { time: "T-03", temperature: 32, vibration: 19, sound: 44, smoke: 8, stability: 96 },
  { time: "T-02", temperature: 31, vibration: 18, sound: 43, smoke: 8, stability: 97 },
  { time: "T-01", temperature: 31, vibration: 18, sound: 42, smoke: 7, stability: 97 },
  { time: "Now", temperature: 32, vibration: 19, sound: 44, smoke: 8, stability: 96 }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function makeTelemetry(previous, intel) {
  const last = previous[previous.length - 1] || {
    temperature: 32,
    vibration: 21,
    sound: 48,
    smoke: 16,
    stability: 94
  };
  const drift = intel.severity === "CRITICAL" ? 6 : intel.severity === "WARNING" ? 3 : 1;

  return {
    time: new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
    temperature: clamp(last.temperature + (Math.random() * drift - drift / 2), 22, 92),
    vibration: clamp(last.vibration + (Math.random() * drift * 1.8 - drift), 5, 100),
    sound: clamp(last.sound + (Math.random() * drift * 2.5 - drift), 20, 118),
    smoke: clamp(last.smoke + (Math.random() * drift * 1.6 - drift / 1.5), 0, 100),
    stability: clamp(last.stability + (Math.random() * 4 - 2), 15, 100)
  };
}

function buildEvent(scenario) {
  return {
    id: crypto.randomUUID(),
    time: new Date().toLocaleTimeString(),
    node: scenario.node,
    emergency: scenario.label,
    priority: scenario.priority,
    risk: scenario.risk,
    severity: scenario.severity,
    impact: scenario.impact
  };
}

function buildAlert(message, severity = "NORMAL") {
  return {
    id: crypto.randomUUID(),
    time: new Date().toLocaleTimeString(),
    message,
    severity
  };
}

function Header({ internetOffline, meshOnline }) {
  const badges = [
    { label: "INTERNET", value: internetOffline ? "OFFLINE" : "ONLINE", tone: internetOffline ? "red" : "green", icon: WifiOff },
    { label: "MESH NETWORK", value: meshOnline ? "ACTIVE" : "DEGRADED", tone: "cyan", icon: Network },
    { label: "AI ENGINE", value: "RUNNING", tone: "cyan", icon: BrainCircuit },
    { label: "RESCUE NODES", value: "5/6 ONLINE", tone: "amber", icon: Radio },
    { label: "EDGE AI", value: "CONNECTED", tone: "green", icon: Satellite }
  ];

  return (
    <header className="ares-header">
      <div>
        <div className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">ARES</div>
        <h1 className="mt-1 text-3xl font-black uppercase text-white md:text-5xl">Autonomous Rescue & Emergency Swarm</h1>
      </div>
      <div className="ares-status-pills">
        {badges.map(({ label, value, tone, icon: Icon }) => (
          <motion.div
            key={label}
            className={`ares-badge ares-badge-${tone}`}
            animate={{ boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 18px rgba(34,211,238,.28)", "0 0 0 rgba(34,211,238,0)"] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <span className="live-dot" />
            <Icon size={15} />
            <span>{label}: {value}</span>
          </motion.div>
        ))}
      </div>
    </header>
  );
}

function MetricCard({ icon: Icon, title, value, suffix = "", tone = "cyan" }) {
  const iconColor = {
    cyan: "text-cyan-300",
    amber: "text-amber-300",
    red: "text-rose-300",
    green: "text-emerald-300"
  }[tone] || "text-cyan-300";

  return (
    <motion.div whileHover={{ y: -4, scale: 1.015 }} className={`ares-card ares-glow-${tone}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</span>
        <Icon size={20} className={iconColor} />
      </div>
      <motion.div key={`${value}-${suffix}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-4xl font-black text-white">
        {value}{suffix}
      </motion.div>
    </motion.div>
  );
}

function TelemetryPanel({ data, latest }) {
  const current = data[data.length - 1];
  const metrics = [
    ["Temperature", `${current.temperature} C`, "temperature", Flame],
    ["Structural Vibration", `${current.vibration}%`, "vibration", Activity],
    ["Panic Sound Level", `${current.sound} dB`, "sound", Siren],
    ["Smoke Risk", `${current.smoke}%`, "smoke", ShieldAlert],
    ["Structural Stability", `${current.stability}%`, "stability", Zap]
  ];

  return (
    <section className={`ares-card ${latest.severity === "CRITICAL" ? "ares-critical-panel" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="ares-section-title">Live Sensor Telemetry</h2>
        <span className="ares-live-pill">STREAMING LOCAL MESH</span>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        {metrics.map(([label, value, key, Icon]) => (
          <motion.div key={`${label}-${current.time}`} className="telemetry-tile rounded-md border border-slate-800 bg-slate-950/80 p-3" initial={{ borderColor: "rgba(34,211,238,.65)" }} animate={{ opacity: [0.82, 1, 0.82], borderColor: "rgba(30,41,59,1)" }} transition={{ duration: 1.4 }}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500"><Icon size={14} className="text-cyan-300" />{label}</div>
            <div className="mt-2 text-2xl font-black text-white">{value}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#64748b" tickLine={false} />
            <YAxis stroke="#64748b" tickLine={false} />
            <Tooltip contentStyle={{ background: "#07111f", border: "1px solid #164e63", borderRadius: 6 }} />
            <Line type="monotone" dataKey="temperature" stroke="#fb7185" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="vibration" stroke="#fbbf24" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="sound" stroke="#22d3ee" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="smoke" stroke="#a78bfa" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="stability" stroke="#34d399" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function AnalysisPanel({ intel }) {
  const critical = intel.severity === "CRITICAL";
  const warning = intel.severity === "WARNING";

  return (
    <section className={`ares-card ${critical ? "ares-critical-panel" : warning ? "ares-warning-panel" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="ares-section-title">AI Disaster Analysis</h2>
        <span className={`ares-priority ${critical ? "bg-rose-500/15 text-rose-200 border-rose-400/40" : warning ? "bg-amber-500/15 text-amber-200 border-amber-400/40" : "bg-emerald-500/10 text-emerald-200 border-emerald-400/30"}`}>{intel.severity}</span>
      </div>
      <motion.div key={intel.emergency} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="mt-7 text-3xl font-black uppercase leading-tight text-white">
        {intel.emergency}
      </motion.div>
      <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/70 p-4">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Estimated Impact</div>
        <p className="mt-2 text-base font-semibold leading-7 text-slate-100">{intel.impact}</p>
      </div>
      <div className="mt-3 rounded-md border border-cyan-400/20 bg-cyan-400/5 p-4">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">AI Escalation Prediction</div>
        <p className="mt-2 text-base font-semibold leading-7 text-cyan-50">{intel.prediction}</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.16em] text-slate-400"><span>Risk Score</span><span>{intel.risk}%</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-900"><motion.div className="h-full bg-rose-400" animate={{ width: `${intel.risk}%` }} /></div>
        </div>
        <div>
          <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.16em] text-slate-400"><span>AI Confidence</span><span>{intel.confidence}%</span></div>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 12 }).map((_, index) => <span key={index} className={`h-3 rounded-sm ${index < Math.round(intel.confidence / 8.34) ? "bg-cyan-300" : "bg-slate-800"}`} />)}
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Event Node</div>
          <div className="mt-2 text-xl font-black text-cyan-200">{intel.node}</div>
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Rescue Priority</div>
          <div className={`mt-2 text-xl font-black ${critical ? "text-rose-300" : warning ? "text-amber-300" : "text-emerald-300"}`}>{intel.priority}</div>
        </div>
      </div>
      <div className="mt-6 rounded-md border border-cyan-400/20 bg-cyan-400/5 p-4">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Autonomous Recommendation Engine</div>
        <p className="mt-3 text-lg font-semibold leading-7 text-white">{intel.recommendation}</p>
      </div>
    </section>
  );
}

function TriggerPanel({ onTrigger, onInternetFailure, activeTrigger }) {
  return (
    <section className="ares-card">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="ares-section-title">Emergency Trigger Panel</h2>
        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onInternetFailure} className={`network-collapse-button ${activeTrigger === "internet" ? "trigger-fired" : ""}`}>
          Simulate Network Collapse
        </motion.button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
        {Object.entries(scenarios).map(([key, scenario]) => {
          const Icon = scenario.icon;
          return (
            <motion.button key={key} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => onTrigger(key)} className={`flex min-h-12 items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm font-black text-slate-100 transition hover:border-cyan-300 hover:bg-cyan-400/10 ${activeTrigger === key ? "trigger-fired" : ""}`}>
              <Icon size={16} />
              {scenario.label}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

function EmergencyTable({ events }) {
  const priorityStyle = {
    LOW: "text-cyan-300",
    MEDIUM: "text-amber-300",
    HIGH: "text-rose-300",
    CRITICAL: "critical-blink text-rose-300"
  };
  const indicatorStyle = {
    LOW: "bg-cyan-300",
    MEDIUM: "bg-amber-300",
    HIGH: "bg-rose-400",
    CRITICAL: "bg-rose-400"
  };

  return (
    <section className="ares-card overflow-hidden">
      <h2 className="ares-section-title mb-4">Active Emergencies</h2>
      <div className="overflow-x-auto rounded-md border border-slate-800">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-950 text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr><th className="px-3 py-3">Time</th><th className="px-3 py-3">Node</th><th className="px-3 py-3">Emergency</th><th className="px-3 py-3">Priority</th><th className="px-3 py-3">Risk Level</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-[#07111f]">
            <AnimatePresence initial={false}>
              {events.slice(0, 8).map((event) => (
                <motion.tr key={event.id} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`emergency-row ${event.priority === "CRITICAL" ? "emergency-row-critical" : ""}`}>
                  <td className="px-3 py-3 text-slate-400">{event.time}</td>
                  <td className="px-3 py-3 font-bold text-cyan-200">{event.node}</td>
                  <td className="px-3 py-3 font-semibold text-white">{event.emergency}</td>
                  <td className={`px-3 py-3 font-black ${priorityStyle[event.priority] || "text-cyan-300"}`}>
                    <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${indicatorStyle[event.priority] || "bg-cyan-300"}`} />
                    {event.priority}
                  </td>
                  <td className="px-3 py-3 font-black text-white">{event.risk}%</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AlertFeed({ alerts }) {
  const feedRef = useRef(null);
  const colors = {
    NORMAL: "text-cyan-200",
    WARNING: "text-amber-200",
    CRITICAL: "text-rose-200"
  };

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [alerts]);

  return (
    <section className="ares-card">
      <h2 className="ares-section-title mb-4">Realtime Alert Feed</h2>
      <div ref={feedRef} className="h-80 space-y-2 overflow-hidden rounded-md border border-cyan-400/20 bg-black/45 p-3 font-mono text-sm">
        <AnimatePresence initial={false}>
          {alerts.slice(0, 8).map((alert) => (
            <motion.div key={alert.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={colors[alert.severity] || "text-cyan-200"}>
              <span className="text-slate-500">[{alert.time}]</span> {alert.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Timeline({ alerts }) {
  return (
    <section className="ares-card">
      <h2 className="ares-section-title mb-4">Incident Timeline</h2>
      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert, index) => (
          <div key={`timeline-${alert.id}`} className={`flex gap-3 rounded-md border bg-slate-950/80 px-3 py-3 ${index === 0 ? "timeline-newest border-cyan-400/40" : "border-slate-800"}`}>
            <span className="w-24 shrink-0 text-xs font-black text-cyan-300">{alert.time}</span>
            <span className="text-sm font-semibold text-slate-100">{alert.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecoveryActions({ intel, internetOffline }) {
  const actions = intel.actions || (intel.severity === "CRITICAL"
    ? ["Deploy nearest rescue drone", "Activate backup mesh node", "Reroute emergency traffic", "Prioritize trapped victims"]
    : intel.severity === "WARNING"
      ? ["Broadcast evacuation guidance", "Increase local sensor sampling", "Prepare autonomous responder", "Optimize rescue path"]
      : ["Maintain edge AI monitoring", "Keep mesh packets flowing", internetOffline ? "Verify offline continuity" : "Stand by for failure demo", "Archive normal telemetry"]);

  return (
    <section className="ares-card">
      <h2 className="ares-section-title mb-4">Recovery Actions</h2>
      <ol className="space-y-3">
        {actions.map((action, index) => (
          <motion.li key={action} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-950/80 px-3 py-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-cyan-400/10 text-sm font-black text-cyan-200">{index + 1}</span>
            <span className="font-semibold text-slate-100">{action}</span>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

export default function App() {
  const [internetOffline, setInternetOffline] = useState(false);
  const [intel, setIntel] = useState(initialIntel);
  const [events, setEvents] = useState(defaultEmergencies);
  const [alerts, setAlerts] = useState([
    buildAlert("ARES edge AI booted; disaster simulation ready", "NORMAL"),
    buildAlert("Self-healing mesh network active", "NORMAL")
  ]);
  const [telemetry, setTelemetry] = useState(normalTelemetry);
  const [activeTrigger, setActiveTrigger] = useState(null);

  const meshOnline = true;
  const activeEmergencies = events.filter((event) => event.priority !== "LOW").length;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTelemetry((current) => [...current.slice(-17), makeTelemetry(current, intel)]);
      setAlerts((current) => [
        {
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString(),
          message: internetOffline ? "Offline mesh heartbeat verified; SOS routing remains operational" : "Cloud link available; edge mesh remains primary",
          severity: "NORMAL"
        },
        ...current
      ].slice(0, 18));
    }, 2400);

    return () => window.clearInterval(timer);
  }, [intel, internetOffline]);

  function trigger(key) {
    const scenario = scenarios[key];
    setActiveTrigger(key);
    window.setTimeout(() => setActiveTrigger(null), 850);

    if (key === "restore") {
      resetDemo();
      return;
    }

    const next = { ...initialIntel, ...scenario };

    setIntel(next);
    setTelemetry((current) => {
      const last = current[current.length - 1];
      return [
        ...current.slice(-16),
        {
          time: new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
          temperature: clamp(last.temperature + scenario.deltas.temperature, 22, 92),
          vibration: clamp(last.vibration + scenario.deltas.vibration, 5, 100),
          sound: clamp(last.sound + scenario.deltas.sound, 20, 118),
          smoke: clamp(last.smoke + scenario.deltas.smoke, 0, 100),
          stability: clamp(last.stability + scenario.deltas.stability, 15, 100)
        }
      ];
    });

    const event = buildEvent(scenario);
    setEvents((current) => [event, ...current].slice(0, 16));
    setAlerts((current) => [
      buildAlert(`${scenario.label}: ${scenario.recommendation}`, scenario.severity),
      buildAlert(scenario.severity === "CRITICAL" ? "Emergency priority escalated; autonomous routing engaged" : "Mesh rerouting initiated", scenario.severity),
      ...current
    ].slice(0, 18));
  }

  function simulateInternetFailure() {
    setActiveTrigger("internet");
    window.setTimeout(() => setActiveTrigger(null), 850);

    const scenario = {
      ...scenarios.failure,
      label: "Internet Failure",
      emergency: "INTERNET FAILURE - MESH AUTONOMY VERIFIED",
      node: "RELAY-01",
      risk: 79,
      confidence: 95,
      impact: "Cloud connectivity lost. Local rescue mesh remains operational and continues SOS routing without internet.",
      prediction: "AI predicts 84% probability of regional rescue communication instability.",
      recommendation: "Keep rescue coordination on local mesh, verify packet propagation, and maintain offline command mode.",
      actions: ["Disconnect cloud dependency", "Verify local telemetry continuity", "Route SOS through mesh relays", "Keep rescue command in offline mode"]
    };

    setInternetOffline(true);
    setIntel({ ...initialIntel, ...scenario });
    setEvents((current) => [buildEvent(scenario), ...current].slice(0, 16));
    setAlerts((current) => [
      buildAlert("INTERNET FAILURE SIMULATED: cloud disconnected", "CRITICAL"),
      buildAlert("Mesh network remains active; telemetry and SOS routing continue", "NORMAL"),
      ...current
    ].slice(0, 18));
  }

  function resetDemo() {
    setInternetOffline(false);
    setIntel(initialIntel);
    setEvents(defaultEmergencies);
    setTelemetry(normalTelemetry);
    setAlerts([
      buildAlert("ARES reset complete; rescue mesh normal", "NORMAL"),
      buildAlert("Active emergencies cleared", "NORMAL")
    ]);
  }

  const metrics = useMemo(() => [
    { icon: ShieldAlert, title: "Rescue Network Stability", value: intel.severity === "CRITICAL" ? 71 : internetOffline ? 94 : 97, suffix: "%", tone: intel.severity === "CRITICAL" ? "red" : "cyan" },
    { icon: Siren, title: "Active SOS Alerts", value: activeEmergencies, tone: intel.severity === "CRITICAL" ? "red" : activeEmergencies > 0 ? "amber" : "cyan" },
    { icon: Activity, title: "Disaster Severity", value: intel.risk, suffix: "%", tone: intel.severity === "CRITICAL" ? "red" : "amber" },
    { icon: Network, title: "Mesh Nodes Active", value: intel.node === "NODE-F" ? "5/6" : "6/6", tone: intel.node === "NODE-F" ? "red" : "cyan" }
  ], [activeEmergencies, intel, internetOffline]);

  return (
    <main className={`ares-shell ${intel.severity === "CRITICAL" ? "ares-lockdown" : ""}`}>
      <Header internetOffline={internetOffline} meshOnline={meshOnline} />
      <AnimatePresence>
        {(intel.severity === "CRITICAL" || intel.overlayCritical) && (
          <motion.div className="ares-critical-overlay" initial={{ opacity: 0, y: -18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -18, scale: 0.98 }}>
            <div>⚠ CRITICAL RESCUE EVENT ACTIVE</div>
            <div>Autonomous Coordination Enabled</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ares-content grid gap-4 px-4 py-4 lg:px-5">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <MetricCard key={metric.title} {...metric} />)}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <TelemetryPanel data={telemetry} latest={intel} />
          <AnalysisPanel intel={intel} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <DisasterMap intel={intel} internetOffline={internetOffline} />
          <MeshGraph intel={intel} />
        </section>

        <TriggerPanel onTrigger={trigger} onInternetFailure={simulateInternetFailure} activeTrigger={activeTrigger} />

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <EmergencyTable events={events} />
          <AlertFeed alerts={alerts} />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Timeline alerts={alerts} />
          <RecoveryActions intel={intel} internetOffline={internetOffline} />
        </section>
      </div>
    </main>
  );
}
