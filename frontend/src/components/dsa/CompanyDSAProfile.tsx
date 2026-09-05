"use client";

import React from "react";
import Link from "next/link";
import { DSAPriorityBadge } from "./DSAPriorityBadge";

export interface DSATopicItem {
  topic_slug: string;
  topic_name: string;
  priority_level: string;
  importance: string;
  minimum_difficulty: string;
  recommended_difficulty: string;
  interview_difficulty: string;
  is_core: boolean;
  prerequisites: string[];
}

export interface DSAProfileData {
  role_id?: string;
  role_slug?: string;
  role_name?: string;
  company_slug?: string;
  company_name?: string;
  canonical_role_name: string;
  priority_level: string;
  expected_level: string;
  minimum_difficulty: string;
  recommended_difficulty: string;
  interview_difficulty: string;
  source_level: string;
  confidence: number;
  source: string;
  verification_status: string;
  decision_trace: {
    decision: string;
    rationale: string;
    factors?: Array<{ name: string; reason: string }>;
  };
  core_topics: DSATopicItem[];
  secondary_topics: DSATopicItem[];
  optional_topics: DSATopicItem[];
}

interface CompanyDSAProfileProps {
  profile: DSAProfileData;
}

export const CompanyDSAProfile: React.FC<CompanyDSAProfileProps> = ({ profile }) => {
  const isNotApplicable = profile.priority_level === "NOT_APPLICABLE";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900">
              DSA Intelligence Blueprint
            </h3>
            <DSAPriorityBadge priority={profile.priority_level} size="md" />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {profile.company_name ? `${profile.company_name} • ` : ""}
            {profile.canonical_role_name} (Target Mastery:{" "}
            <span className="font-semibold text-slate-700">{profile.expected_level}</span>)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700 border border-indigo-200">
            Source: {profile.source_level}
          </span>
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 border border-emerald-200">
            Confidence: {Math.round(profile.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Rationale / Decision Trace */}
      <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Algorithmic Grounding & Decision Trace
        </p>
        <p className="mt-1 text-sm text-slate-700 leading-relaxed">
          {profile.decision_trace.rationale}
        </p>
      </div>

      {/* Target Difficulty Progression */}
      {!isNotApplicable && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center">
            <span className="text-xs font-medium text-slate-400">Minimum Baseline</span>
            <div className="mt-1 text-sm font-bold text-slate-800">
              {profile.minimum_difficulty}
            </div>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3 text-center">
            <span className="text-xs font-medium text-blue-500">Recommended Working</span>
            <div className="mt-1 text-sm font-bold text-blue-700">
              {profile.recommended_difficulty}
            </div>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-3 text-center">
            <span className="text-xs font-medium text-rose-500">Interview Target</span>
            <div className="mt-1 text-sm font-bold text-rose-700">
              {profile.interview_difficulty}
            </div>
          </div>
        </div>
      )}

      {/* Core Topics */}
      {!isNotApplicable && profile.core_topics.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Core High-Yield DSA Topics ({profile.core_topics.length})
          </h4>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.core_topics.map((t) => (
              <div
                key={t.topic_slug}
                className="rounded-xl border border-slate-200 bg-white p-3.5 hover:border-indigo-300 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/learning/dsa/${t.topic_slug}`}
                    className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors"
                  >
                    {t.topic_name}
                  </Link>
                  <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                    CORE
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Target: {t.interview_difficulty}</span>
                  {t.prerequisites.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      Prereqs: {t.prerequisites.slice(0, 2).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secondary Topics */}
      {!isNotApplicable && profile.secondary_topics.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Secondary Supporting Topics ({profile.secondary_topics.length})
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.secondary_topics.map((t) => (
              <Link
                key={t.topic_slug}
                href={`/learning/dsa/${t.topic_slug}`}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
              >
                {t.topic_name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Non-Software Note */}
      {isNotApplicable && (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-600">
            DSA is not an evaluated hiring criteria for this role. Learning resources should focus on domain-specific design, craft, or business fundamentals.
          </p>
        </div>
      )}
    </div>
  );
};
