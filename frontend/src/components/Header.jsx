import React from "react";
import { Cpu, ShieldCheck } from "lucide-react";

export default function Header({ connected, node, backendStatus }) {
  return (
    <header className="border-b border-slate-800 bg-[#070b14]">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">NEXUS</div>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-normal text-white md:text-5xl">NEXUS WAR ROOM</h1>
          <p className="mt-2 text-sm font-medium text-slate-400">Autonomous Operational Intelligence Infrastructure</p>
        </div>

        <div className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-200 sm:grid-cols-3">
          <div className="flex h-11 items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3">
            <span className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-400" : "bg-rose-400"}`} />
            {connected ? "LIVE SYSTEM" : "BACKEND DISCONNECTED"}
          </div>
          <div className="flex h-11 items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3">
            <ShieldCheck size={16} className="text-cyan-300" />
            AI ENGINE ACTIVE
          </div>
          <div className="flex h-11 items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3">
            <Cpu size={16} className="text-cyan-300" />
            {backendStatus === "connecting" ? "CONNECTING" : `NODE: ${node}`}
          </div>
        </div>
      </div>
    </header>
  );
}
