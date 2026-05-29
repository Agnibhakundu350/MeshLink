import React from "react";
import { Activity, Flame, RotateCcw, ShieldAlert, Volume2, Zap } from "lucide-react";
import { triggers } from "../data/triggers";

function iconFor(scenario) {
  if (scenario === "overheat") return Flame;
  if (scenario === "vibration") return Activity;
  if (scenario === "noise") return Volume2;
  if (scenario === "cyber") return ShieldAlert;
  if (scenario === "cascading") return Zap;
  return RotateCcw;
}

export default function TriggerButtons({ onTrigger }) {
  return (
    <section className="rounded-md border border-slate-800 bg-[#101722] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">Incident Trigger Buttons</h2>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Backend Simulation</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
        {triggers.map((trigger) => {
          const Icon = iconFor(trigger.scenario);
          return (
            <button
              key={trigger.scenario}
              onClick={() => onTrigger(trigger.scenario)}
              className="flex h-12 items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm font-black text-slate-100 transition hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-100"
            >
              <Icon size={17} />
              {trigger.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
