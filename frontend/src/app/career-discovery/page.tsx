'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Compass, 
  Search, 
  Sparkles, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  Filter, 
  BookOpen,
  GraduationCap
} from "lucide-react";
import { api, getAuthToken, setAuthToken } from "@/lib/api";
import { Button, Input, Card, Alert, Skeleton } from "@/components/ui";
import { Navbar } from "@/components/Navbar";

interface DiscoveredCareer {
  career_slug: string;
  career_role: string;
  domain_category: string;
  fit_tier: string;
  overall_score: number;
  education_alignment: number;
  skill_alignment: number;
  interest_alignment: number;
  practical_evidence_score: number;
  pathway_feasibility: number;
  market_demand_signal: number;
  strengths: string[];
  missing_prerequisites: string[];
  reasoning: string;
  pathway_summary: string;
}

export default function CareerDiscoveryPage() {
  const [careers, setCareers] = useState<DiscoveredCareer[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTier, setActiveTier] = useState<string>("all");

  useEffect(() => {
    async function loadDiscovery() {
      setIsLoading(true);
      setError(null);
      try {
        let token = getAuthToken();
        if (!token) {
          await api.demoLogin();
          setAuthToken('cookie');
        }

        const [profData, discoveryData] = await Promise.all([
          api.getProfile().catch(() => null),
          api.discoverCareers().catch(() => [])
        ]);

        setProfile(profData);
        setCareers(discoveryData || []);
      } catch (err: any) {
        setError(err.message || "Failed to load career discovery.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDiscovery();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await api.discoverCareers(searchQuery);
      setCareers(data || []);
    } catch (err: any) {
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCareers = careers.filter((c) => {
    const matchesTier = activeTier === "all" || c.fit_tier.toLowerCase().replace(" ", "-") === activeTier;
    const matchesSearch = 
      !searchQuery ||
      c.career_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reasoning.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Strong Fit":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Potential Fit":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "Stretch Path":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-500 selection:text-white">
      <Navbar user={profile} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-b from-surface-raised/80 to-surface/40 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-xl border border-primary-500/30 bg-primary-950/60 px-3 py-1.5 text-xs font-semibold text-primary-300">
              <Sparkles className="h-4 w-4 text-accent-cyan" />
              <span>🇮🇳 India-First Career Discovery & Pathway Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Discover careers tailored to your education & background.
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Based on your Indian curriculum, subject combinations, verified practical skills, and goals, PathFinder transparently evaluates every potential engineering and technical trajectory.
            </p>

            {profile && (
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="text-slate-400">Current Academic Context:</span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-raised border border-surface-border font-medium text-white flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-primary-400" />
                  {profile.qualification || profile.specialization || profile.education_level || "Higher Education"}
                </span>
                {profile.board && (
                  <span className="px-2.5 py-1 rounded-lg bg-surface-raised border border-surface-border text-slate-300">
                    {profile.board}
                  </span>
                )}
                <Link href="/onboarding" className="text-xs text-primary-400 hover:underline ml-2">
                  Edit Profile &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Search & Tier Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 max-w-lg flex gap-2">
              <Input
                placeholder="Search careers, technologies, or keywords (e.g. AI, Cloud, VLSI)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              />
              <Button type="submit" variant="secondary" size="md">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-1.5 bg-surface-raised/60 p-1.5 rounded-2xl border border-surface-border text-xs">
              {[
                { id: "all", label: "All Fits" },
                { id: "strong-fit", label: "Strong Fit" },
                { id: "potential-fit", label: "Potential Fit" },
                { id: "stretch-path", label: "Stretch" },
                { id: "alternative-path", label: "Alternative" }
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setActiveTier(tier.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    activeTier === tier.id
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && <Alert variant="danger" message={error} onClose={() => setError(null)} />}

        {/* Careers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-surface-raised/40 border border-surface-border animate-pulse p-6" />
            ))}
          </div>
        ) : filteredCareers.length === 0 ? (
          <Card className="p-12 text-center space-y-4 max-w-md mx-auto">
            <Layers className="h-10 w-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No matching career paths found</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your search keyword or clearing the fit filter.
            </p>
            <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(""); setActiveTier("all"); }}>
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map((c) => (
              <Card 
                key={c.career_slug} 
                className="flex flex-col justify-between p-6 hover:border-slate-500 transition-all shadow-lg hover:shadow-2xl group"
              >
                <div className="space-y-4">
                  {/* Header & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold tracking-wider text-accent-cyan uppercase">
                        {c.domain_category}
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary-300 transition-colors mt-0.5">
                        {c.career_role}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${getTierBadge(c.fit_tier)}`}>
                        {c.fit_tier}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        {Math.round(c.overall_score * 100)}% Fit
                      </div>
                    </div>
                  </div>

                  {/* Algorithmic Reasoning */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {c.reasoning}
                  </p>

                  {/* Strengths & Alignments */}
                  <div className="space-y-1.5 pt-2 border-t border-surface-border">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Strengths
                    </span>
                    {c.strengths.slice(0, 2).map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{s}</span>
                      </div>
                    ))}
                  </div>

                  {/* Missing Prerequisites */}
                  {c.missing_prerequisites && c.missing_prerequisites.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Prerequisites to Develop
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.missing_prerequisites.map((sk) => (
                          <span key={sk} className="px-2 py-0.5 rounded-md bg-surface border border-surface-border text-[11px] text-amber-300 font-mono">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-5 mt-4 border-t border-surface-border flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-primary-400" />
                    Demand: {Math.round(c.market_demand_signal * 100)}%
                  </span>

                  <Link href={`/career-pathways/${c.career_slug}`}>
                    <Button size="sm" variant="primary" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      Explore Pathway
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
