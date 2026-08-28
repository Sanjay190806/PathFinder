import React from "react";
import Link from "next/link";
import { ArrowRight, Route, Sparkles } from "lucide-react";
import { Card, Button } from "@/components/ui";

interface AnalyticsNextActionProps {
  activePhase: string;
}

export function AnalyticsNextAction({ activePhase }: AnalyticsNextActionProps) {
  return (
    <Card variant="highlight" className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent-cyan flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" /> Recommended Next Action
        </span>
        <h3 className="text-base font-bold text-white tracking-tight">
          Continue with {activePhase}
        </h3>
        <p className="text-xs text-slate-300">
          Your next sequenced modules are ready in your learning roadmap.
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-3">
        <Link href="/roadmap">
          <Button size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Open Learning Roadmap
          </Button>
        </Link>
      </div>
    </Card>
  );
}
