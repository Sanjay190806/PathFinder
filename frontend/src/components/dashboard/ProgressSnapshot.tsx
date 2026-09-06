import React from "react";
import { Clock, Route, Flame, Target } from "lucide-react";
import { AnalyticsSummary, LearningPath } from "@/lib/types";
import { Card, ProgressRing } from "@/components/ui";

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
      <Card variant="raised" className="p-5 flex items-center gap-4 bg-card">
        <ProgressRing progress={calculatedProgress} size={56} strokeWidth={6} color="primary" />
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Roadmap</span>
          <h4 className="text-lg font-bold text-foreground">{calculatedProgress}% Done</h4>
          <span className="text-xs text-muted-foreground font-medium">{completedItems} / {totalItems} modules</span>
        </div>
      </Card>

      {/* 2. Active Phase */}
      <Card variant="raised" className="p-5 flex items-center gap-4 bg-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-info/10 text-info shrink-0">
          <Route className="h-6 w-6" />
        </div>
        <div className="truncate">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Focus Area</span>
          <h4 className="text-sm font-bold text-foreground truncate mt-0.5">
            {analytics?.active_phase || (items.length > 0 ? items[0].phase_name : "Foundations")}
          </h4>
          <span className="text-xs text-info font-medium">Active Phase</span>
        </div>
      </Card>

      {/* 3. Learning Hours */}
      <Card variant="raised" className="p-5 flex items-center gap-4 bg-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success shrink-0">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Study Time</span>
          <h4 className="text-lg font-bold text-foreground font-mono mt-0.5">
            {analytics?.hours_completed || 0}h / {analytics?.total_learning_hours || 0}h
          </h4>
          <span className="text-xs text-muted-foreground font-medium">Curriculum pace</span>
        </div>
      </Card>

      {/* 4. Learning Streak */}
      <Card variant="raised" className="p-5 flex items-center gap-4 bg-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning shrink-0">
          <Flame className="h-6 w-6" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Streak</span>
          <h4 className="text-lg font-bold text-foreground font-mono mt-0.5">
            {analytics?.current_streak_days !== undefined ? `${analytics.current_streak_days} Days` : "1 Day"}
          </h4>
          <span className="text-xs text-muted-foreground font-medium">Consistency</span>
        </div>
      </Card>
    </div>
  );
}
