'use client';

import React from "react";
import { BookOpen, CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Award, FileText } from "lucide-react";
import { CourseAnalytics, AssessmentAnalytics } from "@/lib/types";
import { Card } from "@/components/ui";

interface CourseAndAssessmentAnalyticsProps {
  courseData: CourseAnalytics | null;
  assessmentData: AssessmentAnalytics | null;
}

export function CourseAndAssessmentAnalytics({ courseData, assessmentData }: CourseAndAssessmentAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Course Analytics Card */}
      <Card variant="default" className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-primary-400" />
            <h3 className="text-base font-bold text-white">Course Progress & Completion</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {courseData ? `${courseData.completed_courses}/${courseData.total_courses} Completed` : "Loading..."}
          </span>
        </div>

        {!courseData || courseData.courses.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-surface-raised/40 rounded-xl border border-surface-border">
            <p className="text-sm font-medium">No courses started yet.</p>
            <p className="text-xs text-slate-500 mt-1">Begin a course to see authoritative progress & completion statistics.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {courseData.courses.map((c) => (
              <div
                key={c.course_id}
                className="p-3.5 rounded-xl bg-surface-raised/60 border border-surface-border flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white line-clamp-1">{c.course_name}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      c.status === "completed"
                        ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/40"
                        : c.status === "in_progress"
                        ? "bg-blue-950/70 text-blue-400 border border-blue-800/40"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span className="font-mono text-white">{c.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        c.status === "completed" ? "bg-emerald-500" : "bg-primary-500"
                      }`}
                      style={{ width: `${Math.min(100, c.progress_percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-surface-border/40">
                  <span>Attempts: <strong className="text-white font-mono">{c.assessment_attempts}</strong></span>
                  <span>Best Score: <strong className="text-white font-mono">{c.best_score !== null ? `${c.best_score}%` : "None"}</strong></span>
                  <span>Modules: <strong className="text-white font-mono">{c.modules_completed}/{c.modules_total}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Assessment Intelligence Card */}
      <Card variant="default" className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Assessment Performance</h3>
          </div>
          <span className="text-xs text-slate-400">Academic vs. Integrity</span>
        </div>

        {!assessmentData || assessmentData.total_attempts === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-surface-raised/40 rounded-xl border border-surface-border">
            <p className="text-sm font-medium">No assessment data yet.</p>
            <p className="text-xs text-slate-500 mt-1">Assessment metrics will appear after your first exam attempt.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 bg-surface-raised/60 rounded-xl border border-surface-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Valid Pass Rate</span>
                <p className="text-lg font-black text-emerald-400 font-mono">
                  {assessmentData.pass_rate !== null ? `${assessmentData.pass_rate}%` : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-surface-raised/60 rounded-xl border border-surface-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Average Score</span>
                <p className="text-lg font-black text-white font-mono">
                  {assessmentData.average_score !== null ? `${assessmentData.average_score}%` : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-surface-raised/60 rounded-xl border border-surface-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Highest Score</span>
                <p className="text-lg font-black text-cyan-400 font-mono">
                  {assessmentData.highest_score !== null ? `${assessmentData.highest_score}%` : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-surface-raised/60 rounded-xl border border-surface-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Question Accuracy</span>
                <p className="text-lg font-black text-amber-400 font-mono">
                  {assessmentData.question_accuracy !== null ? `${assessmentData.question_accuracy}%` : "N/A"}
                </p>
              </div>
            </div>

            {/* Audit Breakdown Breakdown */}
            <div className="p-3.5 rounded-xl bg-surface-raised/40 border border-surface-border space-y-2">
              <span className="text-xs font-semibold text-slate-300">Attempt Integrity Classification</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Passed: <strong className="font-mono text-white">{assessmentData.passed_attempts}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Review Req: <strong className="font-mono text-white">{assessmentData.review_required_attempts}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-red-400">
                  <XCircle className="h-4 w-4" />
                  <span>Invalidated: <strong className="font-mono text-white">{assessmentData.invalidated_attempts}</strong></span>
                </div>
              </div>
            </div>

            {assessmentData.status_note && (
              <p className="text-xs text-slate-400 italic bg-surface-raised/20 p-2.5 rounded-lg border border-surface-border/40">
                ℹ️ {assessmentData.status_note}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
