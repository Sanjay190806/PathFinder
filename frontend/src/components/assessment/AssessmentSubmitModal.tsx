import React from "react";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Modal, Button, Badge } from "@/components/ui";

interface AssessmentSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  totalQuestions: number;
  answeredCount: number;
  isSubmitting: boolean;
}

export function AssessmentSubmitModal({
  isOpen,
  onClose,
  onConfirmSubmit,
  totalQuestions,
  answeredCount,
  isSubmitting
}: AssessmentSubmitModalProps) {
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Skill Calibration?"
      description="Your responses will calibrate your skill confidence and adapt your learning roadmap."
      maxWidth="md"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-surface-border bg-surface-raised/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Answered Questions:</span>
            <span className="font-bold text-white">{answeredCount} of {totalQuestions}</span>
          </div>
          {unansweredCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-300 pt-1">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>You have {unansweredCount} unanswered question{unansweredCount > 1 ? "s" : ""}. Unanswered questions will be scored as unmastered.</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            Continue Reviewing
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onConfirmSubmit}
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Submit Calibration
          </Button>
        </div>
      </div>
    </Modal>
  );
}
