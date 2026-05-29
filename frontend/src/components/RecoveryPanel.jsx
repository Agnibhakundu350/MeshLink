import React from "react";

export default function RecoveryPanel({ latest }) {
  const critical = latest.severity === "CRITICAL";
  const actions = critical
    ? ["Isolate affected node", "Shift load to backup systems", "Inspect thermal source", "Generate postmortem"]
    : latest.severity === "WARNING"
      ? ["Increase monitoring frequency", "Inspect affected subsystem", "Prepare backup route", "Log maintenance ticket"]
      : ["Maintain normal operation", "Keep telemetry stream active", "Run periodic health check", "Archive normal status"];

  return (
    <section className={`rounded-md border bg-[#101722] p-4 ${critical ? "critical-panel border-rose-400/40" : latest.severity === "WARNING" ? "border-amber-400/35" : "border-slate-800"}`}>
      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">Recovery Actions</h2>
      <ol className="space-y-3">
        {actions.map((action, index) => (
          <li key={action} className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-950 px-3 py-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-cyan-400/10 text-sm font-black text-cyan-200">{index + 1}</span>
            <span className="font-semibold text-slate-100">{action}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
