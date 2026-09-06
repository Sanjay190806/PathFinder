'use client';

import React from "react";
import { Calendar, CheckSquare, Clock, Flag, TrendingUp } from "lucide-react";
import { LearningConsistency, PlannerAnalytics } from "@/lib/types";
import { Card } from "@/components/ui";

interface ConsistencyAndPlannerAnalyticsProps {
  consistencyData: LearningConsistency | null;
  plannerData: PlannerAnalytics | null;
}

export function ConsistencyAndPlannerAnalytics({ consistencyData, plannerData }: ConsistencyAndPlannerAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Learning Consistency Card */}
      <Card variant="default" className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-foreground">Learning Consistency & Habits</h3>
              <p className="text-xs text-muted-foreground">Qualifying study activity over the past 14 days</p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              consistencyData?.consistency_trend === "INCREASING"
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                : consistencyData?.consistency_trend === "STABLE"
                ? "bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/30"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {consistencyData?.consistency_trend || "STABLE"}
          </span>
        </div>

        {!consistencyData ? (
          <div className="p-6 text-center text-muted-foreground bg-muted/50 rounded-xl border border-border">
            <p className="text-sm font-medium">Tracking consistency...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Past 7 Days</span>
                <p className="text-base font-black text-foreground font-mono mt-0.5">{consistencyData.weekly_hours}h</p>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Past 14 Days</span>
                <p className="text-base font-black text-foreground font-mono mt-0.5">{consistencyData.monthly_hours}h</p>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Active Days</span>
                <p className="text-base font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5">
                  {consistencyData.qualifying_learning_days_count}/14
                </p>
              </div>
            </div>

            {/* 14-Day Activity Histogram */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground">Daily Study Activity</span>
              <div className="grid grid-cols-14 gap-1 pt-2">
                {consistencyData.daily_history_last_14_days.map((d) => (
                  <div key={d.date} className="flex flex-col items-center gap-1 group relative">
                    <div
                      className={`w-full rounded-sm transition-all ${
                        d.qualifying_hours > 2.0
                          ? "bg-emerald-500 h-12"
                          : d.qualifying_hours > 0.5
                          ? "bg-emerald-600/70 h-8"
                          : d.has_activity
                          ? "bg-emerald-700/40 h-4"
                          : "bg-surface-border h-2"
                      }`}
                    />
                    <span className="text-[9px] text-muted-foreground font-mono">
                      {d.date.slice(8)}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-popover text-popover-foreground text-[10px] p-1 rounded shadow border border-border whitespace-nowrap z-10">
                      {d.date}: {d.qualifying_hours}h ({d.sessions_count} sessions)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Planner Analytics Card */}
      <Card variant="default" className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-foreground">Study Plan Execution</h3>
              <p className="text-xs text-muted-foreground">Phase 9 Adaptive Planner Milestone Tracking</p>
            </div>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {plannerData?.has_active_plan ? `Plan v${plannerData.plan_version}` : "No Active Plan"}
          </span>
        </div>

        {!plannerData || !plannerData.has_active_plan ? (
          <div className="p-6 text-center text-muted-foreground bg-muted/50 rounded-xl border border-border">
            <p className="text-sm font-medium">No active planner plan generated yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Visit the Study Planner to generate your adaptive weekly schedule.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Planner KPIs */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-2.5 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Task Completion</span>
                <p className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                  {plannerData.completion_rate !== null ? `${plannerData.completion_rate}%` : "0%"}
                </p>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Tasks Completed</span>
                <p className="text-base font-black text-foreground font-mono mt-0.5">
                  {plannerData.completed_tasks_count}/{plannerData.planned_tasks_count}
                </p>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Overdue Tasks</span>
                <p className="text-base font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5">
                  {plannerData.overdue_tasks_count}
                </p>
              </div>
            </div>

            {/* Milestones Progress */}
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">Milestone Progress</span>
                <span className="font-mono text-foreground font-bold">
                  {plannerData.milestones_completed} of {plannerData.milestones_total} ({plannerData.milestone_progress_percentage}%)
                </span>
              </div>
              <div className="w-full bg-surface-border h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, plannerData.milestone_progress_percentage)}%` }}
                />
              </div>
            </div>

            {/* Weekly Hours Commitment */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
              <span>Weekly Target: <strong className="text-foreground font-mono">{plannerData.weekly_planned_hours}h</strong></span>
              <span>Logged Effort: <strong className="text-foreground font-mono">{plannerData.weekly_completed_hours}h</strong></span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
