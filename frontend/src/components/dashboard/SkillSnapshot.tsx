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
    <Card variant="default" className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary-400" />
          Skill Confidence Matrix
        </h3>
        <Link href="/analytics" className="text-xs font-semibold text-primary-400 hover:underline">
          View All
        </Link>
      </div>

      {mastery.length > 0 ? (
        <div className="space-y-3">
          {mastery.slice(0, 4).map((m, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">{m.skill}</span>
                <span className="font-mono text-slate-400">{Math.round(m.confidence * 100)}%</span>
              </div>
              <ProgressBar progress={m.confidence * 100} size="sm" color="primary" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 py-3 text-center">
          Complete courses & assessments to calibrate skill confidence.
        </p>
      )}

      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="pt-3 border-t border-surface-border space-y-2 text-xs">
          {strengths.length > 0 && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" /> Strengths:
              </span>
              <span className="font-semibold text-emerald-300 text-right truncate max-w-[160px]">
                {strengths.slice(0, 2).join(", ")}
              </span>
            </div>
          )}
          {weaknesses.length > 0 && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" /> Priority Gaps:
              </span>
              <span className="font-semibold text-amber-300 text-right truncate max-w-[160px]">
                {weaknesses.slice(0, 2).join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
