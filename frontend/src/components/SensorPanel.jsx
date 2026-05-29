import React from "react";
import { Activity, Volume2, Thermometer } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        <Icon size={15} className={tone} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

export default function SensorPanel({ latest, chartData }) {
  const critical = latest.severity === "CRITICAL";
  const warning = latest.severity === "WARNING";

  return (
    <section className={`rounded-md border bg-[#101722] p-4 ${critical ? "critical-panel border-rose-400/40" : warning ? "border-amber-400/35" : "border-slate-800"}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">Live Sensor Graph</h2>
        <span className={`rounded-sm border px-2 py-1 text-xs font-bold ${critical ? "border-rose-400/40 bg-rose-500/10 text-rose-200" : warning ? "border-amber-400/40 bg-amber-500/10 text-amber-200" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"}`}>STREAMING</span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Metric icon={Thermometer} label="Temperature" value={`${latest.input.temperature} C`} tone="text-rose-300" />
        <Metric icon={Activity} label="Vibration" value={`${latest.input.vibration}%`} tone="text-amber-300" />
        <Metric icon={Volume2} label="Sound" value={latest.input.sound} tone="text-cyan-300" />
      </div>

      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="nexusTemp" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#fb7185" stopOpacity={0.65} />
                <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="nexusVibe" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#263142" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#64748b" tickLine={false} />
            <YAxis stroke="#64748b" tickLine={false} />
            <Tooltip contentStyle={{ background: "#0b111c", border: "1px solid #263142", borderRadius: 6 }} />
            <Area type="monotone" dataKey="temperature" stroke="#fb7185" fill="url(#nexusTemp)" strokeWidth={2} />
            <Area type="monotone" dataKey="vibration" stroke="#22d3ee" fill="url(#nexusVibe)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
