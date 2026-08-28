import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, RefreshCw, ArrowRight, Route, Target, Sparkles } from "lucide-react";
import { AssessmentResult } from "@/lib/types";
import { Button, Card, Badge, ProgressRing } from "@/components/ui";

interface CalibrationResultProps {
  result: AssessmentResult;
  onRetake: () => void;
}

export function CalibrationResult({ result, onRetake }: CalibrationResultProps) {
  const isPassing = result.score_percentage >= 70;

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-200">
      {/* Header Result Card */}
      <Card variant="highlight" className="p-6 sm:p-8 text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 shadow-lg mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div>
          <Badge variant={isPassing ? "success" : "primary"} size="md">
            Calibration Completed
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Skill Baseline Calibrated
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
            {result.summary_message}
          </p>
        </div>

        <div className="flex justify-center items-center gap-6 pt-2">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Score</span>
            <span className="text-2xl font-black text-white font-mono">
              {result.correct_count} / {result.total_questions}
            </span>
          </div>
          <div className="h-8 w-px bg-surface-border" />
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Accuracy</span>
            <span className="text-2xl font-black text-accent-cyan font-mono">
              {Math.round(result.score_percentage)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Skill Confidence Updates Grid */}
      {result.skill_confidence_updates && result.skill_confidence_updates.length > 0 && (
        <Card variant="default" className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Calibrated Skill Confidence Updates</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              The adaptive engine updated your mastery telemetry and checked prerequisite unlock thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.skill_confidence_updates.map((u, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-surface-border bg-surface-raised/60 p-3.5 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">{u.skill}</span>
                  {u.old_confidence !== undefined && u.new_confidence !== undefined ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <span>{Math.round(u.old_confidence * 100)}%</span>
                      <span>&rarr;</span>
                      <span className="font-bold text-accent-cyan">{Math.round(u.new_confidence * 100)}%</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {u.is_correct ? "Competency Verified" : "Needs Review"}
                    </span>
                  )}
                </div>

                {u.is_correct ? (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="h-3 w-3" /> Correct
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    <XCircle className="h-3 w-3" /> Review
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={onRetake}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Retake Calibration
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/roadmap" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full" leftIcon={<Route className="h-4 w-4" />}>
              Inspect Roadmap Diff
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
