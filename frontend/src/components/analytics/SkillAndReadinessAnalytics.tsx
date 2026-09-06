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
            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-bold text-foreground">Skill Mastery & Decay Intelligence</h3>
          </div>
          <span className="text-xs text-muted-foreground">Bayesian Synthesized</span>
        </div>

        {!skillData || !skillData.has_data ? (
          <div className="p-6 text-center text-muted-foreground bg-muted/50 rounded-xl border border-border">
            <p className="text-sm font-medium">Mastery data will appear after assessed learning activity.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Strengths & Weaknesses Pills */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1">Key Strengths</span>
                <div className="flex flex-wrap gap-1">
                  {skillData.strengths.length > 0 ? (
                    skillData.strengths.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 rounded text-[11px] font-medium">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-[11px]">Assessing...</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-1">Growth Gaps</span>
                <div className="flex flex-wrap gap-1">
                  {skillData.weaknesses.length > 0 ? (
                    skillData.weaknesses.map((w) => (
                      <span key={w} className="px-2 py-0.5 bg-amber-500/20 text-amber-900 dark:text-amber-200 rounded text-[11px] font-medium">
                        {w}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-[11px]">No critical gaps</span>
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
                    className="p-3 bg-muted/50 rounded-xl border border-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{sk.skill_name}</span>
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted rounded border border-border">
                          {sk.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                            sk.decay_risk === "HIGH"
                              ? "bg-red-500/10 text-red-800 dark:text-red-300 border border-red-500/30"
                              : sk.decay_risk === "MODERATE"
                              ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          Decay: {sk.decay_risk}
                        </span>
                        <span className="font-mono font-bold text-foreground">{masteryPct}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, masteryPct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Evidence items: <strong className="text-foreground font-mono">{sk.assessment_evidence_count}</strong></span>
                      <span>Confidence: <strong className="text-foreground font-mono">{Math.round(sk.confidence * 100)}%</strong></span>
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
            <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-foreground">Career Readiness Analytics</h3>
              <p className="text-xs text-muted-foreground">
                Target Role: <span className="text-foreground font-semibold">{readinessData?.target_role || "Career Track"}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-500/30">
            {readinessData?.readiness_level || "Developing"}
          </span>
        </div>

        {!readinessData ? (
          <div className="p-6 text-center text-muted-foreground bg-muted/50 rounded-xl border border-border">
            <p className="text-sm font-medium">Readiness index calculating...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Gauge Banner */}
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-800 dark:text-purple-300 uppercase font-bold tracking-wider">Overall Employability Readiness</span>
                <h4 className="text-xl font-black text-foreground font-mono">{readinessData.overall_readiness_score}%</h4>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Unblocked: <strong className="text-foreground">{readinessData.unblocked_skills_count}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                  <AlertOctagon className="h-4 w-4" />
                  <span>Blockers: <strong className="text-foreground">{readinessData.critical_blockers_count}</strong></span>
                </div>
              </div>
            </div>

            {/* Readiness Pillars Breakdown */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                <span className="text-muted-foreground text-[11px]">Technical Competency</span>
                <p className="font-mono text-base font-bold text-foreground">{readinessData.technical_readiness}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                <span className="text-muted-foreground text-[11px]">Practical Readiness</span>
                <p className="font-mono text-base font-bold text-foreground">{readinessData.practical_readiness}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                <span className="text-muted-foreground text-[11px]">Project / Portfolio</span>
                <p className="font-mono text-base font-bold text-foreground">{readinessData.project_readiness}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
                <span className="text-muted-foreground text-[11px]">Interview Readiness</span>
                <p className="font-mono text-base font-bold text-foreground">{readinessData.interview_readiness}%</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
