import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Play, Sparkles } from "lucide-react";
import { LearningPathItem } from "@/lib/types";
import { Card, Button, Badge } from "@/components/ui";
import { formatTimeHours } from "@/lib/utils";

interface CurrentPathProps {
  items: LearningPathItem[];
  onWhyClick: (item: LearningPathItem) => void;
}

export function CurrentPath({ items, onWhyClick }: CurrentPathProps) {
  const previewItems = items.slice(0, 4);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Your Adaptive Curriculum</h3>
          <p className="text-xs text-slate-400">Topologically ordered to strictly respect prerequisites</p>
        </div>
        <Link href="/roadmap" className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1">
          Full Roadmap ({items.length} Modules) <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {previewItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-surface-border bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-600 transition-colors"
          >
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-surface-raised px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-surface-border">
                  Phase {item.phase_number}: {item.phase_name}
                </span>
                {item.is_completed && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">{item.resource_title}</h4>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>{item.resource_provider}</span>
                <span>&bull;</span>
                <span>{formatTimeHours(item.estimated_hours)}</span>
                <span>&bull;</span>
                <span>{item.difficulty}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onWhyClick(item)}
                className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-surface-raised transition-colors"
                title="Why is this recommended?"
                aria-label="Why is this recommended?"
              >
                <Sparkles className="h-4 w-4 text-accent-cyan" />
              </button>
              <Link href={`/resources/${item.resource_id}`}>
                <Button size="sm" variant={item.is_completed ? "outline" : "secondary"}>
                  {item.is_completed ? "Review" : "Open"}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
