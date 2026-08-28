import React from "react";
import { BookOpen } from "lucide-react";
import { Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

interface StartingPointStepProps {
  educationLevel: string;
  fieldOfStudy: string;
  experienceLevel: string;
  onChangeEducation: (val: string) => void;
  onChangeField: (val: string) => void;
  onChangeExperience: (val: string) => void;
}

export function StartingPointStep({
  educationLevel,
  fieldOfStudy,
  experienceLevel,
  onChangeEducation,
  onChangeField,
  onChangeExperience
}: StartingPointStepProps) {
  const experienceOptions = [
    {
      level: "Beginner",
      title: "New to this",
      desc: "Starting fresh with fundamentals, core syntax, and introductory concepts."
    },
    {
      level: "Intermediate",
      title: "Some Exposure",
      desc: "Familiar with core concepts and have completed coursework or small scripts."
    },
    {
      level: "Advanced",
      title: "Comfortable Builder",
      desc: "Experienced with project architecture, ready for specialized and deployment topics."
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-400">
          <BookOpen className="h-4 w-4" /> Step 2: Background
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
          Where are you starting from?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          This helps PathFinder calibrate prerequisite depth and avoid pacing mismatches.
        </p>
      </div>

      <div className="space-y-5">
        <Select
          label="Highest Education Level"
          value={educationLevel}
          onChange={(e) => onChangeEducation(e.target.value)}
        >
          <option value="High School">High School</option>
          <option value="Undergraduate">Undergraduate (College / University)</option>
          <option value="Postgraduate / Master">Postgraduate / Master</option>
          <option value="Bootcamp / Self-Taught">Bootcamp / Self-Taught</option>
          <option value="Working Professional">Working Professional</option>
        </Select>

        <Input
          label="Field of Study / Major"
          placeholder="e.g. Computer Science, Electrical Eng, Information Technology, Physics"
          value={fieldOfStudy}
          onChange={(e) => onChangeField(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Technical Exposure Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {experienceOptions.map((opt) => {
              const isSelected = experienceLevel === opt.level;
              return (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => onChangeExperience(opt.level)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                    isSelected
                      ? "border-primary-500 bg-primary-950/70 text-white shadow-md shadow-primary-500/10"
                      : "border-surface-border bg-surface-raised/40 text-slate-300 hover:bg-surface-raised hover:text-white"
                  )}
                >
                  <h4 className="text-sm font-bold text-white">{opt.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
