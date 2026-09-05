"use client";

import React, { useState } from "react";

export interface PracticeProblem {
  id: string;
  title: string;
  dsa_topic_slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  platform: string;
  problem_url: string;
  pattern: string;
  acceptance_rate: string;
  solution_video_url?: string | null;
}

interface PracticeProblemListProps {
  problems: PracticeProblem[];
  topicName: string;
}

export const PracticeProblemList: React.FC<PracticeProblemListProps> = ({
  problems,
  topicName,
}) => {
  const [filter, setFilter] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD">("ALL");

  const filtered = problems.filter((p) => {
    if (filter === "ALL") return true;
    return p.difficulty === filter;
  });

  return (
    <div className="space-y-4">
      {/* Header & Difficulty Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-base font-bold text-slate-900">
            {topicName} Practice Problem Sets
          </h4>
          <p className="text-xs text-slate-500">
            Verified interview coding exercises with direct problem links
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                filter === d
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table / List */}
      <div className="space-y-2.5">
        {filtered.map((prob) => {
          const diffColor =
            prob.difficulty === "EASY"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : prob.difficulty === "MEDIUM"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-rose-50 text-rose-700 border-rose-200";

          return (
            <div
              key={prob.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-indigo-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black ${diffColor}`}>
                  {prob.difficulty}
                </span>

                <div>
                  <a
                    href={prob.problem_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                  >
                    {prob.title} ↗
                  </a>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>Pattern: {prob.pattern}</span>
                    <span>•</span>
                    <span>Platform: {prob.platform}</span>
                    {prob.acceptance_rate && (
                      <>
                        <span>•</span>
                        <span>Acceptance: {prob.acceptance_rate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {prob.solution_video_url && (
                  <a
                    href={prob.solution_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    ▶ Solution Walkthrough
                  </a>
                )}
                <a
                  href={prob.problem_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Solve Problem →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
