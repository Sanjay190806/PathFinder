'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  ArrowRight,
  TrendingUp,
  Layers,
  Award,
  BookOpen,
  Wrench,
  ShieldAlert,
  Sparkles,
  GitBranch,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Info,
  IndianRupee,
  MapPin,
  Target,
  Zap,
  Star,
  Check,
  Globe
} from "lucide-react";
import { api } from "@/lib/api";
import {
  CareerDomain,
  CareerFamily,
  CareerSummary,
  CareerDetail,
  EducationFitResult,
  CareerTransitionResult,
  CareerComparisonResult,
  CareerMarketSnapshot,
  RankedPriorityResponse,
  RankedCareerItem,
  CareerTranslationResponse,
  CareerAIExplanationResponse,
  LanguageMetaItem
} from "@/lib/types";
import { Button, Card, Input, Skeleton, EmptyState } from "@/components/ui";
import LanguageSelector from "@/components/LanguageSelector";

export default function CareerExplorerPage() {
  // Navigation & Search State
  const [domains, setDomains] = useState<CareerDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Selected Career Active Exploration State
  const [selectedSlug, setSelectedSlug] = useState<string>("ai-ml-engineer");
  const [careerDetail, setCareerDetail] = useState<CareerDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Intelligent Evaluation State (Education Fit, Transitions, Comparison)
  const [educationFit, setEducationFit] = useState<EducationFitResult | null>(null);
  const [isLoadingFit, setIsLoadingFit] = useState(false);
  const [transitionData, setTransitionData] = useState<CareerTransitionResult | null>(null);
  const [transitionSourceRole, setTransitionSourceRole] = useState<string>("software-engineer");
  const [isLoadingTransition, setIsLoadingTransition] = useState(false);

  // Comparison State
  const [comparisonSlugs, setComparisonSlugs] = useState<string[]>(["ai-ml-engineer", "data-scientist"]);
  const [comparisonResult, setComparisonResult] = useState<CareerComparisonResult | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  // Phase 11 Stage 7: Market Intelligence State
  const [marketSnapshot, setMarketSnapshot] = useState<CareerMarketSnapshot | null>(null);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);

  // Phase 11 Stage 8: Priority Recommendations State
  const [rankingMode, setRankingMode] = useState<string>("EXPLORE");
  const [rankedData, setRankedData] = useState<RankedPriorityResponse | null>(null);
  const [isLoadingRanked, setIsLoadingRanked] = useState(false);
  const [selectedTargetSuccess, setSelectedTargetSuccess] = useState<string | null>(null);

  // Phase 11 Stage 10: Multilingual & Localization State
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [careerTranslation, setCareerTranslation] = useState<CareerTranslationResponse | null>(null);
  const [aiExplanation, setAiExplanation] = useState<CareerAIExplanationResponse | null>(null);
  const [isLoadingAIExplanation, setIsLoadingAIExplanation] = useState(false);

  // Active Tab View: "overview" | "market" | "recommendations" | "education-fit" | "transitions" | "compare" | "multilingual-ai"
  const [activeTab, setActiveTab] = useState<"overview" | "market" | "recommendations" | "education-fit" | "transitions" | "compare" | "multilingual-ai">("overview");

  // 1. Initial Domains Load
  useEffect(() => {
    api.getCareerDomains()
      .then((data: CareerDomain[]) => {
        if (Array.isArray(data)) setDomains(data);
      })
      .catch(() => {});
  }, []);

  // 2. Fetch Careers based on Domain / Search / Language
  useEffect(() => {
    setIsLoadingList(true);
    const params: Record<string, any> = { page_size: 30 };
    if (searchQuery) params.q = searchQuery;
    if (selectedDomain !== "all") params.domain = selectedDomain;
    if (selectedLanguage && selectedLanguage !== "en") params.language = selectedLanguage;

    api.searchCareers(params)
      .then((res: any) => {
        if (res && Array.isArray(res.items)) {
          setCareers(res.items);
          if (res.items.length > 0 && !res.items.some((c: CareerSummary) => c.slug === selectedSlug)) {
            setSelectedSlug(res.items[0].slug);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingList(false));
  }, [searchQuery, selectedDomain, selectedLanguage]);

  // Multilingual: Fetch Career Translation when slug or language changes
  useEffect(() => {
    if (!selectedSlug) return;
    api.getCareerTranslation(selectedSlug, selectedLanguage)
      .then((data: CareerTranslationResponse) => setCareerTranslation(data))
      .catch(() => setCareerTranslation(null));
  }, [selectedSlug, selectedLanguage]);

  // Multilingual: Fetch Grounded AI Explanation when tab is active
  useEffect(() => {
    if (activeTab !== "multilingual-ai" || !selectedSlug) return;
    setIsLoadingAIExplanation(true);
    api.getCareerAIExplanation(selectedSlug, selectedLanguage)
      .then((data: CareerAIExplanationResponse) => setAiExplanation(data))
      .catch(() => setAiExplanation(null))
      .finally(() => setIsLoadingAIExplanation(false));
  }, [activeTab, selectedSlug, selectedLanguage]);

  // 3. Load Detail for Selected Slug
  useEffect(() => {
    if (!selectedSlug) return;
    setIsLoadingDetail(true);
    api.getCareerDetail(selectedSlug)
      .then((detail: CareerDetail) => {
        setCareerDetail(detail);
      })
      .catch(() => {})
      .finally(() => setIsLoadingDetail(false));
  }, [selectedSlug]);

  // 4. Load Education Fit when Tab is Active
  useEffect(() => {
    if (activeTab !== "education-fit" || !selectedSlug) return;
    setIsLoadingFit(true);
    api.getCareerEducationFit(selectedSlug)
      .then((fit: EducationFitResult) => {
        setEducationFit(fit);
      })
      .catch(() => {
        setEducationFit(null);
      })
      .finally(() => setIsLoadingFit(false));
  }, [activeTab, selectedSlug]);

  // 5. Load Transitions
  useEffect(() => {
    if (activeTab !== "transitions" || !selectedSlug) return;
    setIsLoadingTransition(true);
    api.getCareerTransitions(selectedSlug, transitionSourceRole)
      .then((res: CareerTransitionResult) => {
        setTransitionData(res);
      })
      .catch(() => {
        setTransitionData(null);
      })
      .finally(() => setIsLoadingTransition(false));
  }, [activeTab, selectedSlug, transitionSourceRole]);

  // 6. Load Comparison
  const handleRunComparison = () => {
    if (comparisonSlugs.length < 2) return;
    setIsLoadingComparison(true);
    api.compareCareers(comparisonSlugs)
      .then((res: CareerComparisonResult) => {
        setComparisonResult(res);
      })
      .catch(() => {
        setComparisonResult(null);
      })
      .finally(() => setIsLoadingComparison(false));
  };

  // 7. Load Market Intelligence when Market Tab is Active
  useEffect(() => {
    if (activeTab !== "market" || !selectedSlug) return;
    setIsLoadingMarket(true);
    api.getCareerMarket(selectedSlug)
      .then((data: CareerMarketSnapshot) => {
        setMarketSnapshot(data);
      })
      .catch(() => {
        setMarketSnapshot(null);
      })
      .finally(() => setIsLoadingMarket(false));
  }, [activeTab, selectedSlug]);

  // 8. Load Priority Recommendations when Recommendations Tab is Active
  useEffect(() => {
    if (activeTab !== "recommendations") return;
    setIsLoadingRanked(true);
    api.getRankedPriorityCareers({ mode: rankingMode, limit: 12 })
      .then((data: RankedPriorityResponse) => {
        setRankedData(data);
      })
      .catch(() => {
        setRankedData(null);
      })
      .finally(() => setIsLoadingRanked(false));
  }, [activeTab, rankingMode]);

  // Handle setting a career as target destination
  const handleSelectAsTarget = (slug: string) => {
    api.selectTargetCareer({ career_slug: slug, selection_source: "CAREER_EXPLORER" })
      .then((res) => {
        setSelectedTargetSuccess(res.career_title);
        setTimeout(() => setSelectedTargetSuccess(null), 5000);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (activeTab === "compare" && !comparisonResult) {
      handleRunComparison();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-surface-dark text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-cyan mb-1">
              <Compass className="h-4 w-4" /> Global Career Taxonomy & Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interactive Career Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore 20+ multi-domain career trajectories, evaluate your education fit, and map transition pathways.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <LanguageSelector
              currentLanguage={selectedLanguage}
              onLanguageChange={(code) => setSelectedLanguage(code)}
            />
            <Link href="/onboarding">
              <Button variant="outline" size="sm">
                Start Onboarding
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">
                Learner Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* 2-Column Explorer Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Domain & Career Catalog List (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Search Input */}
            <Input
              placeholder="Search careers, skills, or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />

            {/* Domain Filter Dropdown */}
            {domains.length > 0 && (
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                aria-label="Filter by Domain"
                className="w-full bg-surface-raised border border-surface-border text-slate-200 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Domains ({domains.length} disciplines)</option>
                {domains.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name} ({d.career_count} careers)
                  </option>
                ))}
              </select>
            )}

            {/* Career Items List */}
            <div className="space-y-2 max-h-[68vh] overflow-y-auto pr-1">
              {isLoadingList ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-20 rounded-xl" />
                ))
              ) : careers.length === 0 ? (
                <EmptyState
                  icon={<Compass className="h-6 w-6 text-slate-400" />}
                  title="No careers found"
                  description="Try another search keyword or clear domain filter."
                />
              ) : (
                careers.map((c) => {
                  const isSelected = selectedSlug === c.slug;
                  return (
                    <div
                      key={c.slug}
                      onClick={() => setSelectedSlug(c.slug)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary-950/60 border-primary-500 text-white shadow-sm ring-1 ring-primary-500/50"
                          : "bg-surface-raised/40 border-surface-border text-slate-300 hover:bg-surface-raised hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-slate-400 border border-surface-border">
                              {c.domain_name}
                            </span>
                            {c.is_regulated && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                Regulated
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white">{c.canonical_name}</h4>
                        </div>
                        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-primary-400 translate-x-0.5" : "text-slate-500"}`} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {c.short_description}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Career Workspace & Intelligence Tabs (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* View Mode Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-surface-border pb-3 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === "overview"
                    ? "bg-primary-600 text-white"
                    : "text-slate-400 hover:text-white bg-surface-raised/60 border border-surface-border"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" /> Overview
              </button>
              <button
                onClick={() => setActiveTab("market")}
                className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === "market"
                    ? "bg-primary-600 text-white"
                    : "text-slate-400 hover:text-white bg-surface-raised/60 border border-surface-border"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" /> Market & Salary (IN)
              </button>
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === "recommendations"
                    ? "bg-primary-600 text-white"
                    : "text-slate-400 hover:text-white bg-surface-raised/60 border border-surface-border"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" /> AI Priority Ranking
              </button>
              <button
                onClick={() => setActiveTab("education-fit")}
                className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === "education-fit"
                    ? "bg-primary-600 text-white"
                    : "text-slate-400 hover:text-white bg-surface-raised/60 border border-surface-border"
                }`}
              >
                <Award className="h-3.5 w-3.5" /> Education Fit
              </button>
              <button
                onClick={() => setActiveTab("transitions")}
                className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === "transitions"
                    ? "bg-primary-600 text-white"
                    : "text-slate-400 hover:text-white bg-surface-raised/60 border border-surface-border"
                }`}
              >
                <GitBranch className="h-3.5 w-3.5" /> Transitions
              </button>
              <button
                onClick={() => setActiveTab("compare")}
                className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === "compare"
                    ? "bg-primary-600 text-white"
                    : "text-slate-400 hover:text-white bg-surface-raised/60 border border-surface-border"
                }`}
              >
                <Scale className="h-3.5 w-3.5" /> Comparison
              </button>
              <button
                onClick={() => setActiveTab("multilingual-ai")}
                className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === "multilingual-ai"
                    ? "bg-primary-600 text-white"
                    : "text-slate-400 hover:text-white bg-surface-raised/60 border border-surface-border"
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-sky-400" /> AI Coach ({selectedLanguage.toUpperCase()})
              </button>
            </div>

            {selectedTargetSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Successfully set <strong>{selectedTargetSuccess}</strong> as your target career destination!</span>
              </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {isLoadingDetail || !careerDetail ? (
                  <Skeleton className="h-64 rounded-2xl" />
                ) : (
                  <>
                    <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-bold text-accent-cyan px-2 py-0.5 rounded bg-surface border border-surface-border">
                              {careerDetail.domain_name}
                            </span>
                            {careerDetail.is_regulated && (
                              <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3" /> Regulated Profession
                              </span>
                            )}
                            {careerDetail.is_emerging && (
                              <span className="text-xs font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> Emerging
                              </span>
                            )}
                          </div>
                          <h2 className="text-2xl font-extrabold text-white">{careerDetail.canonical_name}</h2>
                          {careerTranslation && selectedLanguage !== "en" && (
                            <div className="mt-1 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-medium" dir={careerTranslation.direction}>
                              <Globe className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                              <span>{careerTranslation.title}</span>
                              <span className="text-[10px] text-slate-400">({careerTranslation.resolved_language})</span>
                            </div>
                          )}
                          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                            {careerTranslation && selectedLanguage !== "en" && careerTranslation.description
                              ? careerTranslation.description
                              : careerDetail.short_description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleSelectAsTarget(careerDetail.slug)}
                            className="flex items-center gap-1 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold"
                          >
                            <Target className="h-3.5 w-3.5" /> Set as Target
                          </Button>
                          <Link href={`/careers/${careerDetail.slug}`}>
                            <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs">
                              Full Page <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {careerDetail.long_description && (
                        <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-surface-border/50">
                          {careerDetail.long_description}
                        </p>
                      )}
                    </div>

                    {/* Specializations & Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Specializations */}
                      <div className="bg-surface-raised/40 border border-surface-border rounded-2xl p-5 space-y-3">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Layers className="h-4 w-4 text-indigo-400" /> Specializations ({careerDetail.specializations?.length || 0})
                        </h4>
                        <div className="space-y-2">
                          {careerDetail.specializations?.map((s) => (
                            <div key={s.slug} className="p-2.5 rounded-lg bg-surface border border-surface-border/60 text-xs">
                              <span className="font-bold text-white block">{s.name}</span>
                              {s.focus_areas && s.focus_areas.length > 0 && (
                                <span className="text-[11px] text-slate-400">
                                  Focus: {s.focus_areas.join(", ")}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Skills */}
                      <div className="bg-surface-raised/40 border border-surface-border rounded-2xl p-5 space-y-3">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Award className="h-4 w-4 text-amber-400" /> Mandatory & Recommended Skills
                        </h4>
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {careerDetail.skill_requirements?.map((sr) => (
                            <div key={sr.id} className="p-2 rounded-lg bg-surface border border-surface-border/60 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold text-white block">{sr.skill_name}</span>
                                <span className="text-[10px] text-slate-400">{sr.category}</span>
                              </div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                sr.importance === "MANDATORY" ? "bg-rose-500/15 text-rose-300" : "bg-primary-500/15 text-primary-300"
                              }`}>
                                {sr.importance}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB: MARKET & SALARY INTELLIGENCE (Phase 11 Stage 7) */}
            {activeTab === "market" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {isLoadingMarket ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 rounded-2xl" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-36 rounded-2xl" />
                      <Skeleton className="h-36 rounded-2xl" />
                      <Skeleton className="h-36 rounded-2xl" />
                    </div>
                    <Skeleton className="h-48 rounded-2xl" />
                  </div>
                ) : !marketSnapshot ? (
                  <EmptyState
                    icon={<TrendingUp className="h-6 w-6 text-slate-400" />}
                    title="Market Data Being Collected"
                    description="Verified industry compensation and regional indicators are currently being indexed."
                  />
                ) : (
                  <>
                    {/* Market Header Banner */}
                    <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-bold text-accent-cyan px-2.5 py-0.5 rounded bg-surface border border-surface-border">
                              {marketSnapshot.career_title}
                            </span>
                            <span className="text-xs font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1">
                              <Zap className="h-3 w-3" /> {marketSnapshot.hiring_sentiment} Sentiment
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-surface border border-surface-border">
                              Status: {marketSnapshot.freshness}
                            </span>
                          </div>
                          <h3 className="text-xl font-extrabold text-white">
                            {marketSnapshot.demand_trend}
                          </h3>
                          <p className="text-xs text-slate-300 mt-1">
                            India-First Market Intelligence • Remote Compatibility: <strong className="text-white">{marketSnapshot.remote_flexibility}</strong>
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 bg-surface p-3 rounded-xl border border-surface-border shrink-0">
                          <span className="text-[11px] font-medium text-slate-400">Market Viability Score</span>
                          <span className="text-2xl font-black text-accent-cyan">
                            {Math.round(marketSnapshot.overall_market_score * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Salary Intelligence Grid */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          <IndianRupee className="h-4 w-4 text-emerald-400" />
                          Compensation Benchmarks (India • INR Annual)
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Source: {marketSnapshot.salary_snapshot.source_name} (Tier {marketSnapshot.salary_snapshot.source_tier})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {/* Entry Level */}
                        <div className="p-4 rounded-xl bg-surface border border-surface-border/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">Entry Level</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-slate-400 font-mono">0-2 yrs</span>
                          </div>
                          <div className="text-lg font-extrabold text-white">
                            {marketSnapshot.salary_snapshot.entry_level?.formatted_display || "Under Review"}
                          </div>
                          <p className="text-[10px] text-slate-400">Junior & Graduate Analyst roles</p>
                        </div>

                        {/* Mid Level */}
                        <div className="p-4 rounded-xl bg-surface border border-primary-500/30 bg-primary-950/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-primary-300">Mid Level</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-300 font-mono">3-6 yrs</span>
                          </div>
                          <div className="text-lg font-extrabold text-white">
                            {marketSnapshot.salary_snapshot.mid_level?.formatted_display || "Under Review"}
                          </div>
                          <p className="text-[10px] text-slate-400">Core Individual Contributor & Lead</p>
                        </div>

                        {/* Senior Level */}
                        <div className="p-4 rounded-xl bg-surface border border-surface-border/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">Senior Level</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-slate-400 font-mono">7+ yrs</span>
                          </div>
                          <div className="text-lg font-extrabold text-white">
                            {marketSnapshot.salary_snapshot.senior_level?.formatted_display || "Under Review"}
                          </div>
                          <p className="text-[10px] text-slate-400">Staff, Principal & Practice Lead</p>
                        </div>
                      </div>
                    </div>

                    {/* Regional Hiring Hotspots */}
                    <div className="space-y-2 pt-2">
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary-400" />
                        Key Indian Metro Demand Hotspots
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {marketSnapshot.regional_demand.map((reg) => (
                          <div key={reg.region_code} className="p-3.5 rounded-xl bg-surface border border-surface-border/70 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{reg.city_name}</span>
                              <span className="text-[10px] font-bold text-accent-cyan px-1.5 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/20">
                                {reg.demand_level}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-surface-raised h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-primary-500 h-full rounded-full"
                                style={{ width: `${Math.round(reg.demand_score * 100)}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>{reg.hiring_trend}</span>
                              <span>{Math.round(reg.demand_score * 100)}% Index</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* In-Demand & Emerging Skills */}
                    {marketSnapshot.top_skills && marketSnapshot.top_skills.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-amber-400" />
                          Market-Validated High Demand Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {marketSnapshot.top_skills.map((s) => (
                            <div
                              key={s.skill_slug}
                              className="px-3 py-1.5 rounded-xl bg-surface border border-surface-border flex items-center gap-2 text-xs"
                            >
                              <span className="font-medium text-slate-200">{s.skill_name}</span>
                              {s.is_emerging ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                  Surging
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono text-slate-400">
                                  {Math.round(s.demand_score * 100)}%
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB: AI PRIORITY RECOMMENDATIONS (Phase 11 Stage 8) */}
            {activeTab === "recommendations" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Goal Mode Controls */}
                <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary-400" />
                        Personalized Career Priority Ranking
                      </h3>
                      <p className="text-xs text-slate-400">
                        Select your strategic career planning mode to re-weight recommendations.
                      </p>
                    </div>

                    {rankedData && rankedData.target_career && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-semibold">
                        <Target className="h-3.5 w-3.5" />
                        Target Goal Preserved: {rankedData.target_career.career_title}
                      </div>
                    )}
                  </div>

                  {/* Mode Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {[
                      { id: "EXPLORE", label: "Broad Exploration", desc: "Domain diverse discovery" },
                      { id: "TARGET_CAREER", label: "Target Focused", desc: "Centered on selected goal" },
                      { id: "CAREER_CHANGE", label: "Career Pivot", desc: "Maximizes transferable skills" },
                      { id: "FIRST_CAREER", label: "First Career", desc: "Entry-friendly prerequisites" },
                      { id: "SKILL_BASED", label: "Skill Match", desc: "Direct competence fit" }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setRankingMode(m.id)}
                        className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                          rankingMode === m.id
                            ? "bg-primary-600 text-white shadow-sm"
                            : "bg-surface text-slate-400 hover:text-white border border-surface-border"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Cluster Breakdown Counters */}
                  {rankedData && rankedData.cluster_breakdown && (
                    <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-surface-border/50 text-[11px]">
                      {Object.entries(rankedData.cluster_breakdown).map(([cluster, count]) => (
                        <span
                          key={cluster}
                          className="px-2 py-0.5 rounded-md bg-surface text-slate-300 border border-surface-border shrink-0"
                        >
                          <strong className="text-white">{count}</strong> {cluster.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ranked List Grid */}
                {isLoadingRanked ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-44 rounded-2xl" />
                    ))}
                  </div>
                ) : !rankedData || rankedData.ranked_careers.length === 0 ? (
                  <EmptyState
                    icon={<Compass className="h-6 w-6 text-slate-400" />}
                    title="No Ranked Careers Available"
                    description="Adjust your goal mode or explore the canonical catalog directly."
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {rankedData.ranked_careers.map((career) => {
                      const isTarget = career.is_primary_goal;

                      return (
                        <div
                          key={career.career_slug}
                          className={`rounded-2xl border p-5 space-y-3 relative transition-all ${
                            isTarget
                              ? "bg-primary-950/40 border-primary-500/80 ring-1 ring-primary-500/50"
                              : "bg-surface-raised/40 border-surface-border hover:bg-surface-raised"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface text-slate-400 border border-surface-border">
                                  {career.domain_name}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  career.cluster === "TOP_FIT"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : career.cluster === "STRONG_OPTIONS"
                                    ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                                    : career.cluster === "BRIDGE_OPTIONS"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-slate-700/50 text-slate-300 border border-slate-600"
                                }`}>
                                  {career.cluster.replace(/_/g, " ")}
                                </span>
                                {isTarget && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-500 text-white flex items-center gap-1">
                                    <Target className="h-2.5 w-2.5" /> Primary Goal
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-bold text-white">{career.career_title}</h4>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-slate-400 block">Priority</span>
                              <span className="text-base font-black text-accent-cyan">
                                {Math.round(career.priority_score * 100)}%
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {career.match_reason}
                          </p>

                          {/* Strengths & Gap preview */}
                          <div className="pt-2 border-t border-surface-border/60 text-xs space-y-1">
                            {career.top_strengths && career.top_strengths.length > 0 && (
                              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3 shrink-0" />
                                <span>Strengths: {career.top_strengths.join(", ")}</span>
                              </div>
                            )}
                            {career.primary_gap && (
                              <div className="text-[11px] text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                <span>Gap: {career.primary_gap}</span>
                              </div>
                            )}
                            {career.average_entry_salary && (
                              <div className="text-[11px] text-slate-400">
                                <span>Avg Entry: <strong className="text-white">{career.average_entry_salary}</strong></span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleSelectAsTarget(career.career_slug)}
                              className="flex-1 text-xs py-1.5 bg-primary-600 hover:bg-primary-500 text-white"
                            >
                              <Target className="h-3.5 w-3.5 mr-1" /> Select as Target
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSlug(career.career_slug);
                                setActiveTab("overview");
                              }}
                              className="text-xs py-1.5"
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EDUCATION FIT & DECISION TRACE */}
            {activeTab === "education-fit" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {isLoadingFit ? (
                  <Skeleton className="h-64 rounded-2xl" />
                ) : !educationFit ? (
                  <EmptyState
                    icon={<Award className="h-6 w-6 text-slate-400" />}
                    title="Profile Authentication Required"
                    description="Log in to view personalized education compatibility and DecisionTrace audits."
                  />
                ) : (
                  <>
                    {/* Education Fit Summary Card */}
                    <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase ${
                              educationFit.education_fit === "DIRECT_FIT"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : educationFit.education_fit === "STRONG_FIT"
                                ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                                : educationFit.education_fit === "REGULATED_PREREQUISITE_MISSING"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}>
                              {educationFit.education_fit.replace(/_/g, ' ')}
                            </span>
                            {educationFit.is_regulated_blocked && (
                              <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                                <ShieldAlert className="h-3.5 w-3.5" /> Statutory License Required
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-white">
                            Academic Alignment Analysis for {educationFit.career_name}
                          </h3>
                        </div>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed bg-surface/50 p-4 rounded-xl border border-surface-border/50">
                        {educationFit.education_reason}
                      </p>

                      {/* Bridge Skills if needed */}
                      {educationFit.recommended_bridge_skills && educationFit.recommended_bridge_skills.length > 0 && (
                        <div className="pt-2">
                          <span className="text-xs font-bold text-slate-300 block mb-2">Recommended Bridge Skills:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {educationFit.recommended_bridge_skills.map((s, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-surface text-amber-300 border border-amber-500/30 font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* DecisionTrace Audit Trail */}
                    <div className="bg-surface-raised/40 border border-surface-border rounded-2xl p-5 space-y-3">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-accent-cyan" /> Transparent DecisionTrace Audit Log
                      </h4>
                      <p className="text-xs text-slate-400">
                        Multi-signal deterministic decision chain verifying statutory checks and academic streams.
                      </p>

                      <div className="divide-y divide-surface-border/50 border border-surface-border rounded-xl overflow-hidden bg-surface">
                        {educationFit.decision_trace?.map((step, idx) => (
                          <div key={idx} className="p-3.5 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-accent-cyan font-mono text-[11px]">{step.step}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-surface-raised text-slate-300 border border-surface-border">
                                Verdict: {step.verdict}
                              </span>
                            </div>
                            <div className="text-slate-300">
                              <span className="font-semibold text-slate-400">Signal:</span> {step.signal}
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              <span className="font-semibold text-slate-500">Evidence:</span> {step.evidence}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 3: TRANSITIONS */}
            {activeTab === "transitions" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" /> Career Transition Intelligence
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Calculate transferable skills and bridge ramp-up times into {careerDetail?.canonical_name}.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">From:</span>
                      <select
                        value={transitionSourceRole}
                        onChange={(e) => setTransitionSourceRole(e.target.value)}
                        aria-label="Transition From Role"
                        className="bg-surface border border-surface-border text-xs rounded-xl px-2.5 py-1.5 text-slate-200"
                      >
                        <option value="software-engineer">Software Engineer</option>
                        <option value="graphic-designer">Graphic Designer</option>
                        <option value="video-editor">Video Editor</option>
                        <option value="data-scientist">Data Scientist</option>
                        <option value="automotive-mechanic">Automotive Mechanic</option>
                        <option value="nurse">Registered Nurse</option>
                      </select>
                    </div>
                  </div>

                  {isLoadingTransition ? (
                    <Skeleton className="h-40 rounded-xl" />
                  ) : !transitionData ? (
                    <p className="text-xs text-slate-400">No transition data available for selected pair.</p>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-surface p-3 rounded-xl border border-surface-border">
                          <span className="text-slate-400 block mb-0.5">Feasibility</span>
                          <span className="font-bold text-emerald-400 text-sm">{transitionData.feasibility}</span>
                        </div>
                        <div className="bg-surface p-3 rounded-xl border border-surface-border">
                          <span className="text-slate-400 block mb-0.5">Estimated Ramp</span>
                          <span className="font-bold text-white text-sm">{transitionData.estimated_ramp_weeks} weeks</span>
                        </div>
                        <div className="bg-surface p-3 rounded-xl border border-surface-border col-span-2 sm:col-span-1">
                          <span className="text-slate-400 block mb-0.5">Transferable Count</span>
                          <span className="font-bold text-accent-cyan text-sm">{transitionData.transferable_skills.length} skills</span>
                        </div>
                      </div>

                      {/* Transferable Skills */}
                      {transitionData.transferable_skills.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-semibold text-emerald-300">Transferable Skills:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {transitionData.transferable_skills.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bridge Skills */}
                      {transitionData.bridge_skills.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-semibold text-amber-300">Bridge Skills to Acquire:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {transitionData.bridge_skills.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {transitionData.transition_notes && (
                        <p className="text-xs text-slate-300 bg-surface/60 p-3 rounded-xl border border-surface-border">
                          {transitionData.transition_notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: COMPARE */}
            {activeTab === "compare" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <Scale className="h-4 w-4 text-indigo-400" /> Side-by-Side Comparison
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Evaluating educational entry barriers, tools, work environment, and skill overlap.
                      </p>
                    </div>

                    <Button size="sm" onClick={handleRunComparison} className="flex items-center gap-1">
                      <RefreshCw className="h-3.5 w-3.5" /> Re-compare
                    </Button>
                  </div>

                  {isLoadingComparison ? (
                    <Skeleton className="h-48 rounded-xl" />
                  ) : !comparisonResult ? (
                    <p className="text-xs text-slate-400">Select at least 2 careers to compare.</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Matrix Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {comparisonResult.careers.map((c) => (
                          <div key={c.career_slug} className="p-4 rounded-xl bg-surface border border-surface-border space-y-2.5 text-xs">
                            <h5 className="font-bold text-white text-sm">{c.career_name}</h5>
                            <div className="space-y-1 text-slate-300">
                              <div><span className="text-slate-400">Domain:</span> {c.domain}</div>
                              <div><span className="text-slate-400">Entry Barrier:</span> <span className="font-semibold text-accent-cyan">{c.education_entry_barrier}</span></div>
                              <div><span className="text-slate-400">Remote:</span> {c.remote_compatibility}</div>
                              <div><span className="text-slate-400">Environment:</span> {c.work_environment}</div>
                            </div>
                            <div>
                              <span className="text-slate-400 block mb-1">Mandatory Skills:</span>
                              <div className="flex flex-wrap gap-1">
                                {c.mandatory_skills.map((s, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-slate-300 border border-surface-border">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Overlap Summary */}
                      <div className="p-3.5 rounded-xl bg-surface/60 border border-surface-border text-xs space-y-1">
                        <span className="font-bold text-white block">Comparison Summary:</span>
                        <p className="text-slate-300">{comparisonResult.comparison_summary}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: MULTILINGUAL AI COACH */}
            {activeTab === "multilingual-ai" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                        <Globe className="h-4 w-4" /> Grounded Multilingual Career AI Coach
                      </div>
                      <h3 className="text-xl font-extrabold text-white">
                        {careerDetail?.canonical_name} — Career Intelligence in {selectedLanguage.toUpperCase()}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Synthesized from canonical taxonomy, verified education requirements, and live market intelligence.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <LanguageSelector
                        currentLanguage={selectedLanguage}
                        onLanguageChange={(code) => setSelectedLanguage(code)}
                      />
                    </div>
                  </div>

                  {isLoadingAIExplanation ? (
                    <div className="space-y-4">
                      <Skeleton className="h-32 rounded-xl" />
                      <Skeleton className="h-24 rounded-xl" />
                      <Skeleton className="h-20 rounded-xl" />
                    </div>
                  ) : !aiExplanation ? (
                    <div className="p-8 text-center bg-surface rounded-xl border border-surface-border">
                      <Globe className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-300">Explanation could not be loaded for this language.</p>
                      <Button
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          if (selectedSlug) {
                            setIsLoadingAIExplanation(true);
                            api.getCareerAIExplanation(selectedSlug, selectedLanguage)
                              .then((d) => setAiExplanation(d))
                              .catch(() => setAiExplanation(null))
                              .finally(() => setIsLoadingAIExplanation(false));
                          }
                        }}
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6" dir={aiExplanation.direction}>
                      {/* AI Grounded Narrative Card */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/30 via-slate-900/60 to-surface border border-sky-500/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-sky-400" /> Grounded Career Synopsis
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                            {aiExplanation.language_name} ({aiExplanation.language_code})
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                          {aiExplanation.explanation}
                        </p>
                      </div>

                      {/* Preserved Latin Technical Terms Badge List */}
                      {aiExplanation.preserved_technical_terms && aiExplanation.preserved_technical_terms.length > 0 && (
                        <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
                          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            Preserved Industry & Technical Standards (Latin Script)
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {aiExplanation.preserved_technical_terms.map((term, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-md bg-slate-800 text-sky-300 border border-slate-700 text-xs font-mono font-medium"
                                dir="ltr"
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-400 italic">
                            Technical terms and tools remain in standard English notation for global employability fidelity.
                          </p>
                        </div>
                      )}

                      {/* Grounded Database Facts */}
                      {aiExplanation.grounded_facts && aiExplanation.grounded_facts.length > 0 && (
                        <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
                          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5 text-sky-400" />
                            Verified Canonical Facts Grounding This Summary
                          </div>
                          <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                            {aiExplanation.grounded_facts.map((fact, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {fact}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Universal Decision Trace */}
                      {aiExplanation.decision_trace && (
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                          <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                            <Zap className="h-3 w-3 text-amber-400" />
                            Universal Decision Trace: {aiExplanation.decision_trace.trace_id}
                          </div>
                          <div>Algorithm: {aiExplanation.decision_trace.algorithm_version}</div>
                          <div>Grounding Source: {aiExplanation.decision_trace.grounding_source}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
