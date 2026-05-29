import React from "react";

function linesFor(incident) {
  if (!incident) return ["Node stable", "Awaiting sensor telemetry", "AI engine standing by"];
  if (incident.severity === "CRITICAL") {
    return [
      `${incident.node} telemetry spike detected`,
      `${incident.incident} classified CRITICAL`,
      `Risk escalated to ${incident.risk}%`,
      "Emergency shutdown recommended"
    ];
  }
  if (incident.severity === "WARNING") {
    return [
      `${incident.node} anomaly detected`,
      `${incident.incident} classified WARNING`,
      `Risk calculated at ${incident.risk}%`,
      "Operator inspection recommended"
    ];
  }
  return ["Node stable", "Telemetry within operating band", "AI classified NORMAL", "Continue monitoring"];
}

export default function Timeline({ latest, incidents, connected }) {
  const events = incidents.length > 0
    ? incidents.slice(0, 6).map((incident) => ({
        id: incident.id,
        time: new Date(incident.timestamp).toLocaleTimeString(),
        text: `${incident.severity}: ${incident.incident} on ${incident.node}`
      }))
    : linesFor(latest).map((event, index) => ({
        id: `${event}-${index}`,
        time: new Date(new Date(latest.timestamp).getTime() + index * 2000).toLocaleTimeString(),
        text: event
      }));

  return (
    <section className={`rounded-md border bg-[#101722] p-4 ${latest.severity === "CRITICAL" ? "critical-panel border-rose-400/40" : "border-slate-800"}`}>
      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">Incident Timeline</h2>
      {!connected && <div className="mb-3 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-200">Backend disconnected</div>}
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="flex gap-3 rounded-md border border-slate-800 bg-slate-950 px-3 py-3">
            <span className="w-24 shrink-0 text-xs font-bold text-cyan-300">{event.time}</span>
            <span className="text-sm text-slate-200">{event.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
