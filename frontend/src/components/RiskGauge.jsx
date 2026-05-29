import React from "react";

export default function RiskGauge({ risk }) {
  const color = risk >= 80 ? "#f43f5e" : risk >= 50 ? "#f59e0b" : "#34d399";

  return (
    <div className="rounded-md border border-nexus-line bg-nexus-panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">AI Risk Score</h2>
          <p className="mt-1 text-sm text-slate-500">Rule-based operational intelligence</p>
        </div>
        <div className="text-4xl font-bold" style={{ color }}>
          {risk}%
        </div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${risk}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
