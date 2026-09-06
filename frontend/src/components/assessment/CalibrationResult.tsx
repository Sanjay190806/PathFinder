import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  Route,
  Target,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  BookOpen,
  Clock,
  Layers,
  Award
} from "lucide-react";
import { AssessmentResult } from "@/lib/types";
import { Button, Card, Badge, ProgressRing } from "@/components/ui";

interface CalibrationResultProps {
  result: AssessmentResult;
  onRetake: () => void;
}

export function CalibrationResult({ result, onRetake }: CalibrationResultProps) {
  const isPassing = result.score_percentage >= 70;
  const remedialGaps = result.skill_gaps?.filter((g) => g.status === "REMEDIAL_NEEDED") || [];
  const masteredSkills = result.skill_gaps?.filter((g) => g.status === "MASTERED") || [];

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-200">
      {/* Auto-submitted malpractice notice if applicable */}
      {result.auto_submitted && (
        <div className="rounded-2xl border-2 border-red-500/40 bg-red-50 dark:bg-red-950/30 p-5 text-red-900 dark:text-red-200 shadow-xl flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1 text-left flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-700 dark:text-red-400 text-sm">Exam Auto-Submitted (Proctoring Violation)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30 uppercase">
                {result.malpractice_strikes || 3} Strikes Exceeded
              </span>
            </div>
            <p className="text-xs text-red-800/90 dark:text-red-300/90 leading-relaxed">
              {result.auto_submit_reason || "Assessment was automatically concluded due to repeated tab-switching or leaving full-screen mode."}
            </p>
          </div>
        </div>
      )}

      {/* Header Result Card */}
      <Card variant="highlight" className="p-6 sm:p-8 text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-lg mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant={isPassing ? "success" : "primary"} size="md">
              Calibration Completed
            </Badge>
            {result.planner_recalculated && (
              <Badge variant="cyan" size="md">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Adaptive Loop Active
              </Badge>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2 tracking-tight">
            Skill Baseline Calibrated
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl mx-auto">
            {result.summary_message}
          </p>
        </div>

        <div className="flex justify-center items-center gap-6 pt-2">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">Score</span>
            <span className="text-2xl font-black text-foreground font-mono">
              {result.correct_count} / {result.total_questions}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">Accuracy</span>
            <span className="text-2xl font-black text-primary font-mono">
              {Math.round(result.score_percentage)}%
            </span>
          </div>
          {result.new_roadmap_version && (
            <>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">Roadmap</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  v{result.new_roadmap_version}
                </span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* ─── Adaptive Closed-Loop: Competency Gap Analysis ────────────────── */}
      {result.skill_gaps && result.skill_gaps.length > 0 && (
        <Card variant="default" className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  Competency Vector & Gap Analysis
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bayesian Knowledge Tracing identified {remedialGaps.length} skill(s) requiring reinforcement and {masteredSkills.length} validated skill(s).
              </p>
            </div>
            {remedialGaps.length > 0 ? (
              <Badge variant="warning" size="sm">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {remedialGaps.length} Remedial Action{remedialGaps.length > 1 ? "s" : ""} Needed
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                <Award className="h-3 w-3 mr-1" />
                All Competencies On Track
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {result.skill_gaps.map((gap, idx) => {
              const isRemedial = gap.status === "REMEDIAL_NEEDED";
              const isMastered = gap.status === "MASTERED";

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 transition-all shadow-sm flex flex-col justify-between ${
                    isRemedial
                      ? "border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20"
                      : isMastered
                      ? "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground">{gap.skill}</span>
                      {isRemedial ? (
                        <Badge variant="warning" size="sm">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Remedial Needed
                        </Badge>
                      ) : isMastered ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Mastered
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Developing
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground font-mono">
                        <span>Accuracy</span>
                        <span className="font-bold text-foreground">{Math.round(gap.score_percentage)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isRemedial
                              ? "bg-amber-500"
                              : isMastered
                              ? "bg-emerald-500"
                              : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(8, gap.score_percentage))}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                      {gap.recommended_action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ─── Adaptive Closed-Loop: Recommended Remedial Modules ────────────── */}
      {result.adapted_modules && result.adapted_modules.length > 0 && (
        <Card variant="default" className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  Injected Remedial Modules (Prioritized in Study Planner)
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                The Planner Engine updated your daily and weekly milestones to cover these prerequisite gaps first.
              </p>
            </div>
            <Badge variant="cyan" size="sm">
              <Calendar className="h-3 w-3 mr-1" />
              Schedule Re-Sequenced
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {result.adapted_modules.map((mod, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {mod.skill}
                    </span>
                    <h4 className="text-xs font-bold text-foreground line-clamp-1">
                      {mod.title}
                    </h4>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {mod.format || "Guided Tutorial"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {mod.provider || "PathFinder Academy"}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    ~{mod.estimated_hours}h
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link href="/planner" className="block">
              <div className="p-3.5 rounded-2xl bg-primary/10 hover:bg-primary/15 border border-primary/20 text-primary flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold">
                    View your updated schedule with these remedial sessions scheduled for today
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </div>
            </Link>
          </div>
        </Card>
      )}

      {/* Skill Confidence Updates Grid */}
      {result.skill_confidence_updates && result.skill_confidence_updates.length > 0 && (
        <Card variant="default" className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">Calibrated Skill Confidence Updates</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              The adaptive engine updated your mastery telemetry and checked prerequisite unlock thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.skill_confidence_updates.map((u, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-3.5 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">{u.skill}</span>
                  {u.old_confidence !== undefined && u.new_confidence !== undefined ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                      <span>{Math.round(u.old_confidence * 100)}%</span>
                      <span>&rarr;</span>
                      <span className="font-bold text-primary">{Math.round(u.new_confidence * 100)}%</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">
                      {u.is_correct ? "Competency Verified" : "Needs Review"}
                    </span>
                  )}
                </div>

                {u.is_correct ? (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Correct
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    <XCircle className="h-3 w-3 mr-1" /> Review
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
          <Link href="/planner" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full" leftIcon={<Calendar className="h-4 w-4" />}>
              Open Adapted Planner
            </Button>
          </Link>
          <Link href="/roadmap" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full" leftIcon={<Route className="h-4 w-4" />}>
              Inspect Roadmap Diff
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
