import React from "react";
import { CheckCircle2, BookOpen } from "lucide-react";
import { Card } from "@/components/ui";

interface LearningObjectivesProps {
  skills: string[];
}

export function LearningObjectives({ skills }: LearningObjectivesProps) {
  return (
    <Card variant="default" className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-raised text-primary-400 border border-surface-border">
          <BookOpen className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-white tracking-tight">What You&apos;ll Learn</h3>
      </div>

      <div className="space-y-2.5">
        {skills.map((s, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Master core principles, practical paradigms, and applications of <strong>{s}</strong>.</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
