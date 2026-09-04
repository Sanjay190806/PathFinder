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
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
          {targetRole && profile?.weekly_hours && (
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary-400" />
              <span>Pace: {profile.weekly_hours}h/week</span>
            </p>
          )}

          {/* 🇮🇳 JanSahay / SIH26101 Indian Education Stream Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-950/70 border border-primary-500/30 text-primary-300 font-medium">
            <span>🇮🇳</span>
            <span>
              {profile?.specialization || profile?.field_of_study || profile?.education_stream || "Computer Science & Engineering"}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">
              {profile?.qualification || profile?.education_level || "Undergraduate"}
            </span>
            {profile?.current_role && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-accent-cyan font-semibold">{profile.current_role}</span>
              </>
            )}
          </div>
        </div>
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
