"use client";

import React from "react";
import Link from "next/link";

export interface SkillGapItem {
  skill_id?: string;
  skill_name: string;
  skill_slug: string;
  requirement_type: string;
  importance: string;
  minimum_level: string;
  learner_confidence: number;
  status: "SATISFIED" | "DEVELOPING" | "GAP" | "CRITICAL_GAP" | "UNKNOWN";
  gap_priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  verified: boolean;
  decay_risk: boolean;
}

export interface DSAGapItem {
  topic_slug: string;
  topic_name: string;
  priority_level: string;
  target_difficulty: string;
  learner_confidence: number;
  status: "SATISFIED" | "DEVELOPING" | "GAP" | "CRITICAL_GAP";
  gap_priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  is_core: boolean;
  prerequisites: string[];
  missing_prerequisites: string[];
  is_blocked_by_prerequisite: boolean;
  unblock_recommendation?: string;
}

export interface LearnerGapData {
  company_slug: string;
  company_name: string;
  role_slug: string;
  role_name: string;
  learner_id: string;
  readiness_percentage: number;
  is_dsa_applicable: boolean;
  dsa_priority_level: string;
  summary: {
    total_skills_evaluated: number;
    critical_gaps_count: number;
    high_gaps_count: number;
    satisfied_count: number;
    prerequisite_blockers_count: number;
  };
  next_recommended_topic?: DSAGapItem;
  prerequisite_blockers: Array<{
    blocked_topic: string;
    blocked_slug: string;
    blocking_prerequisites: string[];
  }>;
  critical_skill_gaps: SkillGapItem[];
  skill_evaluations: SkillGapItem[];
  dsa_topic_evaluations: DSAGapItem[];
}

interface SkillGapOverviewProps {
  data: LearnerGapData;
}

export const SkillGapOverview: React.FC<SkillGapOverviewProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Top Readiness Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Personalized Gap Analysis
            </span>
            <h3 className="mt-1 text-2xl font-black text-slate-900">
              {data.role_name}
            </h3>
            <p className="text-sm text-slate-500">
              Target Company: <span className="font-semibold text-slate-800">{data.company_name}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-black text-slate-900">
                {data.readiness_percentage}%
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall Alignment
              </div>
            </div>
            <div className="h-12 w-12 rounded-full border-4 border-indigo-500 flex items-center justify-center font-bold text-xs text-indigo-700 bg-indigo-50">
              FIT
            </div>
          </div>
        </div>

        {/* Readiness Bar */}
        <div className="mt-5 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              data.readiness_percentage >= 75
                ? "bg-emerald-500"
                : data.readiness_percentage >= 45
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
            style={{ width: `${Math.max(5, data.readiness_percentage)}%` }}
          />
        </div>

        {/* Counts summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-center">
          <div>
            <div className="text-lg font-black text-rose-600">
              {data.summary.critical_gaps_count}
            </div>
            <div className="text-xs text-slate-500 font-medium">Critical Gaps</div>
          </div>
          <div>
            <div className="text-lg font-black text-amber-600">
              {data.summary.high_gaps_count}
            </div>
            <div className="text-xs text-slate-500 font-medium">Secondary Gaps</div>
          </div>
          <div>
            <div className="text-lg font-black text-emerald-600">
              {data.summary.satisfied_count}
            </div>
            <div className="text-xs text-slate-500 font-medium">Satisfied</div>
          </div>
          <div>
            <div className="text-lg font-black text-indigo-600">
              {data.summary.prerequisite_blockers_count}
            </div>
            <div className="text-xs text-slate-500 font-medium">Blockers</div>
          </div>
        </div>
      </div>

      {/* Next Recommended Topic Banner */}
      {data.next_recommended_topic && (
        <div className="rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-50 via-white to-purple-50 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                Immediate Next Milestone
              </div>
              <h4 className="mt-2 text-xl font-bold text-slate-900">
                {data.next_recommended_topic.topic_name}
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                Target Difficulty: <span className="font-semibold text-slate-800">{data.next_recommended_topic.target_difficulty}</span> • Current Mastery: {Math.round(data.next_recommended_topic.learner_confidence * 100)}%
              </p>
            </div>
            <Link
              href={`/learning/dsa/${data.next_recommended_topic.topic_slug}`}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Start Learning Topic →
            </Link>
          </div>
        </div>
      )}

      {/* Prerequisite Blockers Warning */}
      {data.prerequisite_blockers.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-wider">
            <span className="text-base">⚠️</span> Prerequisite Dependency Warnings
          </div>
          <p className="mt-1 text-xs text-amber-700">
            Advanced topics cannot be recommended until core prerequisite foundations are completed.
          </p>
          <div className="mt-3 space-y-2">
            {data.prerequisite_blockers.map((b) => (
              <div
                key={b.blocked_slug}
                className="rounded-lg bg-white p-3 border border-amber-200 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800">{b.blocked_topic}</span> is blocked
                </div>
                <div className="text-amber-700 font-medium">
                  Missing Prerequisites: <span className="font-bold">{b.blocking_prerequisites.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic-by-Topic DSA Readiness */}
      {data.is_dsa_applicable && data.dsa_topic_evaluations.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                DSA Topic Readiness Breakdown
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated against {data.company_name} interview targets
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Priority: {data.dsa_priority_level}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {data.dsa_topic_evaluations.map((dt) => (
              <div
                key={dt.topic_slug}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 hover:border-indigo-200 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        dt.status === "SATISFIED"
                          ? "bg-emerald-500"
                          : dt.status === "DEVELOPING"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    />
                    <Link
                      href={`/learning/dsa/${dt.topic_slug}`}
                      className="font-bold text-sm text-slate-800 hover:text-indigo-600 transition-colors"
                    >
                      {dt.topic_name}
                    </Link>
                    {dt.is_core && (
                      <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        CORE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">Target: {dt.target_difficulty}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 font-semibold text-xs ${
                        dt.status === "SATISFIED"
                          ? "bg-emerald-100 text-emerald-800"
                          : dt.status === "DEVELOPING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {dt.status.replace("_", " ")}
                    </span>
                    <span className="font-bold text-slate-700 w-12 text-right">
                      {Math.round(dt.learner_confidence * 100)}%
                    </span>
                  </div>
                </div>

                {dt.is_blocked_by_prerequisite && dt.unblock_recommendation && (
                  <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-md p-2 border border-amber-200">
                    ⚠️ {dt.unblock_recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
