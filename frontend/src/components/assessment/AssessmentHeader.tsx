import React from "react";
import Link from "next/link";
import { Brain, ArrowLeft, Target } from "lucide-react";
import { Badge } from "@/components/ui";

interface AssessmentHeaderProps {
  targetRole?: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  onExit?: () => void;
}

export function AssessmentHeader({
  targetRole,
  currentQuestionIndex,
  totalQuestions,
  onExit
}: AssessmentHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="cyan" size="sm">
            <Brain className="h-3 w-3" /> Diagnostic Calibration
          </Badge>
          {targetRole && (
            <Badge variant="neutral" size="sm">
              {targetRole}
            </Badge>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Skill Baseline Calibration
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Answer multiple-choice diagnostics to calibrate your skill confidence and tune your curriculum.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit Calibration</span>
        </Link>
      </div>
    </div>
  );
}
