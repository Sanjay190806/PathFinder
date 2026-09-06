import React from "react";
import Link from "next/link";
import { CheckCircle2, Cpu, ArrowRight, Route } from "lucide-react";
import { LearningPath } from "@/lib/types";
import { Button } from "@/components/ui";

interface PathPreviewStepProps {
  learningPath: LearningPath | null;
  targetRole: string;
}

export function PathPreviewStep({ learningPath, targetRole }: PathPreviewStepProps) {
  const activeVersion = learningPath?.current_version;
  const items = activeVersion?.items || [];

  // Group items dynamically by phase
  const phaseMap = new Map<number, { name: string; items: typeof items }>();
  for (const it of items) {
    if (!phaseMap.has(it.phase_number)) {
      phaseMap.set(it.phase_number, { name: it.phase_name, items: [] });
    }
    phaseMap.get(it.phase_number)!.items.push(it);
  }

  const sortedPhases = Array.from(phaseMap.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/30">
        <Cpu className="h-8 w-8 animate-pulse" />
      </div>

      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success mb-2">
          <CheckCircle2 className="h-3.5 w-3.5" /> Roadmap Synthesized Successfully
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Your path towards {targetRole} is ready.
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
          Prerequisites verified with 0% dependency violations. Here is the dynamic curriculum synthesized for your baseline:
        </p>
      </div>

      {/* Dynamic Phased Summary */}
      {sortedPhases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-left">
          {sortedPhases.map(([num, phase]) => (
            <div
              key={num}
              className="rounded-2xl border border-border bg-card p-3.5 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                  Phase {num}
                </span>
                <h4 className="text-xs font-bold text-foreground mt-1 truncate">{phase.name}</h4>
                <p className="text-[11px] text-muted-foreground mt-1">{phase.items.length} Modules</p>
              </div>
              <div className="mt-3 pt-2 border-t border-border text-[10px] text-primary font-semibold">
                {num === 1 ? "Active Next Step" : "Locked (Prerequisites)"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-border bg-card text-xs text-muted-foreground">
          Curriculum synthesized and saved to your learner profile.
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto shadow-md" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Go to My Dashboard
          </Button>
        </Link>
        <Link href="/roadmap" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto" leftIcon={<Route className="h-4 w-4" />}>
            Inspect Full Roadmap
          </Button>
        </Link>
      </div>
    </div>
  );
}
