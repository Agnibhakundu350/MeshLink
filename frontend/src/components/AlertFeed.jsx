import React from "react";
import { Bell, BrainCircuit, Radio, ShieldAlert } from "lucide-react";

function buildAlerts(latest, incidents, connected) {
  const incidentAlerts = incidents.slice(0, 5).map((incident, index) => ({
    id: incident.id,
    time: new Date(incident.timestamp).toLocaleTimeString([], { hour12: false }),
    message: incident.severity === "NORMAL"
      ? "AI classified system NORMAL"
      : `${incident.severity}: ${incident.incident} at ${incident.risk}% risk`,
    severity: incident.severity,
    index
  }));

  if (!connected) {
    return [
      {
        id: "backend-disconnected",
        time: new Date().toLocaleTimeString([], { hour12: false }),
        message: "Backend disconnected - retrying WebSocket",
        severity: "WARNING",
        index: 0
      },
      ...incidentAlerts
    ].slice(0, 5);
  }

  if (incidentAlerts.length > 0) return incidentAlerts;

  return [
    {
      id: "standby",
      time: new Date(latest.timestamp).toLocaleTimeString([], { hour12: false }),
      message: "Telemetry stream connected",
      severity: latest.severity,
      index: 0
    }
  ];
}

export default function AlertFeed({ latest, incidents, connected }) {
  const critical = latest.severity === "CRITICAL";
  const alerts = buildAlerts(latest, incidents, connected);

  return (
    <section className="rounded-md border border-slate-800 bg-[#101722] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">Realtime Alert Feed</h2>
        <span className={`flex items-center gap-2 rounded-sm border px-2 py-1 text-xs font-black ${!connected ? "border-amber-400/40 bg-amber-500/10 text-amber-200" : critical ? "border-rose-400/40 bg-rose-500/10 text-rose-200" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"}`}>
          <Bell size={13} />
          {connected ? "LIVE" : "RETRYING"}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = index === 0 ? Radio : index === 1 ? ShieldAlert : BrainCircuit;
          return (
            <div key={alert.id} className="alert-feed-row flex items-start gap-3 rounded-md border border-slate-800 bg-slate-950 px-3 py-3" style={{ animationDelay: `${index * 90}ms` }}>
              <Icon size={16} className={alert.severity === "CRITICAL" ? "mt-0.5 text-rose-300" : alert.severity === "WARNING" ? "mt-0.5 text-amber-300" : "mt-0.5 text-cyan-300"} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-cyan-300">{alert.time}</div>
                <div className="mt-1 text-sm font-semibold text-slate-100">{alert.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
