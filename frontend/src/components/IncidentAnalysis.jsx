import React from "react";

export default function IncidentAnalysis({ latest }) {
  const critical = latest.severity === "CRITICAL";
  const warning = latest.severity === "WARNING";
  const tone = critical ? "text-rose-300 border-rose-400/35 bg-rose-500/10" : warning ? "text-amber-300 border-amber-400/35 bg-amber-500/10" : "text-emerald-300 border-emerald-400/35 bg-emerald-500/10";
  const confidence = Math.min(98, Math.max(76, Math.round(82 + latest.risk * 0.16)));

  return (
    <section className={`rounded-md border bg-[#101722] p-5 ${tone} ${critical ? "critical-panel" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">AI Incident Analysis</h2>
        <span className="rounded-sm border border-current px-2 py-1 text-xs font-black">{latest.severity}</span>
      </div>

      <div className="mt-6 text-3xl font-black uppercase text-white">{latest.incident}</div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
          <span>Risk Score</span>
          <span className={critical ? "text-rose-300" : warning ? "text-amber-300" : "text-emerald-300"}>{latest.risk}%</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-slate-900">
          <div className="h-full rounded-full bg-current transition-all duration-500" style={{ width: `${latest.risk}%` }} />
        </div>
      </div>

      <div className="mt-5 rounded-md border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center justify-between text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
          <span>AI Confidence</span>
          <span className={critical ? "text-rose-300" : warning ? "text-amber-300" : "text-cyan-300"}>{confidence}%</span>
        </div>
        <div className="mt-3 grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={index}
              className={`h-3 rounded-sm ${index < Math.round(confidence / 8.34) ? "bg-current" : "bg-slate-800"}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-md border border-slate-800 bg-slate-950 p-4">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">AI Recommendation</div>
        <p className="mt-3 text-lg font-semibold leading-7 text-white">{latest.recommendation}</p>
      </div>
    </section>
  );
}
