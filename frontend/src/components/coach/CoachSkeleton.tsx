import React from "react";
import { Sparkles } from "lucide-react";

export function CoachSkeleton() {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400 bg-surface-raised p-3 rounded-2xl rounded-bl-none border border-surface-border w-fit animate-pulse">
      <Sparkles className="h-3.5 w-3.5 animate-spin text-primary-400" />
      <span>AI Coach is analyzing grounded curriculum context...</span>
    </div>
  );
}
