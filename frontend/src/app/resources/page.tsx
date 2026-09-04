"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Globe2,
  Clock,
  Award,
  Video,
  Layers,
  GraduationCap
} from "lucide-react";
import { api } from "@/lib/api";

interface ResourceItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  provider: string;
  url: string;
  resource_type: string;
  difficulty: string;
  estimated_hours: number;
  quality_score: number;
  career_relevance: string[];
  format: string;
  skills: string[];
  language: string;
  price_type: string;
  learning_cost: number;
  certificate_cost: string;
  verification_status: string;
  source_tier: number;
  source: string;
  recommendation_reasons?: string[];
  is_preferred_language?: boolean;
  is_exact_gap_match?: boolean;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCareer, setSelectedCareer] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery.trim()) params.skill = searchQuery.trim();
      if (selectedCareer) params.career = selectedCareer;
      if (selectedSkill) params.skill = selectedSkill;
      if (selectedLanguage) params.language = selectedLanguage;
      if (selectedPrice) params.price = selectedPrice;

      const data = await api.discoverResources(params);
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCareer, selectedLanguage, selectedPrice]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleVerifyOnDemand = async (resourceId: string) => {
    setVerifyingId(resourceId);
    setVerifyMessage(null);
    try {
      const result = await api.verifyResource(resourceId);
      // Update local state with latest verification status
      setResources((prev) =>
        prev.map((item) =>
          item.id === resourceId
            ? {
                ...item,
                verification_status: result.verification_status,
                price_type: result.price_classification,
                learning_cost: result.learning_cost,
                certificate_cost: result.certificate_cost
              }
            : item
        )
      );
      setVerifyMessage(`Verified: ${result.evidence_notes}`);
      setTimeout(() => setVerifyMessage(null), 4000);
    } catch (err) {
      console.error("Verification error:", err);
      setVerifyMessage("On-demand verification failed. Check connectivity.");
      setTimeout(() => setVerifyMessage(null), 4000);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/60 p-6 md:p-8 border border-indigo-500/20 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                <ShieldCheck className="h-4 w-4" />
                Phase 9 Live Intelligence & Verification
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Verified Learning Resources
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl">
                Explore curated, trustworthy learning modules across Indian government portals (NPTEL, SWAYAM),
                global tech leaders, and regional language playlists with verified pricing and accessibility.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchResources}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh Catalog
              </button>
            </div>
          </div>

          {verifyMessage && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{verifyMessage}</span>
            </div>
          )}
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, skill (e.g., Python, SQL, Deep Learning, Docker)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
            {/* Career Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Career Role</label>
              <select
                value={selectedCareer}
                onChange={(e) => setSelectedCareer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Career Pathways</option>
                <option value="ai-ml-engineer">AI/ML Engineer</option>
                <option value="software-engineer">Software Engineer</option>
                <option value="data-scientist">Data Scientist</option>
                <option value="cloud-devops-engineer">Cloud / DevOps Engineer</option>
                <option value="vlsi-hardware-engineer">VLSI Hardware Engineer</option>
                <option value="cybersecurity-analyst">Cybersecurity Analyst</option>
              </select>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Learning Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Languages</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Price & Enrollment</label>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Pricing Tiers</option>
                <option value="GENUINELY_FREE">Genuinely Free (No Paywall)</option>
                <option value="FREE">Free & Free to Enroll</option>
                <option value="PAID">Paid Only</option>
              </select>
            </div>

            {/* Quick Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCareer("");
                  setSelectedSkill("");
                  setSelectedLanguage("");
                  setSelectedPrice("");
                  setSearchQuery("");
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {resources.length} verified learning resources</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified Links
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Globe2 className="h-3.5 w-3.5" /> India-First Multi-Language
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-56 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
              <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-300">No resources found matching your exact filter</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try loosening your filters or resetting the search query to view alternative recommended pathways.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((item) => {
                const isVerified = item.verification_status === "VERIFIED";
                const isTier1 = item.source_tier === 1;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 shadow-md group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                              isTier1
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                                : item.source_tier === 4
                                ? "bg-red-500/10 text-red-300 border-red-500/20"
                                : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                            }`}
                          >
                            {isTier1 ? "Tier 1: Institutional" : item.source_tier === 4 ? "Tier 4: YouTube" : `Tier ${item.source_tier}`}
                          </span>

                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.language}
                          </span>
                        </div>

                        {/* Trust Badge */}
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{item.verification_status}</span>
                        </div>
                      </div>

                      {/* Title & Provider */}
                      <div>
                        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-indigo-400 mt-0.5 font-medium">{item.provider}</p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Reasons & Skill Tags */}
                      {item.recommendation_reasons && item.recommendation_reasons.length > 0 && (
                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                          {item.recommendation_reasons.slice(0, 2).map((r, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                              <Sparkles className="h-3 w-3 text-indigo-400 shrink-0" />
                              <span className="truncate">{r}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skills Covered */}
                      <div className="flex flex-wrap gap-1.5">
                        {item.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Pricing & Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          {item.price_type === "GENUINELY_FREE" ? (
                            <span className="text-emerald-400 font-bold">100% Genuinely Free</span>
                          ) : item.price_type === "FREE_TO_ENROLL_PAID_CERTIFICATE" ? (
                            <span>Learning Free • Cert Optional</span>
                          ) : item.price_type === "YOUTUBE_FREE_CONTENT" ? (
                            <span className="text-red-300">Free on YouTube</span>
                          ) : (
                            <span className="text-amber-400">{item.price_type}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.estimated_hours} hrs • {item.difficulty}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyOnDemand(item.id)}
                          disabled={verifyingId === item.id}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
                          title="Verify URL and pricing accessibility"
                        >
                          {verifyingId === item.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
