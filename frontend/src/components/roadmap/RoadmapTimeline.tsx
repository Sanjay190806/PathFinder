import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Lock, Play, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { LearningPathItem } from "@/lib/types";
import { Button, Card, Badge } from "@/components/ui";
import { formatTimeHours } from "@/lib/utils";

interface RoadmapTimelineProps {
  items: LearningPathItem[];
  filterPhase: number | "all";
  onWhyClick: (item: LearningPathItem) => void;
}

export function RoadmapTimeline({ items, filterPhase, onWhyClick }: RoadmapTimelineProps) {
  // Group items by phase number
  const phaseMap = new Map<number, { name: string; items: LearningPathItem[] }>();
  for (const it of items) {
    if (!phaseMap.has(it.phase_number)) {
      phaseMap.set(it.phase_number, { name: it.phase_name, items: [] });
    }
    phaseMap.get(it.phase_number)!.items.push(it);
  }

  const sortedPhases = Array.from(phaseMap.entries()).sort(([a], [b]) => a - b);
  const displayPhases = filterPhase === "all"
    ? sortedPhases
    : sortedPhases.filter(([num]) => num === filterPhase);

  return (
    <div className="space-y-8">
      {displayPhases.map(([phaseNum, phase]) => {
        const completedInPhase = phase.items.filter((it) => it.is_completed).length;
        const totalInPhase = phase.items.length;
        const isPhaseComplete = totalInPhase > 0 && completedInPhase === totalInPhase;

        return (
          <div key={phaseNum} className="space-y-4">
            {/* Phase Section Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-surface-raised/80 border border-surface-border">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-xs shadow-md">
                  {phaseNum}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Phase {phaseNum}: {phase.name}</h3>
                  <span className="text-xs text-slate-400">{completedInPhase} of {totalInPhase} modules completed</span>
                </div>
              </div>
              {isPhaseComplete && (
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="h-3 w-3" /> Phase Mastered
                </Badge>
              )}
            </div>

            {/* Modules List in Phase */}
            <div className="grid grid-cols-1 gap-3">
              {phase.items.map((item) => (
                <Card
                  key={item.id}
                  variant={item.is_completed ? "default" : item.is_locked ? "outline" : "interactive"}
                  className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-surface-border">
                        {item.resource_type || "Course"}
                      </span>
                      {item.is_completed ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </Badge>
                      ) : item.is_locked ? (
                        <Badge variant="warning" size="sm">
                          <Lock className="h-3 w-3" /> Prerequisite Incomplete
                        </Badge>
                      ) : (
                        <Badge variant="primary" size="sm">
                          Eligible
                        </Badge>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {item.resource_title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.resource_description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-primary-400" />
                        {formatTimeHours(item.estimated_hours)}
                      </span>
                      <span>&bull;</span>
                      <span>Provider: {item.resource_provider}</span>
                      <span>&bull;</span>
                      <span>Difficulty: {item.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onWhyClick(item)}
                      leftIcon={<Sparkles className="h-3.5 w-3.5 text-accent-cyan" />}
                    >
                      Why Recommended
                    </Button>

                    <Link href={`/resources/${item.resource_id}`}>
                      <Button
                        variant={item.is_completed ? "subtle" : "primary"}
                        size="sm"
                        leftIcon={item.is_completed ? undefined : <Play className="h-3.5 w-3.5 fill-current" />}
                      >
                        {item.is_completed ? "Review" : "Start"}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
