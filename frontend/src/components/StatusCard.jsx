import React from "react";

export default function StatusCard({ label, value, tone = "cyan", detail }) {
  const tones = {
    cyan: "border-cyan-400/35 text-cyan-200",
    green: "border-emerald-400/35 text-emerald-200",
    amber: "border-amber-400/35 text-amber-200",
    red: "border-rose-400/35 text-rose-200"
  };

  return (
    <div className={`rounded-md border bg-nexus-panel px-4 py-3 ${tones[tone]}`}>
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 min-h-5 text-sm text-slate-400">{detail}</div>
    </div>
  );
}
