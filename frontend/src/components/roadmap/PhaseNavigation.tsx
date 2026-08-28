import React from "react";
import { cn } from "@/lib/utils";

interface PhaseNavProps {
  phases: Array<{ number: number; name: string; count: number; completedCount: number }>;
  activePhase: number | "all";
  onSelectPhase: (phaseNum: number | "all") => void;
}

export function PhaseNavigation({ phases, activePhase, onSelectPhase }: PhaseNavProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <button
        onClick={() => onSelectPhase("all")}
        className={cn(
          "rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shrink-0",
          activePhase === "all"
            ? "bg-primary-600 text-white shadow-sm"
            : "bg-surface-raised border border-surface-border text-slate-400 hover:text-white hover:bg-slate-800"
        )}
      >
        All Phases ({phases.reduce((acc, p) => acc + p.count, 0)})
      </button>

      {phases.map((p) => {
        const isCurrent = activePhase === p.number;
        const isComplete = p.count > 0 && p.completedCount === p.count;

        return (
          <button
            key={p.number}
            onClick={() => onSelectPhase(p.number)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shrink-0",
              isCurrent
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-surface-raised border border-surface-border text-slate-300 hover:text-white hover:bg-slate-800"
            )}
          >
            <span>Phase {p.number}: {p.name}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                isCurrent ? "bg-primary-700 text-white" : isComplete ? "bg-emerald-950 text-emerald-300" : "bg-surface text-slate-400"
              )}
            >
              {p.completedCount}/{p.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
