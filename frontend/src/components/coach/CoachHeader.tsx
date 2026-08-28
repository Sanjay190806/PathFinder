import React from "react";
import { Bot, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui";

interface CoachHeaderProps {
  targetRole?: string;
  onClose: () => void;
}

export function CoachHeader({ targetRole, onClose }: CoachHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-surface-border px-5 py-4 bg-surface-raised/40">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-accent-purple text-white shadow-md shadow-primary-500/20">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">AI Career Coach</h3>
            {targetRole && (
              <Badge variant="cyan" size="sm">
                {targetRole}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Grounded in Your Live Roadmap</span>
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        aria-label="Close AI Coach"
        className="rounded-xl p-1.5 text-slate-400 hover:bg-surface-raised hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
