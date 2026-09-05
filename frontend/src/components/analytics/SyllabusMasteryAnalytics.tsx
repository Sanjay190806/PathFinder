'use client';

import React, { useState } from "react";
import { Layers, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { SyllabusAnalytics, ModulePerformance, TopicPerformance, ObjectivePerformance } from "@/lib/types";
import { Card } from "@/components/ui";

interface SyllabusMasteryAnalyticsProps {
  syllabusData: SyllabusAnalytics | null;
}

export function SyllabusMasteryAnalytics({ syllabusData }: SyllabusMasteryAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'modules' | 'topics' | 'objectives'>('modules');

  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case "HIGH_MASTERY":
        return "bg-emerald-950/80 text-emerald-400 border-emerald-800/50";
      case "PROFICIENT":
        return "bg-blue-950/80 text-blue-400 border-blue-800/50";
      case "DEVELOPING":
        return "bg-amber-950/80 text-amber-400 border-amber-800/50";
      case "NEEDS_REVISION":
        return "bg-red-950/80 text-red-400 border-red-800/50";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <Card variant="default" className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Layers className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold text-white">Syllabus-Based Assessment Mastery</h3>
            <p className="text-xs text-slate-400">Granular performance calculated from authoritative question evidence</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-surface-raised rounded-lg border border-surface-border text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'modules' ? 'bg-primary-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Modules ({syllabusData?.modules.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'topics' ? 'bg-primary-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Topics ({syllabusData?.topics.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('objectives')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'objectives' ? 'bg-primary-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Objectives ({syllabusData?.learning_objectives.length || 0})
          </button>
        </div>
      </div>

      {!syllabusData || !syllabusData.has_data ? (
        <div className="p-8 text-center text-slate-400 bg-surface-raised/40 rounded-xl border border-surface-border">
          <Target className="h-8 w-8 mx-auto text-slate-500 mb-2" />
          <p className="text-sm font-semibold text-white">No syllabus assessment evidence recorded yet.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Take an authoritative course exam to view module, topic, and learning-objective accuracy breakdowns.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Modules View */}
          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {syllabusData.modules.map((m) => (
                <div
                  key={m.module_id}
                  className="p-3.5 rounded-xl bg-surface-raised/60 border border-surface-border space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white line-clamp-1">{m.module_title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase shrink-0 ${getSignalBadge(m.mastery_signal)}`}>
                      {m.mastery_signal.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Score Accuracy</span>
                      <span className="font-mono text-white font-bold">{m.percentage !== null ? `${m.percentage}%` : "Not Evaluated"}</span>
                    </div>
                    <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, m.percentage || 0)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Questions: <strong className="text-white font-mono">{m.questions_correct}/{m.questions_attempted}</strong> correct</span>
                    <span>Marks: <strong className="text-white font-mono">{m.earned_score}/{m.max_score}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Topics View */}
          {activeTab === 'topics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {syllabusData.topics.map((t) => (
                <div
                  key={t.topic_id}
                  className="p-3.5 rounded-xl bg-surface-raised/60 border border-surface-border space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white line-clamp-1">{t.topic_title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase shrink-0 ${getSignalBadge(t.mastery_signal)}`}>
                      {t.mastery_signal.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Topic Accuracy</span>
                      <span className="font-mono text-white font-bold">{t.percentage !== null ? `${t.percentage}%` : "Not Evaluated"}</span>
                    </div>
                    <div className="w-full bg-surface-border h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, t.percentage || 0)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Questions: <strong className="text-white font-mono">{t.questions_correct}/{t.questions_attempted}</strong> correct</span>
                    <span>Marks: <strong className="text-white font-mono">{t.earned_score}/{t.max_score}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Objectives View */}
          {activeTab === 'objectives' && (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {syllabusData.learning_objectives.map((o) => (
                <div
                  key={o.objective_id}
                  className="p-3 rounded-xl bg-surface-raised/60 border border-surface-border flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{o.objective_title}</p>
                    <span className="text-[11px] text-slate-400">
                      Evidence instances: <strong className="text-white font-mono">{o.evidence_count}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-white font-mono">{o.percentage !== null ? `${o.percentage}%` : "N/A"}</span>
                      <p className="text-[10px] text-slate-500">{o.earned_score}/{o.max_score} pts</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getSignalBadge(o.mastery_signal)}`}>
                      {o.mastery_signal.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
