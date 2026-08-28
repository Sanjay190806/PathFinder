import React from "react";
import { CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";

interface ResourceCompletionCardProps {
  isCompleted: boolean;
  isCompleting: boolean;
  onToggleComplete: () => void;
}

export function ResourceCompletionCard({
  isCompleted,
  isCompleting,
  onToggleComplete
}: ResourceCompletionCardProps) {
  return (
    <Card variant={isCompleted ? "default" : "highlight"} className="p-6 space-y-4">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Authoritative Progress Recording
        </span>
        <h3 className="text-base font-bold text-white tracking-tight">
          {isCompleted ? "Module Completed" : "Ready to complete this step?"}
        </h3>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {isCompleted
            ? "Your completion has been validated and persisted. Your skill telemetry and subsequent roadmap items are synchronized."
            : "After finishing the coursework on the external platform, record completion here to update your skill profile."}
        </p>
      </div>

      <div className="pt-2">
        <Button
          variant={isCompleted ? "outline" : "primary"}
          size="lg"
          className="w-full shadow-md"
          onClick={onToggleComplete}
          isLoading={isCompleting}
          leftIcon={isCompleted ? <RotateCcw className="h-4 w-4 text-slate-400" /> : <CheckCircle2 className="h-4 w-4" />}
        >
          {isCompleted ? "Marked as Completed (Click to Reset)" : "Mark Resource as Completed"}
        </Button>
      </div>
    </Card>
  );
}
