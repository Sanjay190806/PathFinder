'use client';

import React from "react";
import { BookOpen, CheckCircle2, Award, Clock, Flame, ShieldAlert, Info } from "lucide-react";
import { AnalyticsOverview } from "@/lib/types";
import { Card } from "@/components/ui";

interface OverviewAuthoritativeKPIsProps {
  overview: AnalyticsOverview | null;
  onOpenDefinitions: () => void;
}

export function OverviewAuthoritativeKPIs({ overview, onOpenDefinitions }: OverviewAuthoritativeKPIsProps) {
  if (!overview) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-400 bg-primary-950/60 px-2.5 py-1 rounded-md border border-primary-800/40">
            Backend Authoritative Data
          </span>
          <span className="text-xs text-slate-400">
            Freshness: <span className="text-emerald-400 font-mono font-medium">{overview.data_freshness}</span> ({overview.calculation_version})
          </span>
        </div>
        <button
          onClick={onOpenDefinitions}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-surface-raised border border-surface-border px-3 py-1 rounded-lg self-start sm:self-auto"
        >
          <Info className="h-3.5 w-3.5 text-primary-400" />
          <span>Metric Definitions & Formulas</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Course Completion KPI */}
        <Card variant="default" className="p-4 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950/50 text-blue-400 border border-blue-800/40 shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Course Completion</span>
            <h4 className="text-lg font-black text-white font-mono">
              {overview.course_completion_rate !== null ? `${overview.course_completion_rate}%` : "Not Available"}
            </h4>
            <span className="text-[11px] text-slate-400">
              {overview.courses_completed} completed of {overview.courses_started} started
            </span>
          </div>
        </Card>

        {/* Assessment Pass Rate KPI */}
        <Card variant="default" className="p-4 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assessment Pass Rate</span>
            <h4 className="text-lg font-black text-white font-mono">
              {overview.assessment_pass_rate !== null ? `${overview.assessment_pass_rate}%` : "No Attempts"}
            </h4>
            <span className="text-[11px] text-slate-400">
              {overview.assessments_passed} passed of {overview.assessments_valid} valid attempts
            </span>
          </div>
        </Card>

        {/* Study Effort KPI (Separated from Exam Time) */}
        <Card variant="default" className="p-4 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-950/50 text-cyan-400 border border-cyan-800/40 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Learning Effort</span>
            <h4 className="text-lg font-black text-white font-mono">{overview.learning_hours} hrs</h4>
            <span className="text-[11px] text-slate-400">
              {overview.learning_sessions} study sessions ({overview.assessment_duration_hours}h exams separate)
            </span>
          </div>
        </Card>

        {/* Learning Streak KPI */}
        <Card variant="default" className="p-4 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-950/50 text-amber-400 border border-amber-800/40 shrink-0">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Learning Streak</span>
            <h4 className="text-lg font-black text-white font-mono">{overview.current_streak} Days</h4>
            <span className="text-[11px] text-slate-400">
              Longest: {overview.longest_streak} days (qualifying activity)
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
