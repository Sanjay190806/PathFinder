import React from "react";
import Link from "next/link";
import { Play, Sparkles, Clock, Lock, CheckCircle2, BookOpen } from "lucide-react";
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
      <Card variant="glass" className="p-8 sm:p-10 text-center flex flex-col items-center justify-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-success/20 text-success mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">You've completed your roadmap!</h3>
        <p className="text-muted-foreground max-w-lg mb-8">
          Take a diagnostic assessment to verify your skill mastery, or set a new career destination to continue your journey.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/assessment">
            <Button size="lg" variant="primary">Take Assessment</Button>
          </Link>
          <Link href="/roadmap">
            <Button variant="secondary" size="lg">Review Journey</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const isLocked = item.is_locked;

  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-surface to-surface-muted shadow-md">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      
      <div className="p-6 sm:p-8 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant={isLocked ? "warning" : "primary"} className="uppercase tracking-wider">
              {isLocked ? "Prerequisite in Progress" : "Your Next Step"}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Phase {item.phase_number}: {item.phase_name}
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
              {item.resource_title}
            </h2>
            <p className="text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed line-clamp-2">
              {item.resource_description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5 text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              {formatTimeHours(item.estimated_hours)}
            </div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-1.5">
              <span>{item.resource_provider}</span>
            </div>
            <div className="h-4 w-[1px] bg-border" />
            <Badge variant="outline" className="text-xs bg-background">
              {item.difficulty}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
          {isLocked ? (
            <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm font-medium text-warning">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Complete prerequisites</span>
            </div>
          ) : (
            <Link href={`/resources/${item.resource_id}`} className="w-full">
              <Button size="lg" className="w-full" leftIcon={<Play className="h-4 w-4 fill-current" />}>
                Start Learning
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={() => onWhyClick(item)}
            className="w-full bg-background"
            leftIcon={<Sparkles className="h-4 w-4 text-primary" />}
          >
            Why this?
          </Button>
        </div>
      </div>
    </Card>
  );
}
