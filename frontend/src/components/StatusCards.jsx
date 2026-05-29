import React from "react";
import { Activity, AlertTriangle, Network, TrendingUp } from "lucide-react";

function Card({ icon: Icon, label, value, tone, pulse = false }) {
  const tones = {
    green: "text-emerald-300 border-emerald-400/25",
    amber: "text-amber-300 border-amber-400/25",
    red: "text-rose-300 border-rose-400/25",
    cyan: "text-cyan-300 border-cyan-400/25"
  };

  return (
    <div className={`rounded-md border bg-[#101722] p-4 ${tones[tone]} ${pulse ? "critical-panel" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span>
        <Icon size={18} />
      </div>
      <div className="mt-4 text-3xl font-black text-white">{value}</div>
    </div>
  );
}

export default function StatusCards({ latest, activeCount, nodesOnline, connected }) {
  const systemHealth = connected ? Math.max(0, 100 - Math.round(latest.risk * 0.55)) : 0;
  const riskTone = latest.risk >= 80 ? "red" : latest.risk >= 50 ? "amber" : "green";
  const critical = latest.severity === "CRITICAL";

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Card icon={Activity} label="System Health" value={`${systemHealth}%`} tone={systemHealth < 60 ? "red" : "green"} pulse={critical} />
      <Card icon={AlertTriangle} label="Active Incidents" value={activeCount} tone={activeCount > 0 ? "amber" : "green"} pulse={critical} />
      <Card icon={TrendingUp} label="Escalation Risk" value={`${latest.risk}%`} tone={riskTone} pulse={critical} />
      <Card icon={Network} label="Nodes Online" value={nodesOnline} tone={connected ? "cyan" : "red"} />
    </section>
  );
}
