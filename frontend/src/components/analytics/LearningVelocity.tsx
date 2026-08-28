import React from "react";
import { Gauge, Zap, Flame } from "lucide-react";
import { Card, Badge } from "@/components/ui";

interface LearningVelocityProps {
  velocityScore: number;
  streakDays: number;
  activePhase: string;
}

export function LearningVelocity({
  velocityScore,
  streakDays,
  activePhase
}: LearningVelocityProps) {
  return (
    <Card variant="default" className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Gauge className="h-4 w-4 text-accent-cyan" />
          Pace & Learning Momentum
        </h3>
        <Badge variant="cyan" size="sm">
          Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-surface-border bg-surface-raised/60 p-3.5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-primary-400" /> Velocity Index
          </span>
          <span className="text-xl font-bold text-white font-mono block">
            {velocityScore.toFixed(1)}x
          </span>
          <p className="text-[11px] text-slate-400">
            Roadmap pacing adapts dynamically to match your study velocity.
          </p>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-raised/60 p-3.5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-amber-400" /> Current Momentum
          </span>
          <span className="text-xl font-bold text-amber-300 font-mono block">
            {streakDays} Day Streak
          </span>
          <p className="text-[11px] text-slate-400">
            Consecutive activity recorded in your learning telemetry.
          </p>
        </div>
      </div>

      <div className="text-xs text-slate-400 pt-1">
        Current Focus: <span className="text-slate-200 font-semibold">{activePhase}</span>
      </div>
    </Card>
  );
}
