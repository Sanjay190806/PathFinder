import React from "react";
import { Layers, Check } from "lucide-react";
import { Skill } from "@/lib/types";
import { Skeleton, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";

interface SkillConfidenceStepProps {
  skills: Skill[];
  selectedSkills: Record<string, string>;
  targetRole: string;
  onToggleSkill: (slug: string) => void;
  onSetRating: (slug: string, rating: string) => void;
  isLoading: boolean;
}

export function SkillConfidenceStep({
  skills,
  selectedSkills,
  targetRole,
  onToggleSkill,
  onSetRating,
  isLoading
}: SkillConfidenceStepProps) {
  const ratingLevels = [
    { key: "Beginner", label: "Beginner (25%)" },
    { key: "Intermediate", label: "Intermediate (60%)" },
    { key: "Advanced", label: "Advanced (90%)" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-purple">
          <Layers className="h-4 w-4" /> Step 3: Skill Baseline
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
          What do you already know?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Select any competencies you have prior experience with to avoid repeating beginner material.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-6 w-6 text-slate-400" />}
          title="Starting fresh"
          description={`PathFinder will sequence your ${targetRole} roadmap starting from core foundational concepts.`}
        />
      ) : (
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {skills.map((sk) => {
            const isSelected = !!selectedSkills[sk.slug];
            const currentRating = selectedSkills[sk.slug] || "Beginner";

            return (
              <div
                key={sk.id || sk.slug}
                className={cn(
                  "rounded-2xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-150",
                  isSelected
                    ? "border-primary-500/60 bg-primary-950/40"
                    : "border-surface-border bg-surface-raised/40 hover:bg-surface-raised"
                )}
              >
                <div
                  onClick={() => onToggleSkill(sk.slug)}
                  className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-md border flex items-center justify-center transition-colors shrink-0",
                      isSelected ? "bg-primary-600 border-primary-500 text-white" : "border-slate-500 bg-surface"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white">{sk.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2 font-mono">({sk.category})</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-1 shrink-0">
                    {ratingLevels.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => onSetRating(sk.slug, r.key)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500",
                          currentRating === r.key
                            ? "bg-primary-600 text-white shadow-sm"
                            : "bg-surface-raised text-slate-400 hover:text-white"
                        )}
                      >
                        {r.key}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
