import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui";

interface AssessmentControlsProps {
  currentIndex: number;
  totalQuestions: number;
  hasAnsweredCurrent: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmitPrompt: () => void;
  isSubmitting: boolean;
}

export function AssessmentControls({
  currentIndex,
  totalQuestions,
  hasAnsweredCurrent,
  onPrevious,
  onNext,
  onSubmitPrompt,
  isSubmitting
}: AssessmentControlsProps) {
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-surface-border">
      <Button
        variant="outline"
        size="md"
        onClick={onPrevious}
        disabled={currentIndex === 0 || isSubmitting}
        leftIcon={<ArrowLeft className="h-4 w-4" />}
      >
        Previous
      </Button>

      {isLastQuestion ? (
        <Button
          variant="primary"
          size="md"
          onClick={onSubmitPrompt}
          isLoading={isSubmitting}
          leftIcon={<CheckCircle2 className="h-4 w-4" />}
        >
          Review & Submit
        </Button>
      ) : (
        <Button
          variant="primary"
          size="md"
          onClick={onNext}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Next Question
        </Button>
      )}
    </div>
  );
}
