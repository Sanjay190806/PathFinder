import React from "react";

export function SkillGraphLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 bg-surface-raised/80 px-3 py-1.5 rounded-xl border border-surface-border">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
        <span>Mastered (&ge;80%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/40" />
        <span>In Progress</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 border border-cyan-300" />
        <span>Ready / Eligible</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-600 border border-slate-500" />
        <span>Prerequisite Locked</span>
      </div>
      <div className="hidden sm:flex items-center gap-2 border-l border-slate-700 pl-3">
        <span className="text-slate-300 font-mono">&rarr;</span>
        <span>Required Prerequisite</span>
      </div>
    </div>
  );
}
