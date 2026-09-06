import React from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { AnalyticsSummary } from "@/lib/types";
import { Card, ProgressBar } from "@/components/ui";

interface SkillSnapshotProps {
  analytics: AnalyticsSummary | null;
}

export function SkillSnapshot({ analytics }: SkillSnapshotProps) {
  const mastery = analytics?.skill_mastery || [];
  const strengths = analytics?.strengths || [];
  const weaknesses = analytics?.weaknesses || [];

  return (
    <Card className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Skill Confidence
        </h3>
        <Link href="/analytics" className="text-xs font-semibold text-primary hover:underline">
          View All
        </Link>
      </div>

      {mastery.length > 0 ? (
        <div className="space-y-4 flex-1">
          {mastery.slice(0, 4).map((m, idx) => (
            <ProgressBar 
              key={idx}
              progress={m.confidence * 100} 
              size="sm" 
              color="primary" 
              label={m.skill}
              valueLabel={`${Math.round(m.confidence * 100)}%`}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center bg-surface-muted p-4 rounded-lg">
            Complete courses & assessments to calibrate skill confidence.
          </p>
        </div>
      )}

      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="pt-4 border-t border-border space-y-3 text-sm mt-auto">
          {strengths.length > 0 && (
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-success/10 border border-success/20">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success shrink-0" /> <span className="font-medium text-foreground">Strengths</span>
              </span>
              <span className="font-semibold text-success truncate max-w-[160px]">
                {strengths.slice(0, 2).join(", ")}
              </span>
            </div>
          )}
          {weaknesses.length > 0 && (
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-warning/10 border border-warning/20">
              <span className="text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" /> <span className="font-medium text-foreground">Gaps</span>
              </span>
              <span className="font-semibold text-warning truncate max-w-[160px]">
                {weaknesses.slice(0, 2).join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
