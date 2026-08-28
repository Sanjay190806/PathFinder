import React from "react";
import { CheckCircle2, Clock, Route, Award, Flame } from "lucide-react";
import { AnalyticsSummary, LearningPath } from "@/lib/types";
import { Card, ProgressRing, ProgressBar, Badge } from "@/components/ui";

interface ProgressSnapshotProps {
  analytics: AnalyticsSummary | null;
  learningPath: LearningPath | null;
}

export function ProgressSnapshot({ analytics, learningPath }: ProgressSnapshotProps) {
  const activeVersion = learningPath?.current_version;
  const items = activeVersion?.items || [];
  const completedItems = items.filter((it) => it.is_completed).length;
  const totalItems = items.length;
  const calculatedProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : (analytics?.overall_progress_percentage || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Overall Progress */}
      <Card variant="default" className="p-4 flex items-center gap-4">
        <ProgressRing progress={calculatedProgress} size={54} strokeWidth={5} color="primary" />
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Progress</span>
          <h4 className="text-base font-extrabold text-white">{calculatedProgress}% Completed</h4>
          <span className="text-[11px] text-slate-400">{completedItems} of {totalItems} modules</span>
        </div>
      </Card>

      {/* 2. Active Phase */}
      <Card variant="default" className="p-4 flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-raised text-primary-400 border border-surface-border shrink-0">
          <Route className="h-5 w-5" />
        </div>
        <div className="truncate">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Phase</span>
          <h4 className="text-sm font-bold text-white truncate">
            {analytics?.active_phase || (items.length > 0 ? items[0].phase_name : "Foundations")}
          </h4>
          <span className="text-[11px] text-accent-cyan font-medium">Active Milestone</span>
        </div>
      </Card>

      {/* 3. Learning Hours */}
      <Card variant="default" className="p-4 flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-raised text-emerald-400 border border-surface-border shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Study Time</span>
          <h4 className="text-sm font-bold text-white font-mono">
            {analytics?.hours_completed || 0}h / {analytics?.total_learning_hours || 0}h
          </h4>
          <span className="text-[11px] text-slate-400">Total estimated curriculum</span>
        </div>
      </Card>

      {/* 4. Learning Streak / Velocity */}
      <Card variant="default" className="p-4 flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-raised text-amber-400 border border-surface-border shrink-0">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Streak</span>
          <h4 className="text-sm font-bold text-white font-mono">
            {analytics?.current_streak_days !== undefined ? `${analytics.current_streak_days} Days` : "1 Day"}
          </h4>
          <span className="text-[11px] text-slate-400">Active consistency</span>
        </div>
      </Card>
    </div>
  );
}
