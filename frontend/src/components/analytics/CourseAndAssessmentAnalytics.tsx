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
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Course Progress & Completion</h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {courseData ? `${courseData.completed_courses}/${courseData.total_courses} Completed` : "Loading..."}
          </span>
        </div>

        {!courseData || courseData.courses.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground bg-muted/50 rounded-xl border border-border">
            <p className="text-sm font-medium">No courses started yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Begin a course to see authoritative progress & completion statistics.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {courseData.courses.map((c) => (
              <div
                key={c.course_id}
                className="p-3.5 rounded-xl bg-muted/50 border border-border flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground line-clamp-1">{c.course_name}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      c.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                        : c.status === "in_progress"
                        ? "bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/30"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-mono font-bold text-foreground">{c.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        c.status === "completed" ? "bg-emerald-500" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(100, c.progress_percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <span>Attempts: <strong className="text-foreground font-mono">{c.assessment_attempts}</strong></span>
                  <span>Best Score: <strong className="text-foreground font-mono">{c.best_score !== null ? `${c.best_score}%` : "None"}</strong></span>
                  <span>Modules: <strong className="text-foreground font-mono">{c.modules_completed}/{c.modules_total}</strong></span>
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
            <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-foreground">Assessment Performance</h3>
          </div>
          <span className="text-xs text-muted-foreground">Academic vs. Integrity</span>
        </div>

        {!assessmentData || assessmentData.total_attempts === 0 ? (
          <div className="p-6 text-center text-muted-foreground bg-muted/50 rounded-xl border border-border">
            <p className="text-sm font-medium">No assessment data yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Assessment metrics will appear after your first exam attempt.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Valid Pass Rate</span>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {assessmentData.pass_rate !== null ? `${assessmentData.pass_rate}%` : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Average Score</span>
                <p className="text-lg font-black text-foreground font-mono">
                  {assessmentData.average_score !== null ? `${assessmentData.average_score}%` : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Highest Score</span>
                <p className="text-lg font-black text-cyan-700 dark:text-cyan-400 font-mono">
                  {assessmentData.highest_score !== null ? `${assessmentData.highest_score}%` : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl border border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Question Accuracy</span>
                <p className="text-lg font-black text-amber-700 dark:text-amber-400 font-mono">
                  {assessmentData.question_accuracy !== null ? `${assessmentData.question_accuracy}%` : "N/A"}
                </p>
              </div>
            </div>

            {/* Audit Breakdown */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
              <span className="text-xs font-semibold text-foreground">Attempt Integrity Classification</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Passed: <strong className="font-mono text-foreground">{assessmentData.passed_attempts}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Review Req: <strong className="font-mono text-foreground">{assessmentData.review_required_attempts}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  <span>Invalidated: <strong className="font-mono text-foreground">{assessmentData.invalidated_attempts}</strong></span>
                </div>
              </div>
            </div>

            {assessmentData.status_note && (
              <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-lg border border-border/40">
                ℹ️ {assessmentData.status_note}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
