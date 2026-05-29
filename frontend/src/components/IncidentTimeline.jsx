import React from "react";

export default function IncidentTimeline({ incidents }) {
  return (
    <div className="rounded-md border border-nexus-line bg-nexus-panel p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Incident Timeline</h2>
      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-2">
        {incidents.length === 0 ? (
          <div className="text-sm text-slate-500">Awaiting sensor events</div>
        ) : (
          incidents.map((incident) => (
            <div key={incident.id} className="rounded-md border border-slate-800 bg-nexus-panel2 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white">{incident.incident}</span>
                <span className="text-xs text-slate-500">{new Date(incident.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                <span>{incident.node}</span>
                <span>{incident.severity} / {incident.risk}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
