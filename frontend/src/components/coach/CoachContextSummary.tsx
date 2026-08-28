import React from "react";
import { Route, Layers, CheckCircle2, Clock } from "lucide-react";
import { CoachContext } from "@/lib/types";

interface CoachContextSummaryProps {
  context: CoachContext | null;
}

export function CoachContextSummary({ context }: CoachContextSummaryProps) {
  if (!context) return null;

  return (
    <div className="mx-4 mt-3 p-3 rounded-2xl bg-surface-raised/60 border border-surface-border space-y-1.5 text-[11px]">
      <div className="flex items-center justify-between text-slate-300">
        <span className="flex items-center gap-1 text-slate-400">
          <Route className="h-3 w-3 text-primary-400" /> Active Focus:
        </span>
        <span className="font-semibold text-white truncate max-w-[180px]">{context.active_phase}</span>
      </div>
      <div className="flex items-center justify-between text-slate-400">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Modules Completed:
        </span>
        <span className="font-mono text-slate-200">{context.completed_count}</span>
      </div>
      {context.next_step_title && (
        <div className="pt-1 border-t border-surface-border flex items-center justify-between text-accent-cyan">
          <span className="text-slate-400">Next Unlock:</span>
          <span className="font-semibold truncate max-w-[180px]">{context.next_step_title}</span>
        </div>
      )}
    </div>
  );
}
