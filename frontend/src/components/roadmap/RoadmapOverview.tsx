import React from "react";
import { CheckCircle2, Clock, Route, Layers } from "lucide-react";
import { LearningPathItem } from "@/lib/types";
import { Card, ProgressRing } from "@/components/ui";

interface RoadmapOverviewProps {
  items: LearningPathItem[];
  phaseCount: number;
}

export function RoadmapOverview({ items, phaseCount }: RoadmapOverviewProps) {
  const completedCount = items.filter((it) => it.is_completed).length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalHours = items.reduce((acc, it) => acc + (it.estimated_hours || 0), 0);
  const completedHours = items
    .filter((it) => it.is_completed)
    .reduce((acc, it) => acc + (it.estimated_hours || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card variant="default" className="p-4 flex items-center gap-4">
        <ProgressRing progress={progressPct} size={52} strokeWidth={5} color="primary" />
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Curriculum Progress</span>
          <h4 className="text-base font-extrabold text-white">{progressPct}% Complete</h4>
          <span className="text-[11px] text-slate-400">{completedCount} of {totalCount} modules</span>
        </div>
      </Card>

      <Card variant="default" className="p-4 flex items-center gap-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised text-primary-400 border border-surface-border shrink-0">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Curriculum Structure</span>
          <h4 className="text-base font-extrabold text-white">{phaseCount} Dynamic Phases</h4>
          <span className="text-[11px] text-slate-400">0% prerequisite violations</span>
        </div>
      </Card>

      <Card variant="default" className="p-4 flex items-center gap-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised text-emerald-400 border border-surface-border shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated Effort</span>
          <h4 className="text-base font-extrabold text-white font-mono">{completedHours}h / {totalHours}h</h4>
          <span className="text-[11px] text-slate-400">{Math.max(0, totalHours - completedHours)}h remaining</span>
        </div>
      </Card>

      <Card variant="default" className="p-4 flex items-center gap-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised text-cyan-400 border border-surface-border shrink-0">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Next Unlock</span>
          <h4 className="text-sm font-bold text-white truncate">
            {items.find((it) => !it.is_completed)?.resource_title || "All Completed"}
          </h4>
          <span className="text-[11px] text-accent-cyan font-medium">Ready to start</span>
        </div>
      </Card>
    </div>
  );
}
