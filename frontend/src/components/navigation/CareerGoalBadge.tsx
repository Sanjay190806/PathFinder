import React from "react";
import Link from "next/link";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface CareerGoalBadgeProps {
  targetRole?: string;
  className?: string;
}

export function CareerGoalBadge({ targetRole, className }: CareerGoalBadgeProps) {
  if (!targetRole) {
    return (
      <Link
        href="/onboarding"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-700 bg-surface-raised/60 px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:border-slate-500 transition-colors",
          className
        )}
      >
        <Target className="h-3.5 w-3.5 text-primary-400" />
        <span>Set Career Goal</span>
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "hidden xl:inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-raised/80 px-2.5 py-1 text-xs text-slate-200 shadow-sm",
        className
      )}
      title={`Active Target Career: ${targetRole}`}
    >
      <Target className="h-3.5 w-3.5 text-accent-cyan shrink-0" />
      <span className="text-slate-400 font-normal">Goal:</span>
      <span className="font-semibold text-white tracking-tight max-w-[140px] truncate">
        {targetRole}
      </span>
    </div>
  );
}
