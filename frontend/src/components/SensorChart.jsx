import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SensorChart({ data }) {
  return (
    <div className="rounded-md border border-nexus-line bg-nexus-panel p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Live Sensor Graph</h2>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="temp" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="vibe" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#263245" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#64748b" tickLine={false} />
            <YAxis stroke="#64748b" tickLine={false} />
            <Tooltip contentStyle={{ background: "#101623", border: "1px solid #263245", borderRadius: 6 }} />
            <Area type="monotone" dataKey="temperature" stroke="#f43f5e" fill="url(#temp)" />
            <Area type="monotone" dataKey="vibration" stroke="#22d3ee" fill="url(#vibe)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
