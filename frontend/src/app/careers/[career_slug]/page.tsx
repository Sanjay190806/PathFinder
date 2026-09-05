'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  Wrench,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Scale,
  Clock,
  Target,
  FileCheck2,
  GraduationCap
} from "lucide-react";
import { api } from "@/lib/api";
import { CareerDetail } from "@/lib/types";
import { Button, Card, Skeleton } from "@/components/ui";

export default function CareerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const careerSlug = params?.career_slug as string;

  const [career, setCareer] = useState<CareerDetail | null>(null);
  const [eligibility, setEligibility] = useState<any | null>(null);
  const [pathways, setPathways] = useState<any[]>([]);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [fitData, setFitData] = useState<any | null>(null);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!careerSlug) return;
    setIsLoading(true);
    setError(null);

    Promise.allSettled([
      api.getCareerDetail(careerSlug),
      api.getCareerRequirements(careerSlug),
      api.getCareerPathways(careerSlug),
      api.getCareerAlternatives(careerSlug, 4),
      api.getCareerPathwayFit(careerSlug)
    ])
      .then(([detailRes, reqRes, pathRes, altRes, fitRes]) => {
        if (detailRes.status === "fulfilled") {
          setCareer(detailRes.value);
        } else {
          throw new Error("Failed to load career details");
        }

        if (reqRes.status === "fulfilled") {
          setEligibility(reqRes.value);
        }

        if (pathRes.status === "fulfilled" && Array.isArray(pathRes.value)) {
          setPathways(pathRes.value);
          if (pathRes.value.length > 0) {
            setSelectedPathwayId(pathRes.value[0].pathway_id);
          }
        }

        if (altRes.status === "fulfilled" && altRes.value?.alternatives) {
          setAlternatives(altRes.value.alternatives);
        }

        if (fitRes.status === "fulfilled") {
          setFitData(fitRes.value);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load career details");
      })
      .finally(() => setIsLoading(false));
  }, [careerSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-dark py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl md:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="min-h-screen bg-surface-dark py-20 px-4 text-center max-w-xl mx-auto space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 text-rose-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Career Not Found</h2>
        <p className="text-sm text-slate-400">
          {error || `The career with slug '${careerSlug}' could not be located in our canonical knowledge base.`}
        </p>
        <div className="pt-4">
          <Link href="/onboarding">
            <Button variant="outline">Back to Career Explorer</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activePathway = pathways.find(p => p.pathway_id === selectedPathwayId) || pathways[0];

  return (
    <div className="min-h-screen bg-surface-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/onboarding" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Explorer
            </Link>
            <span>/</span>
            <span className="text-slate-500">{career.domain_name || "Domain"}</span>
            <span>/</span>
            <span className="text-accent-cyan font-medium">{career.canonical_name}</span>
          </div>

          <Link href={`/careers/compare?roles=${career.slug}`}>
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-surface-border hover:border-accent-cyan">
              <Scale className="h-3.5 w-3.5 text-accent-cyan" /> Compare with Other Roles
            </Button>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="bg-surface-raised/60 border border-surface-border rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-surface text-xs font-semibold text-accent-cyan border border-surface-border">
                  {career.domain_name}
                </span>
                {career.family_name && (
                  <span className="px-2.5 py-1 rounded-lg bg-surface text-xs font-medium text-slate-300 border border-surface-border">
                    {career.family_name}
                  </span>
                )}
                {career.is_regulated && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> Statutory Regulated
                  </span>
                )}
                {career.is_emerging && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Emerging Discipline
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {career.canonical_name}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                {career.short_description}
              </p>

              {career.aliases && career.aliases.length > 0 && (
                <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="font-semibold text-slate-400">Also known as:</span>
                  {career.aliases.map((alias, idx) => (
                    <span key={idx} className="bg-surface px-2 py-0.5 rounded text-slate-300 border border-surface-border/50">
                      {alias}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0 pt-2 sm:pt-0">
              <Link href={`/onboarding`}>
                <Button className="flex items-center gap-2">
                  Build Adaptive Roadmap <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-surface-border/60 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Remote Compatibility</span>
              <span className="font-bold text-white text-sm">{career.remote_compatibility || "Medium"}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Work Environment</span>
              <span className="font-bold text-white text-sm">{career.work_environment || "Office / Studio"}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Specializations</span>
              <span className="font-bold text-white text-sm">{career.specializations?.length || 0} tracks</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Scope</span>
              <span className="font-bold text-white text-sm">{career.country_scope || "Global"}</span>
            </div>
          </div>
        </div>

        {/* Personalized Fit Card (Stage 6) */}
        {fitData && (
          <div className="bg-surface-raised/50 border border-surface-border rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary-400 mb-1">
                  <Target className="h-4 w-4" /> Personalized Career Fit Intelligence
                </div>
                <h3 className="text-xl font-bold text-white">
                  Match Category:{" "}
                  <span className={
                    fitData.fit_category === "STRONG_FIT" ? "text-emerald-400" :
                    fitData.fit_category === "GOOD_FIT" ? "text-primary-400" :
                    fitData.fit_category === "BRIDGE_REQUIRED" ? "text-amber-400" : "text-slate-300"
                  }>
                    {fitData.fit_category.replace(/_/g, " ")}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Overall Fit Score</span>
                  <span className="text-2xl font-black text-white">{Math.round(fitData.overall_fit_score * 100)}%</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-xs text-slate-300 font-mono">
                  {fitData.confidence_level} Confidence
                </div>
              </div>
            </div>

            {/* 8 Dimension Mini-Bars */}
            {fitData.dimensions && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {Object.entries(fitData.dimensions).map(([dimName, dim]: [string, any]) => (
                  <div key={dimName} className="p-3 rounded-xl bg-surface/60 border border-surface-border text-xs space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 capitalize">{dimName.replace('_fit', '').replace('_', ' ')}</span>
                      <span className={
                        dim.status === "STRONG" ? "text-emerald-400 font-bold" :
                        dim.status === "MODERATE" ? "text-amber-400" :
                        dim.status === "UNKNOWN" ? "text-slate-500" : "text-rose-400"
                      }>
                        {dim.status}
                      </span>
                    </div>
                    <div className="w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dim.status === "STRONG" ? "bg-emerald-500" :
                          dim.status === "MODERATE" ? "bg-amber-500" :
                          dim.status === "UNKNOWN" ? "bg-slate-700" : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.round((dim.score ?? 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommended Next Actions */}
            {fitData.recommended_next_actions && fitData.recommended_next_actions.length > 0 && (
              <div className="pt-2 border-t border-surface-border/60 text-xs">
                <span className="font-semibold text-slate-300 block mb-1.5">Recommended Actions to Qualify:</span>
                <div className="flex flex-wrap gap-2">
                  {fitData.recommended_next_actions.map((act: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-300 font-medium">
                      → {act}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Regulated Profession Notice Banner (if applicable) */}
        {career.is_regulated && (
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-3.5">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <h4 className="font-bold text-amber-300">Statutory Regulatory Requirements</h4>
              <p className="text-amber-200/80 leading-relaxed">
                {career.regulatory_requirement || "This profession is governed by statutory licensing authorities and strict educational mandates."}
              </p>
            </div>
          </div>
        )}

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Requirements & Pathways */}
          <div className="lg:col-span-2 space-y-8">
            {/* Multi-Pathway Progression (Stage 4) */}
            {pathways && pathways.length > 0 && (
              <div className="bg-surface-raised/40 border border-surface-border rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-accent-cyan" /> Education & Career Pathways
                  </h3>
                  <span className="text-xs text-slate-400">{pathways.length} route(s) defined</span>
                </div>

                {/* Pathway Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-surface-border pb-3">
                  {pathways.map((p: any) => (
                    <button
                      key={p.pathway_id}
                      onClick={() => setSelectedPathwayId(p.pathway_id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        activePathway?.pathway_id === p.pathway_id
                          ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30"
                          : "bg-surface text-slate-400 border border-surface-border hover:text-white"
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>

                {/* Active Pathway Details */}
                {activePathway && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Duration: <strong className="text-white">{activePathway.duration_estimate}</strong></span>
                      <span>Difficulty: <strong className="text-white">{activePathway.difficulty_level}</strong></span>
                      <span className="px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-300 font-mono text-[10px]">
                        {activePathway.pathway_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{activePathway.description}</p>

                    {/* Step by Step Timeline */}
                    <div className="space-y-3 pt-2">
                      {activePathway.steps?.map((step: any) => (
                        <div key={step.step_number} className="p-3.5 rounded-xl bg-surface border border-surface-border text-xs flex gap-3 items-start">
                          <div className="h-6 w-6 rounded-full bg-accent-cyan/15 text-accent-cyan font-bold flex items-center justify-center shrink-0 text-[11px]">
                            {step.step_number}
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{step.title}</span>
                              <span className="text-[11px] text-slate-400">{step.estimated_weeks} wks</span>
                            </div>
                            {step.description && <p className="text-[11px] text-slate-400">{step.description}</p>}
                            {step.skills_to_acquire && step.skills_to_acquire.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {step.skills_to_acquire.map((s: string, sIdx: number) => (
                                  <span key={sIdx} className="px-2 py-0.5 rounded bg-surface-dark border border-surface-border text-[10px] text-slate-300">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Granular Career Requirements (Stage 4) */}
            {eligibility && eligibility.requirements && eligibility.requirements.length > 0 && (
              <div className="bg-surface-raised/40 border border-surface-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileCheck2 className="h-5 w-5 text-emerald-400" /> Statutory & Prerequisite Requirements
                  </h3>
                  <span className="text-xs text-slate-400">
                    {eligibility.satisfied_count} of {eligibility.total_requirements} satisfied
                  </span>
                </div>

                <div className="space-y-2.5">
                  {eligibility.requirements.map((req: any) => (
                    <div
                      key={req.requirement_id}
                      className="p-3.5 rounded-xl bg-surface border border-surface-border text-xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{req.requirement_name}</span>
                          {req.mandatory && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">
                              Mandatory
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-500 uppercase">{req.category}</span>
                        </div>
                        {req.learner_evidence && (
                          <p className="text-[11px] text-emerald-400">✓ {req.learner_evidence}</p>
                        )}
                        {req.gap_notes && (
                          <p className="text-[11px] text-slate-400">{req.gap_notes}</p>
                        )}
                      </div>

                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 ${
                        req.status === "SATISFIED" ? "bg-emerald-500/15 text-emerald-400" :
                        req.status === "PARTIALLY_SATISFIED" ? "bg-amber-500/15 text-amber-400" :
                        req.status === "UNKNOWN" ? "bg-slate-800 text-slate-400" : "bg-rose-500/15 text-rose-400"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Skills, Alternatives & Compare */}
          <div className="space-y-6">
            {/* Alternative & Adjacent Careers (Stage 5) */}
            {alternatives && alternatives.length > 0 && (
              <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-400" /> Alternative Careers
                  </h4>
                  <Link href={`/careers/compare?roles=${career.slug}`} className="text-[11px] text-accent-cyan hover:underline">
                    Compare Matrix
                  </Link>
                </div>
                <div className="space-y-2">
                  {alternatives.map((alt: any) => (
                    <Link
                      key={alt.career_id}
                      href={`/careers/${alt.slug}`}
                      className="block p-2.5 rounded-xl border border-surface-border bg-surface/50 hover:bg-surface hover:border-primary-500/50 transition-all text-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {alt.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-dark text-accent-cyan font-mono">
                          {Math.round(alt.similarity_score * 100)}% match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{alt.rationale}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Tools & Technologies */}
            {career.tools && career.tools.length > 0 && (
              <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-emerald-400" /> Standard Industry Tools
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {career.tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-surface text-xs font-mono text-slate-300 border border-surface-border"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Expectations */}
            {career.portfolio_expectations && (
              <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-5 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" /> Portfolio Expectations
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {career.portfolio_expectations}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
