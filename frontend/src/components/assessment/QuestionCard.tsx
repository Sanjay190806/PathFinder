import React from "react";
import { ShieldCheck } from "lucide-react";
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
    <Card variant="default" className="p-6 sm:p-8 space-y-6 border-2 border-border/80 shadow-md">
      {/* Question Header & Context */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="primary" size="sm" className="font-bold tracking-wide">
            Topic: {question.skill_name || "General"}
          </Badge>
          <div className="flex flex-wrap items-center gap-1.5">
            {question.detected_bloom_level && (
              <Badge variant="secondary" size="sm" className="text-[10px] font-bold uppercase tracking-wider">
                Bloom: {question.detected_bloom_level}
              </Badge>
            )}
            {question.instrumental_quality_score && (
              <Badge
                variant="success"
                size="sm"
                className="text-[10px] font-bold"
                title="Psychometrically verified for distractor plausibility, key unambiguity and cognitive depth"
              >
                <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                Verified (IQS: {Math.round(question.instrumental_quality_score)}%)
              </Badge>
            )}
          </div>
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold text-foreground leading-relaxed tracking-tight">
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
                "w-full rounded-2xl border-2 p-4 sm:p-5 text-left transition-all duration-150 flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected
                  ? "border-primary bg-primary/10 text-foreground font-bold shadow-sm ring-2 ring-primary/40"
                  : "border-slate-200 dark:border-border/80 bg-white dark:bg-card text-foreground hover:bg-slate-50 dark:hover:bg-surface-muted hover:border-primary/50 shadow-xs"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black font-mono transition-colors shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-slate-100 dark:bg-muted text-foreground border border-slate-300 dark:border-border"
                )}
              >
                {optionLetters[idx] || idx + 1}
              </div>
              <span className="text-sm sm:text-base leading-relaxed text-foreground font-semibold">{opt}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
