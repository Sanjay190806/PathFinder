import React from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { HierarchicalEducationSelector } from "@/components/education/HierarchicalEducationSelector";
import { StructuredEducationSelection } from "@/lib/educationCatalog";
import { SIH26101Profile } from "@/lib/indiaEducationTaxonomy";

interface StartingPointStepProps {
  educationLevel: string;
  fieldOfStudy: string;
  experienceLevel: string;
  onChangeEducation: (val: string) => void;
  onChangeField: (val: string) => void;
  onChangeExperience: (val: string) => void;
  educationSelection?: StructuredEducationSelection;
  onChangeEducationSelection?: (selection: StructuredEducationSelection) => void;
  indianProfile?: SIH26101Profile;
  onChangeIndianProfile?: (profile: SIH26101Profile) => void;
}

export function StartingPointStep({
  educationLevel,
  fieldOfStudy,
  experienceLevel,
  onChangeEducation,
  onChangeField,
  onChangeExperience,
  educationSelection,
  onChangeEducationSelection,
  indianProfile,
  onChangeIndianProfile
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

  const handleEducationChange = (sel: StructuredEducationSelection) => {
    if (onChangeEducationSelection) {
      onChangeEducationSelection(sel);
    }
    // Backward compatibility updates:
    const displayLevel = sel.education_level.replace(/-/g, " ");
    const displayStream = sel.custom_education_label || sel.specialization || sel.stream;
    onChangeEducation(`${displayLevel} (${sel.qualification || "Degree"})`);
    onChangeField(displayStream);

    if (onChangeIndianProfile) {
      onChangeIndianProfile({
        country: "India",
        education_stage: sel.education_level,
        domain: sel.stream,
        stream: sel.specialization,
        specialization: sel.custom_education_label || sel.specialization,
        qualification: sel.qualification,
        current_role: indianProfile?.current_role || "Student / Fresher",
        work_domain: indianProfile?.work_domain || "Software & Technology"
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-400">
          <BookOpen className="h-4 w-4" /> Step 2: Background & Stream
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
          Where are you starting from in India?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          India Education Taxonomy &bull; Cascading selection from Education Level &rarr; Broad Field &rarr; Specialization &rarr; Qualification.
        </p>
      </div>

      <div className="space-y-5">
        {/* Hierarchical India Education Selector */}
        <HierarchicalEducationSelector
          value={
            educationSelection || {
              education_level: indianProfile?.education_stage || "undergraduate",
              stream: indianProfile?.domain || "engineering-technology",
              specialization: indianProfile?.stream || "computer-science-engineering",
              qualification: indianProfile?.qualification || "B.Tech"
            }
          }
          onChange={handleEducationChange}
          showInstitutionFields={true}
        />

        {/* Technical Experience Level */}
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
