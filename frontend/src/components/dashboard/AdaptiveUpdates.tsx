import React from "react";
import Link from "next/link";
import { RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import { LearningPathVersion } from "@/lib/types";
import { Card, Badge } from "@/components/ui";

interface AdaptiveUpdatesProps {
  activeVersion?: LearningPathVersion;
}

export function AdaptiveUpdates({ activeVersion }: AdaptiveUpdatesProps) {
  if (!activeVersion || activeVersion.version_number <= 1) {
    return (
      <Card variant="default" className="p-5 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-raised text-primary-400 border border-surface-border">
            <RefreshCw className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-bold text-white">Adaptive Learning Engine</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          As you submit course feedback (e.g. &apos;Too Fast&apos;, &apos;Too Difficult&apos;) or complete milestones, your roadmap automatically adapts and creates version history.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="default" className="p-5 border-primary-500/40 space-y-3 bg-gradient-to-br from-primary-950/30 via-surface to-surface">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600/20 text-primary-400 border border-primary-500/30">
            <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-accent-cyan">Active Adaptation</span>
            <h4 className="text-sm font-bold text-white">Version {activeVersion.version_number}.0</h4>
          </div>
        </div>
        <Badge variant="cyan" size="sm">{activeVersion.trigger}</Badge>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {activeVersion.change_summary || "Curriculum updated to reflect your latest progress and feedback."}
      </p>

      <div className="pt-2 border-t border-surface-border flex justify-end">
        <Link href="/roadmap" className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1">
          Inspect Version Diff <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}
