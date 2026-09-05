'use client';

import React from "react";
import { Zap, TrendingUp, ShieldAlert, Briefcase, CheckCircle, AlertOctagon } from "lucide-react";
import { SkillAnalytics, CareerReadinessAnalytics } from "@/lib/types";
import { Card } from "@/components/ui";

interface SkillAndReadinessAnalyticsProps {
  skillData: SkillAnalytics | null;
  readinessData: CareerReadinessAnalytics | null;
}

export function SkillAndReadinessAnalytics({ skillData, readinessData }: SkillAndReadinessAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Skill Mastery Intelligence Card */}
      <Card variant="default" className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Zap className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Skill Mastery & Decay Intelligence</h3>
          </div>
          <span className="text-xs text-slate-400">Bayesian Synthesized</span>
        </div>

        {!skillData || !skillData.has_data ? (
          <div className="p-6 text-center text-slate-400 bg-surface-raised/40 rounded-xl border border-surface-border">
            <p className="text-sm font-medium">Mastery data will appear after assessed learning activity.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Strengths & Weaknesses Pills */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-emerald-950/40 rounded-lg border border-emerald-800/30">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Key Strengths</span>
                <div className="flex flex-wrap gap-1">
                  {skillData.strengths.length > 0 ? (
                    skillData.strengths.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 rounded text-[11px] font-medium">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-[11px]">Assessing...</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-amber-950/40 rounded-lg border border-amber-800/30">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Growth Gaps</span>
                <div className="flex flex-wrap gap-1">
                  {skillData.weaknesses.length > 0 ? (
                    skillData.weaknesses.map((w) => (
                      <span key={w} className="px-2 py-0.5 bg-amber-900/60 text-amber-300 rounded text-[11px] font-medium">
                        {w}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-[11px]">No critical gaps</span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Skills List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {skillData.skills.slice(0, 6).map((sk) => {
                const masteryPct = Math.round(sk.current_mastery * 100);
                return (
                  <div
                    key={sk.skill_id}
                    className="p-3 bg-surface-raised/50 rounded-xl border border-surface-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{sk.skill_name}</span>
                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-surface-border/50 rounded">
                          {sk.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                            sk.decay_risk === "HIGH"
                              ? "bg-red-950/80 text-red-400 border border-red-800/40"
                              : sk.decay_risk === "MODERATE"
                              ? "bg-amber-950/80 text-amber-400 border border-amber-800/40"
                              : "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                          }`}
                        >
                          Decay: {sk.decay_risk}
                        </span>
                        <span className="font-mono font-bold text-white">{masteryPct}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, masteryPct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Evidence items: <strong className="text-white font-mono">{sk.assessment_evidence_count}</strong></span>
                      <span>Confidence: <strong className="text-white font-mono">{Math.round(sk.confidence * 100)}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Career Readiness Intelligence Card */}
      <Card variant="default" className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Briefcase className="h-5 w-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-white">Career Readiness Analytics</h3>
              <p className="text-xs text-slate-400">
                Target Role: <span className="text-white font-semibold">{readinessData?.target_role || "Career Track"}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/40">
            {readinessData?.readiness_level || "Developing"}
          </span>
        </div>

        {!readinessData ? (
          <div className="p-6 text-center text-slate-400 bg-surface-raised/40 rounded-xl border border-surface-border">
            <p className="text-sm font-medium">Readiness index calculating...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Gauge Banner */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-300 uppercase font-bold tracking-wider">Overall Employability Readiness</span>
                <h4 className="text-xl font-black text-white font-mono">{readinessData.overall_readiness_score}%</h4>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Unblocked: <strong>{readinessData.unblocked_skills_count}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <AlertOctagon className="h-4 w-4" />
                  <span>Blockers: <strong>{readinessData.critical_blockers_count}</strong></span>
                </div>
              </div>
            </div>

            {/* Readiness Pillars Breakdown */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-surface-raised/60 border border-surface-border space-y-1">
                <span className="text-slate-400 text-[11px]">Technical Competency</span>
                <p className="font-mono text-base font-bold text-white">{readinessData.technical_readiness}%</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-raised/60 border border-surface-border space-y-1">
                <span className="text-slate-400 text-[11px]">Practical Readiness</span>
                <p className="font-mono text-base font-bold text-white">{readinessData.practical_readiness}%</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-raised/60 border border-surface-border space-y-1">
                <span className="text-slate-400 text-[11px]">Project / Portfolio</span>
                <p className="font-mono text-base font-bold text-white">{readinessData.project_readiness}%</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-raised/60 border border-surface-border space-y-1">
                <span className="text-slate-400 text-[11px]">Interview Readiness</span>
                <p className="font-mono text-base font-bold text-white">{readinessData.interview_readiness}%</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
