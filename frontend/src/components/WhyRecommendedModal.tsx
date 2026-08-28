'use client';

import React from "react";
import { Sparkles, CheckCircle2, Target, Clock, BarChart3, Layers, Compass } from "lucide-react";
import { Explanation, LearningPathItem } from "@/lib/types";
import { Modal, Badge, ProgressBar } from "@/components/ui";

interface WhyRecommendedModalProps {
  item: LearningPathItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WhyRecommendedModal({ item, isOpen, onClose }: WhyRecommendedModalProps) {
  if (!item) return null;

  const exp: Explanation = item.explanation || {
    goal_relevance_score: 0.90,
    skill_gap_score: 0.85,
    prereq_score: 0.80,
    difficulty_score: 0.75,
    pref_score: 0.90,
    time_score: 0.80,
    engagement_score: 0.50,
    diversity_score: 1.0,
    composite_score: 0.84,
    structured_reasons: [
      "Directly targets your primary career goal",
      "Closes critical foundational skill gaps",
      "Matches your calibrated learning pace"
    ],
    human_readable_explanation: "Recommended because it directly targets your chosen career competencies and strengthens essential prerequisites."
  };

  const signals = [
    { label: "Goal Relevance", weight: "30%", score: exp.goal_relevance_score, icon: Target, color: "text-accent-cyan" },
    { label: "Skill Gap Coverage", weight: "25%", score: exp.skill_gap_score, icon: Layers, color: "text-primary-400" },
    { label: "Prerequisite Readiness", weight: "15%", score: exp.prereq_score, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Difficulty Alignment", weight: "10%", score: exp.difficulty_score, icon: BarChart3, color: "text-accent-purple" },
    { label: "Format Preference", weight: "8%", score: exp.pref_score, icon: Compass, color: "text-amber-400" },
    { label: "Time/Pacing Fit", weight: "5%", score: exp.time_score, icon: Clock, color: "text-blue-400" }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Why This Recommendation?"
      description={item.resource_title}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Human-First Summary */}
        <div className="rounded-2xl bg-primary-950/60 border border-primary-800/40 p-4">
          <p className="text-xs leading-relaxed text-primary-200 font-medium">
            {exp.human_readable_explanation}
          </p>
        </div>

        {/* Structured Key Deciding Reasons */}
        {exp.structured_reasons && exp.structured_reasons.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Deciding Factors
            </h4>
            <div className="space-y-2">
              {exp.structured_reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-200 bg-surface-raised/60 p-3 rounded-xl border border-surface-border"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Signal Mathematical Scoring Breakdown */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Deterministic Scoring Signals
            </h4>
            <Badge variant="cyan" size="sm">
              Composite Score: {Math.round(exp.composite_score * 100)}/100
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {signals.map((sig, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-surface-raised/40 border border-surface-border p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <sig.icon className={`h-3.5 w-3.5 ${sig.color}`} />
                    {sig.label}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">{sig.weight}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <ProgressBar
                      progress={Math.round(sig.score * 100)}
                      size="sm"
                      color="primary"
                    />
                  </div>
                  <span className="text-xs font-bold text-white font-mono shrink-0">
                    {Math.round(sig.score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
