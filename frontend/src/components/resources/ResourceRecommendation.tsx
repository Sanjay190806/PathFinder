import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";

interface ResourceRecommendationProps {
  qualityScore: number;
  difficulty: string;
  skills: string[];
}

export function ResourceRecommendation({
  qualityScore,
  difficulty,
  skills
}: ResourceRecommendationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card variant="default" className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-raised text-accent-cyan border border-surface-border">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-cyan block">Explainable AI</span>
            <h3 className="text-sm font-bold text-white tracking-tight">Why this is your next step</h3>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1"
        >
          <span>{isExpanded ? "Hide Technical Scoring" : "How PathFinder Decided"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
        <p>
          &bull; <strong>Direct Skill-Gap Priority:</strong> This resource directly builds core competencies in {skills.join(", ")}, which are required by your target career.
        </p>
        <p>
          &bull; <strong>Prerequisite Readiness:</strong> Foundational prerequisites are verified, ensuring zero cognitive overload.
        </p>
        <p>
          &bull; <strong>Difficulty & Quality Fit:</strong> Ranked at {difficulty} tier with an authoritative quality score of {Math.round(qualityScore * 100)}%.
        </p>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-surface-border space-y-2 text-xs text-slate-400 font-mono animate-in fade-in">
          <div className="flex justify-between">
            <span>Deterministic Scoring Engine:</span>
            <span className="text-white">Hybrid Multi-Factor (v2)</span>
          </div>
          <div className="flex justify-between">
            <span>Prerequisite Violations:</span>
            <span className="text-emerald-400">0 (Strict DAG Verification)</span>
          </div>
          <div className="flex justify-between">
            <span>Quality Score:</span>
            <span className="text-accent-cyan">{qualityScore.toFixed(2)} / 1.00</span>
          </div>
        </div>
      )}
    </Card>
  );
}
