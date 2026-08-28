import React from "react";
import Link from "next/link";
import { Target, Clock, RefreshCw, Sparkles, Layers } from "lucide-react";
import { Profile, LearningPathVersion } from "@/lib/types";
import { Badge, Button } from "@/components/ui";

interface DashboardHeaderProps {
  profile: Profile | null;
  activeVersion?: LearningPathVersion;
  onResetDemo?: () => void;
  onOpenAssistant: () => void;
}

export function DashboardHeader({
  profile,
  activeVersion,
  onResetDemo,
  onOpenAssistant
}: DashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const name = profile?.full_name?.split(" ")[0] || "Learner";
  const targetRole = profile?.primary_goal?.target_role;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-surface-border">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-400">{getGreeting()}, {name}</span>
          {activeVersion && (
            <Badge variant="primary" size="sm">
              Version {activeVersion.version_number}.0
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {targetRole ? `Goal: ${targetRole}` : "Your Career Workspace"}
        </h1>
        {targetRole && profile?.weekly_hours && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary-400" />
            <span>Pace: {profile.weekly_hours} hours / week</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {profile?.user_id && onResetDemo && (
          <Button
            variant="subtle"
            size="sm"
            onClick={onResetDemo}
            leftIcon={<RefreshCw className="h-3.5 w-3.5 text-amber-400" />}
          >
            Reset Demo
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAssistant}
          leftIcon={<Sparkles className="h-3.5 w-3.5 text-accent-cyan" />}
        >
          AI Career Coach
        </Button>
      </div>
    </div>
  );
}
