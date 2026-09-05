'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  Layers,
  BookOpen,
  Target,
  GraduationCap,
  Milestone,
  Check,
  Zap,
  Route
} from "lucide-react";
import { api, getAuthToken, setAuthToken } from "@/lib/api";
import { Button, Card, Alert, Skeleton } from "@/components/ui";
import { Navbar } from "@/components/Navbar";

interface MilestoneItem {
  step_number: number;
  title: string;
  description: string;
  milestone_type: string;
  skills_to_acquire: string[];
  estimated_weeks: number;
}

interface PathwayData {
  pathway_id: string;
  pathway_type: string;
  title: string;
  description: string;
  applicable_backgrounds: string[];
  duration_estimate: string;
  difficulty_level: string;
  milestones: MilestoneItem[];
  is_primary: boolean;
}

interface PathwayEvaluation {
  career_slug: string;
  career_role: string;
  domain_category: string;
  eligibility_status: string;
  academic_summary: string;
  active_pathway: PathwayData;
  alternative_pathways: PathwayData[];
  satisfied_skills: string[];
  missing_skills: string[];
  mandatory_skills_met: boolean;
  readiness_percentage: number;
  next_step: {
    step_type: string;
    skill_slug: string;
    skill_name: string;
    reason: string;
    priority: number;
    estimated_hours: number;
  } | null;
}

export default function CareerPathwayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [evaluation, setEvaluation] = useState<PathwayEvaluation | null>(null);
  const [requirements, setRequirements] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPathwayData() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);
      try {
        let token = getAuthToken();
        if (!token) {
          await api.demoLogin();
          setAuthToken('cookie');
        }

        const [evalData, reqData, profData] = await Promise.all([
          api.getCareerPathwayFit(slug).catch((err: any) => {
            throw new Error(err.message || "Failed to load pathway fit");
          }),
          api.getCareerRequirements(slug).catch(() => null),
          api.getProfile().catch(() => null)
        ]);

        setEvaluation(evalData);
        setRequirements(reqData);
        setProfile(profData);
        if (evalData?.active_pathway) {
          setSelectedPathwayId(evalData.active_pathway.pathway_id);
        }
      } catch (err: any) {
        setError(err.message || "Unable to load career pathway details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPathwayData();
  }, [slug]);

  const getEligibilityBadge = (status: string) => {
    switch (status) {
      case "DIRECT_ELIGIBLE":
        return {
          label: "Direct Eligible",
          classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          icon: <CheckCircle2 className="h-4 w-4" />
        };
      case "BRIDGE_RECOMMENDED":
        return {
          label: "Bridge Recommended",
          classes: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          icon: <AlertTriangle className="h-4 w-4" />
        };
      case "ALTERNATIVE_ROUTE":
        return {
          label: "Alternative Route",
          classes: "bg-purple-500/15 text-purple-400 border-purple-500/30",
          icon: <Route className="h-4 w-4" />
        };
      default:
        return {
          label: "Foundation Needed",
          classes: "bg-slate-500/15 text-slate-300 border-slate-500/30",
          icon: <BookOpen className="h-4 w-4" />
        };
    }
  };

  const activePathway = 
    evaluation?.alternative_pathways.find(p => p.pathway_id === selectedPathwayId) ||
    evaluation?.active_pathway;

  const allPathways = evaluation 
    ? [evaluation.active_pathway, ...evaluation.alternative_pathways] 
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-500 selection:text-white">
      <Navbar user={profile} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/career-discovery"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Career Discovery
          </Link>
        </div>

        {error && <Alert variant="danger" message={error} onClose={() => setError(null)} />}

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-48 rounded-3xl bg-surface-raised/40 border border-surface-border animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 rounded-2xl bg-surface-raised/40 border border-surface-border animate-pulse" />
              <div className="h-96 rounded-2xl bg-surface-raised/40 border border-surface-border animate-pulse" />
            </div>
          </div>
        ) : evaluation ? (
          <>
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-b from-surface-raised/90 to-surface/40 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan">
                      {evaluation.domain_category}
                    </span>
                    <span className="text-slate-500">&bull;</span>
                    {(() => {
                      const badge = getEligibilityBadge(evaluation.eligibility_status);
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.classes}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {evaluation.career_role} Pathway
                  </h1>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {evaluation.academic_summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
                    <span>
                      Current Readiness: <strong className="text-white font-mono">{evaluation.readiness_percentage}%</strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Prerequisites Met: <strong className="text-emerald-400">{evaluation.satisfied_skills.length}</strong> / {evaluation.satisfied_skills.length + evaluation.missing_skills.length}
                    </span>
                  </div>
                </div>

                {/* Primary Next Action Widget */}
                {evaluation.next_step && (
                  <div className="lg:w-80 p-5 rounded-2xl border border-primary-500/30 bg-primary-950/40 space-y-3 shrink-0 shadow-lg">
                    <div className="flex items-center gap-2 text-xs font-bold text-accent-cyan">
                      <Zap className="h-4 w-4" />
                      <span>Next High-Impact Step</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {evaluation.next_step.skill_name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {evaluation.next_step.reason}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-primary-500/20 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        ~{evaluation.next_step.estimated_hours} hours
                      </span>
                      <Link href="/roadmap">
                        <Button size="sm" variant="primary" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                          Start Step
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 8 Cols: Pathway Timeline & Milestones */}
              <div className="lg:col-span-8 space-y-6">
                {/* Pathway Route Selector */}
                {allPathways.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Available Routes for this Career
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {allPathways.map((p) => {
                        const isSelected = p.pathway_id === activePathway?.pathway_id;
                        return (
                          <button
                            key={p.pathway_id}
                            onClick={() => setSelectedPathwayId(p.pathway_id)}
                            className={`p-3.5 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? "border-primary-500 bg-primary-500/10 shadow-md ring-1 ring-primary-500"
                                : "border-surface-border bg-surface-raised/40 hover:border-slate-600"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">
                                {p.title}
                              </span>
                              {p.is_primary && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {p.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Active Pathway Milestones Timeline */}
                {activePathway && (
                  <Card className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-surface-border pb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <Milestone className="h-5 w-5 text-primary-400" />
                          {activePathway.title}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          {activePathway.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0 text-xs">
                        <span className="text-slate-400">Duration:</span>{" "}
                        <strong className="text-white">{activePathway.duration_estimate}</strong>
                      </div>
                    </div>

                    {/* Stepped Timeline */}
                    <div className="relative pl-6 sm:pl-8 border-l-2 border-primary-500/30 space-y-8">
                      {activePathway.milestones.map((m, idx) => (
                        <div key={idx} className="relative group">
                          {/* Timeline Dot Indicator */}
                          <div className="absolute -left-[31px] sm:-left-[39px] top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary-500 bg-surface text-primary-400 font-bold text-xs shadow-md">
                            {m.step_number}
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="text-base font-bold text-white group-hover:text-primary-300 transition-colors">
                                {m.title}
                              </h3>
                              <span className="px-2 py-0.5 rounded-md bg-surface-raised border border-surface-border text-[11px] text-slate-400 font-mono">
                                ~{m.estimated_weeks} weeks
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {m.description}
                            </p>

                            {/* Skills in Milestone */}
                            {m.skills_to_acquire && m.skills_to_acquire.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                                  Competencies:
                                </span>
                                {m.skills_to_acquire.map((sk) => {
                                  const isSatisfied = evaluation.satisfied_skills.includes(sk);
                                  return (
                                    <span
                                      key={sk}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono border ${
                                        isSatisfied
                                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                          : "bg-surface border-surface-border text-slate-300"
                                      }`}
                                    >
                                      {isSatisfied && <Check className="h-3 w-3" />}
                                      {sk}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Right 4 Cols: Career Prerequisites & Gaps */}
              <div className="lg:col-span-4 space-y-6">
                {/* Skill Requirements Checklist */}
                {requirements && (
                  <Card className="p-6 space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Target className="h-4 w-4 text-accent-cyan" />
                        Prerequisite Competencies
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Hard and recommended skills evaluated against your profile.
                      </p>
                    </div>

                    {/* Mandatory Skills */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Mandatory Requirements
                      </span>
                      <div className="space-y-1.5">
                        {requirements.mandatory_skills.map((sk: string) => {
                          const isMet = evaluation.satisfied_skills.includes(sk);
                          return (
                            <div
                              key={sk}
                              className="flex items-center justify-between p-2.5 rounded-xl border border-surface-border bg-surface-raised/40 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                {isMet ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border border-slate-600 flex items-center justify-center" />
                                )}
                                <span className={isMet ? "text-white font-medium" : "text-slate-300"}>
                                  {sk}
                                </span>
                              </div>
                              <span className={`text-[10px] font-mono font-bold ${isMet ? "text-emerald-400" : "text-amber-400"}`}>
                                {isMet ? "Satisfied" : "Needed"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recommended Skills */}
                    {requirements.recommended_skills && requirements.recommended_skills.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-surface-border">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Recommended Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {requirements.recommended_skills.map((sk: string) => {
                            const isMet = evaluation.satisfied_skills.includes(sk);
                            return (
                              <span
                                key={sk}
                                className={`px-2 py-0.5 rounded-md text-[11px] font-mono border ${
                                  isMet
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                                    : "bg-surface border-surface-border text-slate-400"
                                }`}
                              >
                                {sk}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Academic Eligibility Notes */}
                {requirements && (
                  <Card className="p-6 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary-400" />
                      Academic Eligibility Criteria
                    </h3>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block">Accepted Education Tiers:</span>
                        <span className="font-medium text-white">
                          {requirements.accepted_education_levels.map((l: string) => l.replace("-", " ")).join(", ")}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Subject Prerequisites:</span>
                        <span className="font-medium text-white">
                          {requirements.subject_prerequisites.join(", ")}
                        </span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
