import React from "react";
import { Clock, RefreshCw, Sparkles, Target } from "lucide-react";
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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 mb-8 border-b border-border/50">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">{getGreeting()}, {name}</span>
          {activeVersion && (
            <Badge variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
              Roadmap v{activeVersion.version_number}.0
            </Badge>
          )}
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {targetRole ? (
            <div className="flex items-center gap-3">
              <span>Goal:</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                {targetRole}
              </span>
            </div>
          ) : (
            "Your Career Workspace"
          )}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
          {targetRole && profile?.weekly_hours && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-muted border border-border/50">
              <Clock className="h-4 w-4 text-primary" />
              <span>{profile.weekly_hours}h / week pace</span>
            </div>
          )}

          {/* Stream / Specialization Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-muted border border-border/50">
            <Target className="h-4 w-4 text-accent" />
            <span className="text-foreground">{profile?.specialization || profile?.field_of_study || "Engineering"}</span>
            <span className="text-muted-foreground/40">•</span>
            <span>{profile?.qualification || "Undergraduate"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        {profile?.user_id && onResetDemo && (
          <Button
            variant="outline"
            size="md"
            onClick={onResetDemo}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Reset Demo
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          onClick={onOpenAssistant}
          leftIcon={<Sparkles className="h-4 w-4" />}
          className="w-full sm:w-auto shadow-md shadow-primary/20"
        >
          AI Coach
        </Button>
      </div>
    </div>
  );
}
