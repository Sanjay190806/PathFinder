"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Target,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers
} from "lucide-react";
import { api } from "@/lib/api";

interface PlanItem {
  title: string;
  skill_slug: string;
  estimated_minutes: number;
  priority: string;
  category: string;
  resource_id?: string;
  resource_url?: string;
  resource_title?: string;
  price_type?: string;
  language?: string;
  reason: string;
}

interface DailyPlan {
  date: string;
  day_of_week: string;
  total_planned_minutes: number;
  items: PlanItem[];
  decay_reviews_count: number;
  summary: string;
}

interface WeeklyDayPlan {
  day_name: string;
  focus_skill: string;
  planned_minutes: number;
  items: PlanItem[];
}

interface WeeklyPlan {
  week_number: number;
  weekly_hours_budget: number;
  total_allocated_hours: number;
  overflow_hours: number;
  overflow_explanation?: string;
  days: WeeklyDayPlan[];
}

interface Milestone {
  milestone_id: string;
  title: string;
  target_career: string;
  progress_percent: number;
  key_deliverable: string;
  target_eta_days: number;
  prerequisites_completed: boolean;
}

interface FullPlan {
  plan_version: number;
  today: DailyPlan;
  weekly: WeeklyPlan;
  next_milestone: Milestone;
  why_this_order: string[];
}

export default function PlannerPage() {
  const [plan, setPlan] = useState<FullPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const data = await api.getPlanner();
      setPlan(data);
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const updated = await api.recalculatePlan("Learner triggered tactical recalculation");
      setPlan(updated);
    } catch (err) {
      console.error("Failed to recalculate plan:", err);
    } finally {
      setRecalculating(false);
    }
  };

  const toggleComplete = (key: string) => {
    setCompletedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="text-sm font-semibold">Generating your personalized learning plan...</span>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <h2 className="text-lg font-bold">Unable to load learning plan</h2>
        <button
          onClick={fetchPlan}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/60 p-6 md:p-8 border border-indigo-500/20 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                  Plan Version {plan.plan_version}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Adaptive & Grounded
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Personalized Learning Planner
              </h1>
              <p className="text-slate-400 text-sm max-w-2xl">
                Your tactical schedule calibrated strictly to your weekly time commitment, mandatory skill prerequisites,
                retention reviews, and verified Indian curriculum.
              </p>
            </div>

            <div>
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${recalculating ? "animate-spin" : ""}`} />
                {recalculating ? "Recalculating..." : "Recalculate Schedule"}
              </button>
            </div>
          </div>
        </div>

        {/* Workload & Overflow Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Weekly Time Budget</span>
              <div className="text-xl font-extrabold text-white">{plan.weekly.weekly_hours_budget} hrs / week</div>
            </div>
            <Clock className="h-8 w-8 text-indigo-400/60" />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Scheduled Workload</span>
              <div className="text-xl font-extrabold text-emerald-400">{plan.weekly.total_allocated_hours} hrs active</div>
            </div>
            <Calendar className="h-8 w-8 text-emerald-400/60" />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Workload Overflow</span>
              <div className={`text-xl font-extrabold ${plan.weekly.overflow_hours > 0 ? "text-amber-400" : "text-slate-300"}`}>
                {plan.weekly.overflow_hours > 0 ? `${plan.weekly.overflow_hours} hrs deferred` : "None (Balanced)"}
              </div>
            </div>
            <AlertTriangle className={`h-8 w-8 ${plan.weekly.overflow_hours > 0 ? "text-amber-400" : "text-slate-600"}`} />
          </div>
        </div>

        {plan.weekly.overflow_hours > 0 && plan.weekly.overflow_explanation && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Workload Pacing Safeguard</span>
              <p className="text-amber-300/90 leading-relaxed">{plan.weekly.overflow_explanation}</p>
            </div>
          </div>
        )}

        {/* SECTION 1: TODAY'S FOCUS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Today's Focus: {plan.today.day_of_week} ({plan.today.date})</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Total: {plan.today.total_planned_minutes} minutes
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            {plan.today.summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plan.today.items.map((task, idx) => {
              const itemKey = `today-${idx}`;
              const isDone = completedItems[itemKey];

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                    isDone
                      ? "bg-slate-950/60 border-slate-800/60 opacity-60"
                      : "bg-slate-900/90 border-slate-800 hover:border-indigo-500/40 shadow-sm"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          task.priority === "Critical"
                            ? "bg-red-500/10 text-red-300 border-red-500/20"
                            : task.priority === "High"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                        }`}
                      >
                        {task.priority} Priority
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {task.category}
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold ${isDone ? "line-through text-slate-500" : "text-white"}`}>
                      {task.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {task.reason}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{task.estimated_minutes} mins</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.resource_url && (
                        <a
                          href={task.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Open verified resource"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => toggleComplete(itemKey)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          isDone
                            ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isDone ? "Completed" : "Done"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: THIS WEEK'S SCHEDULE */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Weekly Schedule Matrix</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {plan.weekly.days.map((day, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                    <span>{day.day_name}</span>
                    <span className="text-[10px] text-slate-400">{day.planned_minutes}m</span>
                  </div>
                  <div className="text-xs font-semibold text-white mt-1 line-clamp-1">{day.focus_skill}</div>

                  <div className="mt-3 space-y-1.5">
                    {day.items.slice(0, 2).map((item, i) => (
                      <div key={i} className="text-[11px] text-slate-400 line-clamp-1 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-right">
                  {day.items.length} tasks scheduled
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: UPCOMING MILESTONE & WHY THIS ORDER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Milestone Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Award className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">Next Major Milestone</h3>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">{plan.next_milestone.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Target Role: <span className="text-indigo-300 font-semibold">{plan.next_milestone.target_career}</span>
              </p>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
                <span className="text-slate-500 block mb-0.5">Key Deliverable:</span>
                {plan.next_milestone.key_deliverable}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Milestone Progress</span>
                <span className="font-bold text-white">{plan.next_milestone.progress_percent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${plan.next_milestone.progress_percent}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 text-right">
                Estimated completion: ~{plan.next_milestone.target_eta_days} days
              </div>
            </div>
          </div>

          {/* Why This Order */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">Why This Execution Order?</h3>
            </div>

            <div className="space-y-2.5">
              {plan.why_this_order.map((reason, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/20">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
