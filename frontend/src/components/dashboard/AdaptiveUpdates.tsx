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
      <Card className="p-6 space-y-3 bg-surface-muted/50 border-dashed">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Adaptive Engine</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          As you provide feedback or complete milestones, your roadmap will automatically adapt and version itself here.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-primary/30 space-y-4 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="h-24 w-24 text-primary" />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <RefreshCw className="h-5 w-5 animate-[spin_4s_linear_infinite]" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-primary tracking-wider">Adapted</span>
            <h4 className="text-base font-bold text-foreground leading-tight">Version {activeVersion.version_number}.0</h4>
          </div>
        </div>
        <Badge variant="cyan" size="sm" className="hidden sm:inline-flex bg-info/20 text-info border-info/30 hover:bg-info/30">{activeVersion.trigger}</Badge>
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed relative z-10">
        {activeVersion.change_summary || "Curriculum updated to reflect your latest progress and feedback."}
      </p>

      <div className="pt-3 border-t border-border/50 flex justify-end relative z-10 mt-2">
        <Link href="/roadmap" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group">
          Inspect Changes <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </Card>
  );
}
