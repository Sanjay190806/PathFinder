import React from "react";
import { Layers, CheckCircle2 } from "lucide-react";
import { Card, Badge, ProgressBar } from "@/components/ui";

interface SkillMasteryOverviewProps {
  skills: Array<{
    skill: string;
    category: string;
    confidence: number;
    target_confidence: number;
  }>;
}

export function SkillMasteryOverview({ skills }: SkillMasteryOverviewProps) {
  if (!skills || skills.length === 0) {
    return (
      <Card variant="default" className="p-6 text-center text-xs text-slate-400">
        No skill confidence data available. Complete calibration diagnostics to see your mastery.
      </Card>
    );
  }

  return (
    <Card variant="default" className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary-400" />
          Competency Confidence Telemetry
        </h3>
        <span className="text-xs text-slate-400 font-mono">Target: 85%</span>
      </div>

      <div className="space-y-3.5">
        {skills.map((sm, idx) => {
          const confPct = Math.round(sm.confidence * 100);
          const isMastered = confPct >= 80;

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{sm.skill}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({sm.category})</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className={isMastered ? "text-emerald-400 font-bold" : "text-accent-cyan"}>
                    {confPct}%
                  </span>
                  {isMastered && (
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Mastered
                    </Badge>
                  )}
                </div>
              </div>

              <ProgressBar
                progress={confPct}
                size="sm"
                color={isMastered ? "emerald" : confPct >= 50 ? "primary" : "cyan"}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
