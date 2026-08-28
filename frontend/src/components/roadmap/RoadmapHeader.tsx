import React from "react";
import { Route, Sparkles, RefreshCw, Layers } from "lucide-react";
import { Profile, LearningPathVersion } from "@/lib/types";
import { Badge, Button } from "@/components/ui";

interface RoadmapHeaderProps {
  profile: Profile | null;
  activeVersion?: LearningPathVersion;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onOpenAssistant: () => void;
}

export function RoadmapHeader({
  profile,
  activeVersion,
  isRegenerating,
  onRegenerate,
  onOpenAssistant
}: RoadmapHeaderProps) {
  const targetRole = profile?.primary_goal?.target_role;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-border">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="cyan" size="sm">
            <Route className="h-3 w-3" /> Sequenced Curriculum
          </Badge>
          {activeVersion && (
            <Badge variant="primary" size="sm">
              Version {activeVersion.version_number}.0
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {targetRole ? `${targetRole} Roadmap` : "Your Learning Roadmap"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {targetRole
            ? `Your personalized path toward ${targetRole}, topologically sequenced to respect prerequisites.`
            : "Topologically ordered curriculum based on your calibrated skill baseline."}
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          isLoading={isRegenerating}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Recalibrate
        </Button>
        <Button
          variant="secondary"
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
