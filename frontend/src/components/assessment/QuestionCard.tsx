import React from "react";
import { AssessmentQuestion } from "@/lib/types";
import { Card, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: AssessmentQuestion;
  selectedOptionIndex?: number;
  onSelectOption: (optionIndex: number) => void;
}

export function QuestionCard({
  question,
  selectedOptionIndex,
  onSelectOption
}: QuestionCardProps) {
  const optionLetters = ["A", "B", "C", "D", "E"];

  return (
    <Card variant="default" className="p-6 sm:p-8 space-y-6">
      {/* Question Header & Context */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="primary" size="sm">
            Topic: {question.skill_name || "General"}
          </Badge>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed tracking-tight">
          {question.question_text}
        </h2>
      </div>

      {/* Answer Options Grid */}
      <div className="space-y-3 pt-2" role="radiogroup" aria-label={question.question_text}>
        {question.options.map((opt, idx) => {
          const isSelected = selectedOptionIndex === idx;

          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectOption(idx)}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition-all duration-150 flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                isSelected
                  ? "border-primary-500 bg-primary-950/70 text-white font-semibold shadow-md shadow-primary-500/10 ring-1 ring-primary-500/50"
                  : "border-surface-border bg-surface-raised/40 text-slate-300 hover:bg-surface-raised hover:border-slate-600"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold font-mono transition-colors shrink-0",
                  isSelected
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-surface text-slate-400 border border-surface-border"
                )}
              >
                {optionLetters[idx] || idx + 1}
              </div>
              <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
