'use client';

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  Building2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";
import { api } from "@/lib/api";
import { Badge, Card } from "@/components/ui";

interface OpportunityOut {
  id: string;
  slug: string;
  title: string;
  company_name: string;
  role_category: string;
  required_skills: string[];
  preferred_skills: string[];
  min_experience_level: string;
  location_type: string;
  salary_range: string;
  description: string;
  opportunity_type: string;
  country: string;
  state?: string;
  city?: string;
  min_education_stage?: string;
  eligible_streams?: string[];
  application_url?: string;
  source?: string;
  provider?: string;
  verification_status?: string;
  freshness?: string;
}

interface OpportunityMatchOut {
  opportunity: OpportunityOut;
  match_score: number;
  match_level: string;
  factor_breakdown: Record<string, number>;
  missing_skills: string[];
  match_reasons: string[];
  blockers: string[];
}

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<"recommended" | "discover">("recommended");
  const [recommended, setRecommended] = useState<OpportunityMatchOut[]>([]);
  const [discovered, setDiscovered] = useState<OpportunityOut[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [appliedIds, setAppliedIds] = useState<Record<string, string>>({});
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, selectedCity, selectedType]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "recommended") {
        const matches = await api.getRecommendedOpportunities();
        setRecommended(matches || []);
      } else {
        const params: Record<string, string> = {};
        if (selectedCity !== "all") params.city = selectedCity;
        if (selectedType !== "all") params.opportunity_type = selectedType;
        if (searchQuery) params.career = searchQuery;
        const opps = await api.discoverOpportunities(params);
        setDiscovered(opps || []);
      }
    } catch (err) {
      console.warn("Could not load opportunities", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (oppId: string, url?: string) => {
    setApplyingId(oppId);
    try {
      const res = await api.applyOpportunity(oppId, { cover_note: "Applied via PathFinder Intelligence Dashboard" });
      setAppliedIds((prev) => ({ ...prev, [oppId]: res.status || "applied" }));
      if (url) {
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Application error", err);
    } finally {
      setApplyingId(null);
    }
  };

  const filteredRecommended = recommended.filter((m) => {
    const opp = m.opportunity;
    const matchesSearch =
      !searchQuery ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.role_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || opp.city === selectedCity;
    const matchesType = selectedType === "all" || opp.opportunity_type === selectedType;
    return matchesSearch && matchesCity && matchesType;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16 pt-4 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-950 via-slate-900 to-primary-900/60 p-6 md:p-8 border border-surface-border shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-900/80 px-3 py-1 text-xs font-semibold text-primary-300 border border-primary-700/50">
            <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Phase 9 — India-First Opportunity & Job Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Verified Career Opportunities & Internships
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time opportunities grounded in your educational stage, verified skills, and roadmap readiness.
            Senior roles are rigorously filtered to respect your current qualification level.
          </p>
        </div>
      </div>

      {/* Control Tabs & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-surface-raised/80 rounded-xl border border-surface-border w-fit">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "recommended"
                ? "bg-primary-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Recommended for You
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "discover"
                ? "bg-primary-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Explore All Listings
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search role or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface border border-surface-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 w-48 sm:w-56"
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-surface border border-surface-border rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="all">All Cities</option>
            <option value="Chennai">Chennai</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pan-India">Pan-India / Remote</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-surface border border-surface-border rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="Internship">Internship</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Competition">Competition / Fellowship</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-56 rounded-2xl bg-surface-raised/40 animate-pulse border border-surface-border" />
          ))}
        </div>
      ) : activeTab === "recommended" ? (
        <div className="space-y-4">
          {filteredRecommended.length === 0 ? (
            <Card className="p-8 text-center bg-surface-raised/30 border border-surface-border">
              <Briefcase className="h-10 w-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Matching Opportunities Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No active listings match your current filters. Try resetting the city or keyword filters, or explore all listings.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRecommended.map((item) => {
                const opp = item.opportunity;
                const isApplied = !!appliedIds[opp.id];
                return (
                  <Card key={opp.id} className="p-5 bg-surface border border-surface-border flex flex-col justify-between hover:border-primary-700/60 transition-all shadow-md">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-primary-400 tracking-wider uppercase">
                            {opp.role_category}
                          </span>
                          <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                            {opp.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-slate-500" />
                              {opp.company_name}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-500" />
                              {opp.city || opp.state || opp.country} ({opp.location_type})
                            </span>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right shrink-0">
                          <div className="inline-flex items-center gap-1 rounded-xl bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-1 text-xs font-extrabold text-emerald-400">
                            <TrendingUp className="h-3 w-3" />
                            <span>{item.match_score}% Match</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.match_level}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {opp.description}
                      </p>

                      {/* Required Skills */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Required Competencies:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {opp.required_skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-surface-raised px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-surface-border"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Why it matches & Blockers */}
                      <div className="rounded-xl bg-surface-raised/60 p-2.5 border border-surface-border space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>{item.match_reasons[0] || "Educational profile aligned"}</span>
                        </div>
                        {item.blockers && item.blockers.length > 0 && (
                          <div className="flex items-center gap-1.5 text-amber-400 text-[10px]">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <span>{item.blockers[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-surface-border/60">
                      <div className="flex items-center gap-2">
                        <Badge variant="success" size="sm">
                          {opp.verification_status}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-200">
                          {opp.salary_range}
                        </span>
                      </div>

                      <button
                        onClick={() => handleApply(opp.id, opp.application_url)}
                        disabled={applyingId === opp.id || isApplied}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow ${
                          isApplied
                            ? "bg-emerald-600 text-white cursor-default"
                            : "bg-primary-600 hover:bg-primary-500 text-white"
                        }`}
                      >
                        <span>{isApplied ? "Applied in Tracker" : "Apply & Handoff"}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discovered.map((opp) => {
              const isApplied = !!appliedIds[opp.id];
              return (
                <Card key={opp.id} className="p-5 bg-surface border border-surface-border flex flex-col justify-between hover:border-slate-600 transition-all shadow-sm">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider">
                          {opp.role_category}
                        </span>
                        <Badge variant="cyan" size="sm">
                          {opp.opportunity_type}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-white tracking-tight mt-1">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {opp.company_name} • {opp.city || opp.country}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {opp.required_skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="rounded bg-surface-raised px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-surface-border">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-surface-border/60">
                    <span className="text-xs font-semibold text-slate-300">
                      {opp.salary_range}
                    </span>
                    <button
                      onClick={() => handleApply(opp.id, opp.application_url)}
                      disabled={isApplied}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary-400 hover:text-primary-300"
                    >
                      <span>{isApplied ? "Saved" : "Apply"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
