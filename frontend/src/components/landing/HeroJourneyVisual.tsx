import React from "react";
import { CheckCircle2, ArrowRight, Target, Route, Sparkles, BookOpen, Layers, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroJourneyVisual() {
  const steps = [
    {
      step: "01",
      title: "Current Baseline",
      detail: "Assesses what you already know to avoid repeat basics.",
      status: "Evaluated",
      statusColor: "text-emerald-400 border-emerald-800/60 bg-emerald-950/40"
    },
    {
      step: "02",
      title: "Prerequisite DAG",
      detail: "Identifies foundation dependencies before unlocking advanced topics.",
      status: "0% Violations",
      statusColor: "text-cyan-400 border-cyan-800/60 bg-cyan-950/40"
    },
    {
      step: "03",
      title: "Adaptive Roadmap",
      detail: "Sequences courses & projects based on your weekly study pace.",
      status: "Personalized",
      statusColor: "text-primary-400 border-primary-800/60 bg-primary-950/40"
    },
    {
      step: "04",
      title: "Career Ready",
      detail: "Capstone portfolio projects prove industry-grade competency.",
      status: "Target Goal",
      statusColor: "text-amber-400 border-amber-800/60 bg-amber-950/40"
    }
  ];

  return (
    <div className="w-full rounded-3xl border border-surface-border bg-surface/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-surface-border pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-950 border border-primary-800/60 text-primary-400">
            <Route className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Product Journey Architecture</span>
            <h3 className="text-base font-bold text-white tracking-tight">How PathFinder Guides Your Growth</h3>
          </div>
        </div>
        <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300">
          Domain-Agnostic Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-surface-border bg-surface-raised/60 p-4.5 flex flex-col justify-between hover:border-slate-600 transition-all duration-150 relative group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-slate-500 group-hover:text-primary-400 transition-colors">
                  {s.step}
                </span>
                <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold", s.statusColor)}>
                  {s.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">{s.title}</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{s.detail}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
              <span>Stage {idx + 1}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
