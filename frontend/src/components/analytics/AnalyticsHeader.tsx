import React from "react";
import { TrendingUp, Target, Sparkles } from "lucide-react";
import { Profile } from "@/lib/types";
import { Badge, Button } from "@/components/ui";

interface AnalyticsHeaderProps {
  profile: Profile | null;
  onOpenAssistant: () => void;
}

export function AnalyticsHeader({ profile, onOpenAssistant }: AnalyticsHeaderProps) {
  const targetRole = profile?.primary_goal?.target_role;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="cyan" size="sm">
            <TrendingUp className="h-3 w-3" /> Growth Intelligence
          </Badge>
          {targetRole ? (
            <Badge variant="neutral" size="sm">
              <Target className="h-3 w-3" /> {targetRole}
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              Career Workspace
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Competency Growth & Mastery
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Quantitative telemetry evaluating your curriculum progression, verified skill confidence, and pace.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenAssistant}
          leftIcon={<Sparkles className="h-3.5 w-3.5 text-primary" />}
        >
          AI Career Coach
        </Button>
      </div>
    </div>
  );
}
