import React from "react";
import { Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningPaceStepProps {
  weeklyHours: number;
  preferredFormats: string[];
  learningObjective: string;
  onChangeHours: (hours: number) => void;
  onToggleFormat: (format: string) => void;
  onChangeObjective: (obj: string) => void;
}

export function LearningPaceStep({
  weeklyHours,
  preferredFormats,
  learningObjective,
  onChangeHours,
  onToggleFormat,
  onChangeObjective
}: LearningPaceStepProps) {
  const contentFormats = [
    { id: "video", label: "Video Masterclasses" },
    { id: "hands-on", label: "Hands-on Code & Labs" },
    { id: "projects", label: "End-to-End Projects" },
    { id: "theory", label: "Mathematical & Systems Theory" },
    { id: "interactive", label: "Interactive Quizzes" },
    { id: "article", label: "Documentation & Reads" }
  ];

  const objectives = [
    {
      id: "Placement / Career Goal",
      title: "Placement / Career Transition",
      desc: "Full comprehensive path prioritizing interview-ready core competencies and capstone projects."
    },
    {
      id: "Internship Preparation",
      title: "Internship Readiness",
      desc: "Accelerated path focused on immediate practical project deliverables and key tooling."
    },
    {
      id: "Build Portfolio / Capstones",
      title: "Portfolio & Capstones",
      desc: "Project-heavy track focused on deployable applications and public code repositories."
    },
    {
      id: "Skill Mastery",
      title: "Targeted Skill Mastery",
      desc: "Laser-focused track closing specific missing prerequisite and specialization gaps."
    }
  ];

  const getPaceDescription = (hours: number) => {
    if (hours <= 4) return "Light micro-learning pace ? steady long-term progression.";
    if (hours <= 8) return "Steady pace ? consistent multi-topic progression without overwhelm.";
    if (hours <= 15) return "Focused study pace ? accelerated competency milestone completion.";
    return "Intensive pace ? deep daily technical immersion.";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-emerald">
          <Clock className="h-4 w-4" /> Step 4: Schedule & Pacing
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
          How do you prefer to learn?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          PathFinder adjusts weekly workloads and resource durations to fit your actual available schedule.
        </p>
      </div>

      <div className="space-y-6">
        {/* Weekly Hours Slider */}
        <div className="rounded-2xl border border-surface-border bg-surface p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span>Available Weekly Time</span>
            <span className="text-accent-cyan font-bold text-sm font-mono">{weeklyHours} Hours / Week</span>
          </div>
          <input
            type="range"
            min={2}
            max={35}
            step={1}
            value={weeklyHours}
            onChange={(e) => onChangeHours(parseInt(e.target.value))}
            className="w-full accent-primary-500 cursor-pointer h-2 bg-surface-raised rounded-lg"
          />
          <p className="text-xs text-slate-400 mt-2">{getPaceDescription(weeklyHours)}</p>
        </div>

        {/* Content Formats */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2.5">
            Preferred Content Formats
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {contentFormats.map((fmt) => {
              const isSelected = preferredFormats.includes(fmt.id);
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => onToggleFormat(fmt.id)}
                  className={cn(
                    "rounded-xl border p-3 text-xs font-semibold text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500",
                    isSelected
                      ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-200 shadow-sm"
                      : "border-surface-border bg-surface-raised/40 text-slate-400 hover:text-white"
                  )}
                >
                  {fmt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Milestone */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2.5">
            Primary Learning Milestone
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {objectives.map((obj) => {
              const isSelected = learningObjective === obj.id;
              return (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => onChangeObjective(obj.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500",
                    isSelected
                      ? "border-amber-500/60 bg-amber-950/40 text-white shadow-md"
                      : "border-surface-border bg-surface-raised/40 text-slate-300 hover:bg-surface-raised"
                  )}
                >
                  <h4 className="text-xs sm:text-sm font-bold">{obj.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{obj.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
