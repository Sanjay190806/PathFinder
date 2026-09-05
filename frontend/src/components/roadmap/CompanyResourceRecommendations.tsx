"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PriceBadge } from "../resources/PriceBadge";
import { YouTubeResourceCard } from "../resources/YouTubeResourceCard";
import { PracticeProblemList } from "../dsa/PracticeProblemList";

export interface CompanyRecommendationData {
  company_slug: string;
  company_name: string;
  role_slug: string;
  role_name: string;
  budget_preference: string;
  preferred_language: string;
  critical_next: {
    focus_topic: string;
    topic_slug: string;
    target_difficulty: string;
    priority: string;
    reason: string;
    primary_course?: any;
    free_alternative?: any;
    paid_alternative?: any;
    youtube_alternative?: any;
    practice_problems: any[];
    assessment_action?: {
      title: string;
      exam_route: string;
      benchmark_score: string;
    };
  };
  high_priority: any[];
  recommended: any[];
  decision_trace: {
    primary_milestone: string;
    rationale: string;
    factors: Array<{ factor: string; value: string }>;
  };
}

interface CompanyResourceRecommendationsProps {
  companySlug: string;
  roleSlug: string;
  learnerId: string;
}

export const CompanyResourceRecommendations: React.FC<CompanyResourceRecommendationsProps> = ({
  companySlug,
  roleSlug,
  learnerId,
}) => {
  const [data, setData] = useState<CompanyRecommendationData | null>(null);
  const [budget, setBudget] = useState<"FREE" | "PAID_ALLOWED">("FREE");
  const [activeTab, setActiveTab] = useState<"FREE" | "PAID" | "YOUTUBE" | "PRACTICE">("FREE");
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/recommendations/company-role-learning?company_slug=${companySlug}&role_slug=${roleSlug}&learner_id=${learnerId}&budget=${budget}`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [companySlug, roleSlug, learnerId, budget]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 animate-pulse">
        Synthesizing personalized course, YouTube, and practice recommendations...
      </div>
    );
  }

  if (!data) return null;

  const next = data.critical_next;

  return (
    <div className="space-y-8">
      {/* Target & Budget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Personalized Learning Path
          </span>
          <h3 className="text-xl font-black text-slate-900">
            {data.role_name} at {data.company_name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Budget Mode:</span>
          <div className="rounded-xl bg-slate-100 p-1 flex items-center">
            <button
              onClick={() => setBudget("FREE")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                budget === "FREE" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600"
              }`}
            >
              100% Free
            </button>
            <button
              onClick={() => setBudget("PAID_ALLOWED")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                budget === "PAID_ALLOWED" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
              }`}
            >
              Paid Allowed
            </button>
          </div>
        </div>
      </div>

      {/* Primary Next Action Banner */}
      <div className="rounded-3xl border border-indigo-200 bg-linear-to-b from-indigo-50/50 via-white to-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-indigo-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-0.5 text-xs font-black text-rose-800 uppercase tracking-wider">
              Critical Next Focus
            </div>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {next.focus_topic} ({next.target_difficulty})
            </h2>
            <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
              <strong>Grounding Rationale:</strong> {data.decision_trace.rationale}
            </p>
          </div>

          {next.assessment_action && (
            <Link
              href={next.assessment_action.exam_route}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs shrink-0"
            >
              Take Assessment →
            </Link>
          )}
        </div>

        {/* Multi-Format Option Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {(
            [
              ["FREE", "Verified Free Course"],
              ["PAID", "Structured Course"],
              ["YOUTUBE", "YouTube Playlist"],
              ["PRACTICE", "Coding Practice"],
            ] as const
          ).map(([tKey, tLabel]) => (
            <button
              key={tKey}
              onClick={() => setActiveTab(tKey)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tKey
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tLabel}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "FREE" && next.free_alternative && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {next.free_alternative.provider}
                </span>
                <PriceBadge priceType={next.free_alternative.price_type} size="sm" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">{next.free_alternative.title}</h4>
              <p className="text-xs text-slate-600">{next.free_alternative.description}</p>
              <div className="pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {next.free_alternative.estimated_hours}h • {next.free_alternative.difficulty} • {next.free_alternative.language}
                </span>
                <a
                  href={next.free_alternative.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 hover:text-emerald-900"
                >
                  Start Free Course ↗
                </a>
              </div>
            </div>
          )}

          {activeTab === "PAID" && next.paid_alternative && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {next.paid_alternative.provider}
                </span>
                <PriceBadge
                  priceType={next.paid_alternative.price_type}
                  learningCost={next.paid_alternative.learning_cost}
                  size="sm"
                />
              </div>
              <h4 className="text-lg font-bold text-slate-900">{next.paid_alternative.title}</h4>
              <p className="text-xs text-slate-600">{next.paid_alternative.description}</p>
              <div className="pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {next.paid_alternative.estimated_hours}h • {next.paid_alternative.difficulty}
                </span>
                <a
                  href={next.paid_alternative.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 hover:text-indigo-800"
                >
                  View Details ↗
                </a>
              </div>
            </div>
          )}

          {activeTab === "YOUTUBE" && next.youtube_alternative && (
            <YouTubeResourceCard resource={next.youtube_alternative} />
          )}

          {activeTab === "PRACTICE" && (
            <PracticeProblemList
              problems={next.practice_problems}
              topicName={next.focus_topic}
            />
          )}
        </div>
      </div>

      {/* Up Next & High Priority Items */}
      {data.high_priority.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Upcoming Milestones ({data.high_priority.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.high_priority.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-indigo-600">{item.stage}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500">{item.difficulty}</span>
                  </div>
                  <h5 className="font-bold text-slate-800 text-sm mt-0.5">{item.title}</h5>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 shrink-0">
                  {item.estimated_hours}h
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
