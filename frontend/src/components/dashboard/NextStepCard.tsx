import React from "react";
import Link from "next/link";
import { Play, Sparkles, Clock, Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { LearningPathItem } from "@/lib/types";
import { Button, Card, Badge } from "@/components/ui";
import { formatTimeHours } from "@/lib/utils";

interface NextStepCardProps {
  item: LearningPathItem | null;
  onWhyClick: (item: LearningPathItem) => void;
}

export function NextStepCard({ item, onWhyClick }: NextStepCardProps) {
  if (!item) {
    return (
      <Card variant="highlight" className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
          <CheckCircle2 className="h-5 w-5" /> Path Completed
        </div>
        <h3 className="text-xl font-bold text-white">You have completed all milestones in this roadmap!</h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
          Take a diagnostic assessment to verify your skill mastery or calibrate a new career destination in your profile.
        </p>
        <div className="mt-5 flex gap-3">
          <Link href="/assessment">
            <Button size="md">Take Skill Calibration</Button>
          </Link>
          <Link href="/roadmap">
            <Button variant="outline" size="md">Inspect Roadmap</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const isLocked = item.is_locked;

  return (
    <Card variant="highlight" className="relative overflow-hidden p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" size="md">
              {isLocked ? "Prerequisite in Progress" : "Your Next Step"}
            </Badge>
            <span className="text-xs font-semibold text-slate-300">
              Phase {item.phase_number}: {item.phase_name}
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
              {item.resource_title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
              {item.resource_description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1 font-semibold text-white">
              <Clock className="h-3.5 w-3.5 text-primary-400" />
              {formatTimeHours(item.estimated_hours)}
            </span>
            <span>&bull;</span>
            <span>Provider: {item.resource_provider}</span>
            <span>&bull;</span>
            <span>Difficulty: {item.difficulty}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 shrink-0">
          {isLocked ? (
            <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-3 text-xs text-amber-200 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Complete foundational prerequisites first</span>
            </div>
          ) : (
            <Link href={`/resources/${item.resource_id}`} className="w-full">
              <Button size="lg" className="w-full shadow-md" leftIcon={<Play className="h-4 w-4 fill-current" />}>
                Start Learning
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="md"
            onClick={() => onWhyClick(item)}
            className="w-full"
            leftIcon={<Sparkles className="h-3.5 w-3.5 text-accent-cyan" />}
          >
            Why this is your next step
          </Button>
        </div>
      </div>
    </Card>
  );
}
