import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepInfo {
  number: number;
  label: string;
  shortLabel: string;
}

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: StepInfo[];
  onStepClick?: (step: number) => void;
  className?: string;
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
  className
}: OnboardingProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
        {steps.map((s) => {
          const isCompleted = s.number < currentStep;
          const isCurrent = s.number === currentStep;

          return (
            <div
              key={s.number}
              className="flex flex-col items-center relative z-10"
              onClick={() => isCompleted && onStepClick && onStepClick(s.number)}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 border-2",
                  isCompleted
                    ? "bg-success border-success text-success-foreground cursor-pointer"
                    : isCurrent
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25 ring-4 ring-primary/20"
                    : "bg-surface-muted border-border text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : s.number}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium mt-1.5 whitespace-nowrap transition-colors",
                  isCurrent ? "text-foreground font-bold" : isCompleted ? "text-foreground/80" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="flex md:hidden items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary">Step {currentStep} of {totalSteps}</span>
          <span className="text-xs font-semibold text-foreground truncate max-w-[180px]">
            &bull; {steps.find((s) => s.number === currentStep)?.label}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 w-5 rounded-full transition-all",
                s <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
