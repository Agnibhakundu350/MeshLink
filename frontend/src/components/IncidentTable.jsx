import React from "react";

export default function IncidentTable({ incidents }) {
  return (
    <section className={`rounded-md border bg-[#101722] p-4 ${incidents.some((incident) => incident.severity === "CRITICAL") ? "critical-panel border-rose-400/40" : "border-slate-800"}`}>
      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">Active Incidents</h2>
      <div className="overflow-hidden rounded-md border border-slate-800">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="bg-slate-950 text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-3 py-3">Time</th>
              <th className="px-3 py-3">Node</th>
              <th className="px-3 py-3">Incident</th>
              <th className="px-3 py-3">Severity</th>
              <th className="px-3 py-3">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-[#0b111c]">
            {incidents.length === 0 ? (
              <tr>
                <td className="px-3 py-5 text-slate-500" colSpan="5">No active incidents</td>
              </tr>
            ) : (
              incidents.slice(0, 8).map((incident) => (
                <tr key={incident.id}>
                  <td className="px-3 py-3 text-slate-400">{new Date(incident.timestamp).toLocaleTimeString()}</td>
                  <td className="px-3 py-3 font-semibold text-slate-200">{incident.node}</td>
                  <td className="px-3 py-3 text-white">{incident.incident}</td>
                  <td className={`px-3 py-3 font-black ${incident.severity === "CRITICAL" ? "text-rose-300" : incident.severity === "WARNING" ? "text-amber-300" : "text-emerald-300"}`}>{incident.severity}</td>
                  <td className="px-3 py-3 font-black text-cyan-200">{incident.risk}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
