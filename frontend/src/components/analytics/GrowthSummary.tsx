import React from "react";
import { CheckCircle2, Clock, TrendingUp, Award, Layers } from "lucide-react";
import { AnalyticsSummary } from "@/lib/types";
import { Card, ProgressRing } from "@/components/ui";

interface GrowthSummaryProps {
  analytics: AnalyticsSummary;
}

export function GrowthSummary({ analytics }: GrowthSummaryProps) {
  const progressPct = Math.round(analytics.overall_progress_percentage || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card variant="default" className="p-4 flex items-center gap-4">
        <ProgressRing progress={progressPct} size={52} strokeWidth={5} color="primary" />
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Curriculum Progress</span>
          <h4 className="text-base font-extrabold text-foreground">{progressPct}% Complete</h4>
          <span className="text-[11px] text-muted-foreground">
            {analytics.completed_resources} of {analytics.total_resources} modules
          </span>
        </div>
      </Card>

      <Card variant="default" className="p-4 flex items-center gap-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary border border-border shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Study Effort</span>
          <h4 className="text-base font-extrabold text-foreground font-mono">{analytics.hours_completed}h Completed</h4>
          <span className="text-[11px] text-muted-foreground">of {analytics.total_learning_hours}h estimated</span>
        </div>
      </Card>

      <Card variant="default" className="p-4 flex items-center gap-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-cyan-600 dark:text-cyan-400 border border-border shrink-0">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Learning Velocity</span>
          <h4 className="text-base font-extrabold text-foreground font-mono">
            {analytics.weekly_velocity ? analytics.weekly_velocity.toFixed(1) : "1.0"}x Pace
          </h4>
          <span className="text-[11px] text-primary font-medium">Calibrated cadence</span>
        </div>
      </Card>

      <Card variant="default" className="p-4 flex items-center gap-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-emerald-600 dark:text-emerald-400 border border-border shrink-0">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recommendation Fit</span>
          <h4 className="text-base font-extrabold text-foreground font-mono">{Math.round(analytics.acceptance_rate)}% Relevance</h4>
          <span className="text-[11px] text-muted-foreground">High alignment</span>
        </div>
      </Card>
    </div>
  );
}
