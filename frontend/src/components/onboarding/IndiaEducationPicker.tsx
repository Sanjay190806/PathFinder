'use client';

import React, { useState, useEffect } from "react";
import {
  EDUCATION_STAGES,
  SCHOOL_LEVELS,
  SCHOOL_SUBJECT_INTERESTS,
  DIPLOMA_BRANCHES,
  CURRENT_ROLES,
  WORK_DOMAINS,
  getDomainsForStage,
  SIH26101Profile
} from "@/lib/indiaEducationTaxonomy";
import { Select, Card, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Check, Sparkles, ChevronDown, ChevronUp, Layers, GraduationCap, Building2 } from "lucide-react";

interface IndiaEducationPickerProps {
  initialStage?: string;
  initialDomain?: string;
  initialStream?: string;
  initialSpecialization?: string;
  initialQualification?: string;
  initialCurrentRole?: string;
  initialWorkDomain?: string;
  initialSubjectInterests?: string[];
  onChange: (profile: SIH26101Profile) => void;
  compact?: boolean;
}

export function IndiaEducationPicker({
  initialStage = "undergraduate",
  initialDomain = "computer_it",
  initialStream = "cs_core",
  initialSpecialization = "Artificial Intelligence & Machine Learning (AI/ML)",
  initialQualification = "B.Tech CSE",
  initialCurrentRole = "Student / Fresher",
  initialWorkDomain = "Artificial Intelligence & Machine Learning",
  initialSubjectInterests = [],
  onChange,
  compact = false
}: IndiaEducationPickerProps) {
  // 1. Stage selection
  const [stage, setStage] = useState<string>(initialStage);

  // 2. School level & subject interests (for school stage)
  const [schoolLevel, setSchoolLevel] = useState<string>("secondary");
  const [subjectInterests, setSubjectInterests] = useState<string[]>(
    initialSubjectInterests.length > 0 ? initialSubjectInterests : ["Mathematics", "Science", "Computer / ICT"]
  );

  // 3. Domain & Stream
  const [domainId, setDomainId] = useState<string>(initialDomain);
  const [streamId, setStreamId] = useState<string>(initialStream);

  // 4. Specialization & Qualification
  const [specialization, setSpecialization] = useState<string>(initialSpecialization);
  const [qualification, setQualification] = useState<string>(initialQualification);

  // 5. Current Role & Work Domain
  const [currentRole, setCurrentRole] = useState<string>(initialCurrentRole);
  const [workDomain, setWorkDomain] = useState<string>(initialWorkDomain);

  // Toggle JSON preview
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);

  // Get available domains for the selected stage
  const availableDomains = getDomainsForStage(stage);
  const activeDomain = availableDomains.find((d) => d.id === domainId) || availableDomains[0];

  // Streams for current domain
  const availableStreams = activeDomain?.streams || [];
  const activeStream = availableStreams.find((s) => s.id === streamId) || availableStreams[0];

  // When stage changes, sync domain and stream
  const handleStageChange = (newStage: string) => {
    setStage(newStage);
    const domains = getDomainsForStage(newStage);
    if (domains.length > 0) {
      const firstDomain = domains[0];
      setDomainId(firstDomain.id);
      if (firstDomain.streams.length > 0) {
        const firstStream = firstDomain.streams[0];
        setStreamId(firstStream.id);
        setSpecialization(firstStream.specializations[0] || "");
        setQualification(firstStream.qualifications[0] || "");
      }
    }
  };

  // When domain changes, sync stream
  const handleDomainChange = (newDomainId: string) => {
    setDomainId(newDomainId);
    const domain = availableDomains.find((d) => d.id === newDomainId);
    if (domain && domain.streams.length > 0) {
      const firstStream = domain.streams[0];
      setStreamId(firstStream.id);
      setSpecialization(firstStream.specializations[0] || "");
      setQualification(firstStream.qualifications[0] || "");
    }
  };

  // When stream changes, sync specialization & qualification
  const handleStreamChange = (newStreamId: string) => {
    setStreamId(newStreamId);
    const stream = availableStreams.find((s) => s.id === newStreamId);
    if (stream) {
      setSpecialization(stream.specializations[0] || "");
      setQualification(stream.qualifications[0] || "");
    }
  };

  // Toggle subject interests for School (Classes 1-10)
  const toggleSubjectInterest = (subj: string) => {
    setSubjectInterests((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  // Emit updated profile object to parent
  useEffect(() => {
    const profilePayload: SIH26101Profile = {
      country: "India",
      education_stage: stage,
      domain: stage === "school" ? "school_education" : (activeDomain?.id || domainId),
      stream: stage === "school" ? schoolLevel : (activeStream?.id || streamId),
      specialization: stage === "school" ? subjectInterests.join(", ") : specialization,
      qualification: stage === "school" ? "Secondary School (Class 10)" : qualification,
      current_role: currentRole,
      work_domain: workDomain,
      subject_interests: stage === "school" ? subjectInterests : undefined
    };
    onChange(profilePayload);
  }, [
    stage,
    domainId,
    streamId,
    specialization,
    qualification,
    currentRole,
    workDomain,
    schoolLevel,
    subjectInterests
  ]);

  return (
    <div className="space-y-5 text-left">
      {/* Step 1: Education Stage Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-2">
          Step 1: Education Stage (India Framework)
        </label>
        <div
          className={cn(
            "grid gap-2",
            compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-3"
          )}
        >
          {EDUCATION_STAGES.map((s) => {
            const isSelected = stage === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStageChange(s.id)}
                className={cn(
                  "p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group",
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground shadow-md ring-1 ring-primary/50"
                    : "border-border bg-card text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg">{s.icon}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
                <div className="mt-1.5">
                  <div className="text-xs font-bold leading-tight text-foreground">{s.shortLabel}</div>
                  {!compact && (
                    <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 group-hover:text-foreground">
                      {s.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conditional UI: School Education (Classes 1–10) */}
      {stage === "school" ? (
        <div className="p-4 rounded-xl border border-border bg-card/60 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🏫</span>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">School Level</h4>
              <p className="text-[11px] text-muted-foreground">
                In Classes 1–10, students explore core subjects rather than rigid streams.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SCHOOL_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSchoolLevel(lvl.id)}
                className={cn(
                  "p-2 text-xs rounded-lg border text-left font-medium transition-all",
                  schoolLevel === lvl.id
                    ? "border-primary bg-primary text-primary-foreground font-semibold"
                    : "border-border bg-card text-foreground hover:bg-surface-muted"
                )}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Subject Interests (Select All That Apply):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SCHOOL_SUBJECT_INTERESTS.map((subj) => {
                const checked = subjectInterests.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleSubjectInterest(subj)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5",
                      checked
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-surface-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {checked && <Check className="h-3 w-3" />}
                    {subj}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Hierarchical Selectors for Higher Secondary, College, Diploma, & Working Professionals */
        <div className="space-y-4 p-4 rounded-xl border border-border bg-card/60">
          {/* Step 2: Stream / Domain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                <span>Step 2: Stream / Domain</span>
                {activeDomain?.badge && (
                  <span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                    {activeDomain.badge}
                  </span>
                )}
              </label>
              <Select
                value={domainId}
                onChange={(e) => handleDomainChange(e.target.value)}
                className="w-full text-xs"
              >
                {availableDomains.map((d) => (
                  <option key={d.id} value={d.id} className="bg-card text-foreground">
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Specific Stream Group (e.g. PCM, PCB, CSE, AI/DS) */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Specific Stream / Discipline
              </label>
              <Select
                value={streamId}
                onChange={(e) => handleStreamChange(e.target.value)}
                className="w-full text-xs"
              >
                {availableStreams.map((s) => (
                  <option key={s.id} value={s.id} className="bg-card text-foreground">
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Step 3: Specialization */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Step 3: Specialization / Pathway
            </label>
            {activeStream?.specializations && activeStream.specializations.length > 0 ? (
              <Select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full text-xs"
              >
                {activeStream.specializations.map((spec) => (
                  <option key={spec} value={spec} className="bg-card text-foreground">
                    {spec}
                  </option>
                ))}
              </Select>
            ) : (
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Artificial Intelligence, VLSI, Data Science"
                className="w-full px-3 py-2 rounded-xl text-xs bg-card border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
          </div>

          {/* Step 4: Qualification & Step 5: Current Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Step 4: Current / Highest Qualification
              </label>
              {activeStream?.qualifications && activeStream.qualifications.length > 0 ? (
                <Select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full text-xs"
                >
                  {activeStream.qualifications.map((qual) => (
                    <option key={qual} value={qual} className="bg-card text-foreground">
                      {qual}
                    </option>
                  ))}
                </Select>
              ) : (
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. B.Tech, B.Sc, Diploma"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-card border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Step 5: Current Role (SIH26101 Profile)
              </label>
              <Select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full text-xs"
              >
                {CURRENT_ROLES.map((role) => (
                  <option key={role} value={role} className="bg-card text-foreground">
                    {role}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Optional Work Domain for working learners / statistical officers */}
          {(currentRole.includes("Officer") ||
            currentRole.includes("Analyst") ||
            currentRole.includes("Employee") ||
            currentRole.includes("Professional")) && (
            <div>
              <label className="block text-xs font-bold text-primary mb-1.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Work Domain (Official Statistics & Industry)
              </label>
              <Select
                value={workDomain}
                onChange={(e) => setWorkDomain(e.target.value)}
                className="w-full text-xs"
              >
                {WORK_DOMAINS.map((w) => (
                  <option key={w} value={w} className="bg-card text-foreground">
                    {w}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Collapsible SIH26101 Learner Profile Live JSON Preview */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowJsonPreview(!showJsonPreview)}
          className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>🇮🇳 JanSahay / SIH26101 AI Persona Preview</span>
          {showJsonPreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {showJsonPreview && (
          <div className="mt-2 p-3 rounded-xl bg-card border border-border text-left font-mono text-[11px] text-primary overflow-x-auto shadow-inner">
            <pre>
              {JSON.stringify(
                {
                  country: "India",
                  education_stage: stage,
                  domain: stage === "school" ? "school_education" : (activeDomain?.id || domainId),
                  stream: stage === "school" ? schoolLevel : (activeStream?.id || streamId),
                  specialization: stage === "school" ? subjectInterests : specialization,
                  qualification: stage === "school" ? "Class 10 Secondary" : qualification,
                  current_role: currentRole,
                  work_domain: workDomain
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
