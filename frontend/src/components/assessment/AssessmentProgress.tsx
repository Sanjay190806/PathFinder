import React from "react";
import { ProgressBar } from "@/components/ui";

interface AssessmentProgressProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
}

export function AssessmentProgress({
  currentIndex,
  totalQuestions,
  answeredCount
}: AssessmentProgressProps) {
  const percentage = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-2 bg-card p-3 rounded-xl border border-border/80 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-extrabold text-foreground tracking-tight">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span className="font-mono text-foreground font-bold">
          {answeredCount} of {totalQuestions} answered ({percentage}%)
        </span>
      </div>
      <ProgressBar progress={percentage} size="sm" color="primary" />
    </div>
  );
}
