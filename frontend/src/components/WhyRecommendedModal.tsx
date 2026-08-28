'use client';

import React from 'react';
import { X, Sparkles, CheckCircle2, Target, Clock, BarChart3, Layers, Compass } from 'lucide-react';
import { Explanation, LearningPathItem } from '@/lib/types';

interface WhyRecommendedModalProps {
  item: LearningPathItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WhyRecommendedModal({ item, isOpen, onClose }: WhyRecommendedModalProps) {
  if (!isOpen || !item) return null;

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
      "Matches your preferred hands-on format"
    ],
    human_readable_explanation: "Recommended because it directly targets your career goal and strengthens key competencies."
  };

  const signals = [
    { label: "Goal Relevance", weight: "30%", score: exp.goal_relevance_score, icon: Target, color: "text-accent-cyan" },
    { label: "Skill Gap Coverage", weight: "25%", score: exp.skill_gap_score, icon: Layers, color: "text-primary-400" },
    { label: "Prerequisite Readiness", weight: "15%", score: exp.prereq_score, icon: CheckCircle2, color: "text-accent-emerald" },
    { label: "Difficulty Alignment", weight: "10%", score: exp.difficulty_score, icon: BarChart3, color: "text-accent-purple" },
    { label: "Format Preference", weight: "8%", score: exp.pref_score, icon: Compass, color: "text-accent-amber" },
    { label: "Time/Pacing Fit", weight: "5%", score: exp.time_score, icon: Clock, color: "text-blue-400" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600/20 text-primary-400 border border-primary-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Why This Recommendation?</h3>
              <p className="text-xs text-gray-400">{item.resource_title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-raised hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* AI / Recommender Summary */}
          <div className="rounded-xl bg-primary-950/60 border border-primary-800/40 p-3.5">
            <p className="text-xs leading-relaxed text-primary-200 font-medium">
              {exp.human_readable_explanation}
            </p>
          </div>

          {/* Structured Key Factors */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Key Deciding Signals</h4>
            <div className="space-y-2">
              {exp.structured_reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-300 bg-surface-raised/60 p-2.5 rounded-lg border border-surface-border/60">
                  <CheckCircle2 className="h-4 w-4 text-accent-emerald shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Factor Mathematical Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Deterministic Scoring Breakdown</h4>
              <span className="text-xs font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-md border border-accent-cyan/30">
                Composite Score: {(exp.composite_score * 100).toFixed(0)}/100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {signals.map((sig, idx) => (
                <div key={idx} className="rounded-xl bg-surface-raised/40 border border-surface-border p-2.5">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <sig.icon className={`h-3 w-3 ${sig.color}`} />
                      {sig.label}
                    </span>
                    <span className="text-gray-500 text-[10px] font-mono">{sig.weight}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-surface-border overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(10, sig.score * 100))}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-white font-mono">
                      {(sig.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-surface-border flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-surface-raised px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-surface-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
