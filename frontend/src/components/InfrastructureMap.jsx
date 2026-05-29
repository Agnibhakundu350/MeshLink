import React from "react";
import { Cpu, Database, RadioTower, Server, ShieldAlert, Wifi } from "lucide-react";

const nodes = [
  { id: "edge", label: "EDGE", icon: RadioTower, x: "10%", y: "50%" },
  { id: "node-a", label: "NODE-A", icon: Cpu, x: "30%", y: "26%" },
  { id: "node-b", label: "NODE-B", icon: Server, x: "52%", y: "50%" },
  { id: "node-c", label: "NODE-C", icon: Cpu, x: "74%", y: "26%" },
  { id: "db", label: "DATABASE", icon: Database, x: "74%", y: "74%" },
  { id: "ai", label: "AI CORE", icon: ShieldAlert, x: "92%", y: "50%" }
];

const links = [
  ["edge", "node-a"],
  ["edge", "node-b"],
  ["node-a", "node-b"],
  ["node-b", "node-c"],
  ["node-b", "db"],
  ["node-c", "ai"],
  ["db", "ai"]
];

function statusFor(nodeId, latest, connected) {
  if (!connected) return nodeId === "edge" ? "critical" : "warning";
  if (latest.severity === "NORMAL") return "normal";
  if (latest.severity === "CRITICAL") {
    if (latest.tags?.includes("cyber") && ["ai", "node-b"].includes(nodeId)) return "critical";
    if (latest.tags?.includes("temperature") && ["node-a", "node-b"].includes(nodeId)) return "critical";
    if (latest.tags?.includes("vibration") && ["node-b", "node-c"].includes(nodeId)) return "critical";
    if (latest.tags?.includes("cascade") && ["node-b", "db", "ai"].includes(nodeId)) return "critical";
    if (["node-b", "db"].includes(nodeId)) return "critical";
    if (["node-a", "node-c"].includes(nodeId)) return "warning";
  }
  if (["node-b", "node-a"].includes(nodeId)) return "warning";
  return "normal";
}

export default function InfrastructureMap({ latest, connected = true }) {
  const active = latest.severity !== "NORMAL";
  const critical = latest.severity === "CRITICAL";

  return (
    <section className={`rounded-md border bg-[#101722] p-4 ${critical ? "critical-panel border-rose-400/40" : active ? "border-amber-400/35" : "border-slate-800"}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">Incident Propagation Map</h2>
        <span className={`rounded-sm border px-2 py-1 text-xs font-black ${critical ? "border-rose-400/40 bg-rose-500/10 text-rose-200" : active ? "border-amber-400/40 bg-amber-500/10 text-amber-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"}`}>
          {!connected ? "OFFLINE" : critical ? "CASCADE" : active ? "DEGRADED" : "STABLE"}
        </span>
      </div>

      <div className="relative h-80 overflow-hidden rounded-md border border-slate-800 bg-slate-950">
        <div className="absolute inset-0 topology-grid" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {links.map(([from, to], index) => {
            const a = nodes.find((node) => node.id === from);
            const b = nodes.find((node) => node.id === to);
            const hot = !connected || critical || (active && ["node-a", "node-b"].includes(from));
            return (
              <line
                key={`${from}-${to}`}
                x1={parseFloat(a.x)}
                y1={parseFloat(a.y)}
                x2={parseFloat(b.x)}
                y2={parseFloat(b.y)}
                className={hot ? "topology-link-hot" : "topology-link"}
                style={{ animationDelay: `${index * 120}ms` }}
              />
            );
          })}
        </svg>

        {nodes.map((node) => {
          const Icon = node.icon;
          const status = statusFor(node.id, latest, connected);
          return (
            <div
              key={node.id}
              className={`topology-node topology-node-${status}`}
              style={{ left: node.x, top: node.y }}
            >
              <Icon size={18} />
              <span>{node.label}</span>
            </div>
          );
        })}

        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          <Wifi size={14} className={active ? "text-amber-300" : "text-cyan-300"} />
          {latest.incident}
        </div>
      </div>
    </section>
  );
}
