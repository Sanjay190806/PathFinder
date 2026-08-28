import React from "react";
import { Layers } from "lucide-react";
import { PhaseProgress } from "@/lib/types";
import { Card, ProgressBar, Badge } from "@/components/ui";

interface PhaseProgressChartProps {
  phases?: PhaseProgress[];
}

export function PhaseProgressChart({ phases }: PhaseProgressChartProps) {
  if (!phases || phases.length === 0) return null;

  return (
    <Card variant="default" className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary-400" />
          Curriculum Phase Progression
        </h3>
        <span className="text-xs text-slate-400">{phases.length} Dynamic Phases</span>
      </div>

      <div className="space-y-4">
        {phases.map((p) => {
          const isComplete = p.completion_percentage >= 100;

          return (
            <div key={p.phase_number} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    Phase {p.phase_number}: {p.phase_name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({p.completed_modules}/{p.total_modules} modules &bull; {p.completed_hours}h/{p.total_hours}h)
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className={isComplete ? "text-emerald-400 font-bold" : "text-slate-300"}>
                    {Math.round(p.completion_percentage)}%
                  </span>
                  {isComplete && (
                    <Badge variant="success" size="sm">
                      Mastered
                    </Badge>
                  )}
                </div>
              </div>

              <ProgressBar
                progress={p.completion_percentage}
                size="sm"
                color={isComplete ? "emerald" : "primary"}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
