"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface RoadmapItem {
  id: string;
  stage: string;
  item_type: "DSA_TOPIC" | "SKILL" | "TECHNOLOGY" | "PROJECT" | "MOCK_INTERVIEW";
  title: string;
  topic_slug?: string;
  skill_slug?: string;
  description: string;
  priority: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  estimated_hours: number;
  status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
  prerequisites: string[];
  sequence_order: number;
  learning_objectives: string[];
  practice_recommendation?: string;
}

export interface RoadmapStage {
  stage_name: string;
  stage_title: string;
  stage_order: number;
  estimated_hours: number;
  items: RoadmapItem[];
}

export interface CompanyRoadmapData {
  roadmap_id: string;
  version: number;
  change_reason: string;
  company_slug: string;
  company_name: string;
  role_slug: string;
  role_name: string;
  canonical_role_name: string;
  learner_id: string;
  total_stages: number;
  total_items: number;
  total_estimated_hours: number;
  dsa_priority: string;
  stages: RoadmapStage[];
  items: RoadmapItem[];
  decision_trace: {
    rationale: string;
  };
}

interface CompanyAwareRoadmapProps {
  roadmap: CompanyRoadmapData;
  onSwitchCompany?: (newCompanySlug: string) => void;
}

export const CompanyAwareRoadmap: React.FC<CompanyAwareRoadmapProps> = ({
  roadmap,
  onSwitchCompany,
}) => {
  const [filter, setFilter] = useState<"ALL" | "DSA" | "SKILLS" | "PROJECTS" | "INTERVIEW">("ALL");

  const filterItem = (item: RoadmapItem) => {
    if (filter === "ALL") return true;
    if (filter === "DSA") return item.item_type === "DSA_TOPIC";
    if (filter === "SKILLS") return item.item_type === "SKILL" || item.item_type === "TECHNOLOGY";
    if (filter === "PROJECTS") return item.item_type === "PROJECT";
    if (filter === "INTERVIEW") return item.item_type === "MOCK_INTERVIEW";
    return true;
  };

  const completedCount = roadmap.items.filter((i) => i.status === "COMPLETED").length;
  const progressPercent = Math.round((completedCount / roadmap.items.length) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-400/30 tracking-wider uppercase">
                Company Target Roadmap
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700">
                v{roadmap.version}.0
              </span>
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
                DSA: {roadmap.dsa_priority}
              </span>
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              {roadmap.role_name} Roadmap
            </h2>
            <p className="mt-1 text-lg font-medium text-indigo-200">
              Target Employer: <span className="text-white font-bold">{roadmap.company_name}</span>
            </p>
            <p className="mt-2 text-xs text-slate-400 max-w-2xl">
              {roadmap.decision_trace.rationale}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-xs border border-white/15 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Roadmap Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-lg bg-black/20 p-2">
                <div className="font-bold text-white text-base">{roadmap.total_estimated_hours}h</div>
                <div className="text-slate-400 text-[11px]">Total Effort</div>
              </div>
              <div className="rounded-lg bg-black/20 p-2">
                <div className="font-bold text-white text-base">{roadmap.total_items}</div>
                <div className="text-slate-400 text-[11px]">Milestones</div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Reason Banner if version > 1 */}
        {roadmap.version > 1 && (
          <div className="mt-6 rounded-xl bg-indigo-500/20 border border-indigo-400/30 p-3.5 text-xs text-indigo-200 flex items-center gap-2">
            <span>🔄</span>
            <span>
              <strong>Recalibration Notice:</strong> {roadmap.change_reason}
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {(
          [
            ["ALL", "All Milestones"],
            ["DSA", "DSA Topics"],
            ["SKILLS", "Core Skills & Tech"],
            ["PROJECTS", "Capstone Projects"],
            ["INTERVIEW", "Interview Preparation"],
          ] as const
        ).map(([fKey, fLabel]) => (
          <button
            key={fKey}
            onClick={() => setFilter(fKey)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              filter === fKey
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            {fLabel}
          </button>
        ))}
      </div>

      {/* Stages & Sequenced Items */}
      <div className="space-y-8">
        {roadmap.stages.map((stage) => {
          const visibleItems = stage.items.filter(filterItem);
          if (visibleItems.length === 0) return null;

          return (
            <div key={stage.stage_name} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
                    {stage.stage_order}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{stage.stage_title}</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {stage.estimated_hours}h estimated
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {visibleItems.map((item) => {
                  const isLocked = item.status === "LOCKED";
                  const isCompleted = item.status === "COMPLETED";

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-5 transition-all ${
                        isCompleted
                          ? "border-emerald-200 bg-emerald-50/40"
                          : isLocked
                          ? "border-slate-200 bg-slate-50/60 opacity-80"
                          : "border-slate-200 bg-white hover:border-indigo-300 shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">
                              #{item.sequence_order}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                item.item_type === "DSA_TOPIC"
                                  ? "bg-rose-100 text-rose-800"
                                  : item.item_type === "PROJECT"
                                  ? "bg-purple-100 text-purple-800"
                                  : item.item_type === "MOCK_INTERVIEW"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {item.item_type.replace("_", " ")}
                            </span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                              {item.difficulty}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            {item.topic_slug ? (
                              <Link
                                href={`/learning/dsa/${item.topic_slug}`}
                                className="hover:text-indigo-600 transition-colors"
                              >
                                {item.title}
                              </Link>
                            ) : (
                              item.title
                            )}
                          </h4>
                          <p className="text-sm text-slate-600">{item.description}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800"
                                : isLocked
                                ? "bg-slate-200 text-slate-600"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {isCompleted ? "✓ Completed" : isLocked ? "🔒 Locked" : "Available"}
                          </span>
                        </div>
                      </div>

                      {/* Learning Objectives & Prerequisites */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-3">
                          <span>⏱ {item.estimated_hours} hours</span>
                          {item.prerequisites.length > 0 && (
                            <span>
                              Prerequisites:{" "}
                              <strong className="text-slate-700">
                                {item.prerequisites.join(", ")}
                              </strong>
                            </span>
                          )}
                        </div>

                        {item.practice_recommendation && (
                          <span className="text-indigo-600 font-medium">
                            💡 {item.practice_recommendation}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
