import React, { useState, useEffect } from "react";
import { Brain, Clock } from "lucide-react";
import { AssessmentQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

import { getOnboardingCalibrationQuestions } from "@/lib/questionBank";

interface CalibrationStepProps {
  questions: AssessmentQuestion[];
  answers: Record<string, number>;
  onSelectOption: (questionId: string, optionIndex: number) => void;
  targetRole: string;
}

export function CalibrationStep({
  questions,
  answers,
  onSelectOption,
  targetRole
}: CalibrationStepProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Non-scoring pacing timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  // Dynamically resolve fallback questions for targetRole (e.g. Video Editor, Doctor, Designer)
  const roleFallbackQuestions = getOnboardingCalibrationQuestions(targetRole, 4);
  const activeQuestions = questions && questions.length > 0 ? questions : roleFallbackQuestions;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Brain className="h-4 w-4" /> Step 5: Diagnostic Calibration
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mt-1 tracking-tight">
            Quick Baseline Calibration
          </h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground font-mono">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>Elapsed: {formatElapsed(elapsedSeconds)}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Answer these {activeQuestions.length} conceptual questions to calibrate baseline confidence for your {targetRole || "chosen"} roadmap. (Visual timer does not affect scoring).
      </p>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        {activeQuestions.map((q, qIdx) => (
          <div key={q.id} className="rounded-2xl border border-border bg-card p-4.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1.5">
              <span>Question {qIdx + 1} of {activeQuestions.length}</span>
              {q.skill_name && <span className="font-mono text-primary font-bold">{q.skill_name}</span>}
            </div>
            <p className="text-xs sm:text-sm font-bold text-foreground mb-3.5 leading-relaxed">{q.question_text}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {q.options.map((opt, optIdx) => {
                const isSelected = answers[q.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => onSelectOption(q.id, optIdx)}
                    className={cn(
                      "rounded-xl border p-3 text-xs text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "border-border bg-surface-muted text-foreground hover:bg-muted"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
