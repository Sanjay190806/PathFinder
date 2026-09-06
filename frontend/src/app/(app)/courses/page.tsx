"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  Layers,
  Award,
  Play,
  FileText,
  Check,
  ArrowRight
} from "lucide-react";
import { api, getAuthToken, setAuthToken } from "@/lib/api";
import { Card, Button, Badge, ProgressBar } from "@/components/ui";
import { LearningPathItem, LearningPath, ResourceItem } from "@/lib/types";
import { formatTimeHours, getToolBadges, cleanVerifiedUrl } from "@/lib/utils";

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<"enrolled" | "explore">("enrolled");
  const [pathItems, setPathItems] = useState<LearningPathItem[]>([]);
  const [allResources, setAllResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");

  useEffect(() => {
    async function loadCourseData() {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          await api.demoLogin();
          setAuthToken("cookie");
        }

        const [pathData, resData] = await Promise.all([
          api.getLearningPath().catch(() => null),
          api.discoverResources().catch(() => [])
        ]);

        if (pathData?.current_version?.items) {
          setPathItems(pathData.current_version.items);
        }
        if (Array.isArray(resData)) {
          setAllResources(resData);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourseData();
  }, []);

  const completedCount = pathItems.filter((i) => i.is_completed).length;
  const totalEstimatedHours = pathItems.reduce((acc, i) => acc + (i.estimated_hours || 0), 0);
  const progressPercent = pathItems.length > 0 ? Math.round((completedCount / pathItems.length) * 100) : 0;

  // Filter explore catalog
  const filteredCatalog = allResources.filter((res) => {
    const matchesSearch =
      !searchQuery ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.provider_id && res.provider_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.competencies && res.competencies.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (res.topics && res.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      res.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === "all" || res.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    const matchesPrice =
      selectedPrice === "all" ||
      (selectedPrice === "free" && (res.price_type === "GENUINELY_FREE" || res.price_type === "Free" || res.price_type === "free")) ||
      (selectedPrice === "paid" && (res.price_type === "PAID" || res.price_type === "paid" || res.price_type === "Subscription"));

    const matchesTier =
      selectedTier === "all" ||
      (res.source_tier && res.source_tier.toString() === selectedTier);

    const matchesProvider =
      selectedProvider === "all" ||
      (res.provider_id && res.provider_id.toLowerCase() === selectedProvider.toLowerCase()) ||
      res.provider.toLowerCase().includes(selectedProvider.toLowerCase());

    return matchesSearch && matchesDifficulty && matchesPrice && matchesTier && matchesProvider;
  });

  // Helper for provider tier badge
  const renderTierBadge = (tier?: number, providerId?: string, providerName?: string) => {
    const isIgot = providerId === "igot_karmayogi" || providerName?.toLowerCase().includes("karmayogi");
    if (isIgot) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
          <span>🏛️</span>
          <span>iGOT Karmayogi • Govt of India</span>
        </span>
      );
    }
    if (tier === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30">
          <span>🏛️</span>
          <span>Tier 1 • Govt & Academic</span>
        </span>
      );
    }
    if (tier === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
          <span>💻</span>
          <span>Tier 2 • Official Tech Provider</span>
        </span>
      );
    }
    if (tier === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30">
          <span>🌐</span>
          <span>Tier 3 • Global EdTech</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-800 dark:text-red-300 border border-red-500/30">
        <span>📺</span>
        <span>Tier 4 • Video Learning</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <GraduationCap className="h-4 w-4" /> Academic & Career Learning Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight">
            Courses & Curricula Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Integrated multi-source learning from iGOT Karmayogi, NPTEL, Microsoft Learn, Google, AWS, and verified global institutions.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-medium">Curriculum Progress</div>
            <div className="text-sm font-bold text-foreground">
              {completedCount} / {pathItems.length} Modules ({progressPercent}%)
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab("enrolled")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === "enrolled"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          <Layers className="h-4 w-4" />
          My Enrolled Courses ({pathItems.length})
        </button>
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === "explore"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          <Search className="h-4 w-4" />
          Unified Course Catalog ({allResources.length})
        </button>
      </div>

      {/* Tab 1: My Enrolled Courses */}
      {activeTab === "enrolled" && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="h-48 rounded-2xl bg-card border border-border animate-pulse p-6" />
              ))}
            </div>
          ) : pathItems.length === 0 ? (
            <Card className="p-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No Courses Enrolled Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Generate your personalized career roadmap through onboarding to sequence your verified curriculum courses.
              </p>
              <Link href="/onboarding">
                <Button size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start Onboarding
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pathItems.map((item) => (
                <Card
                  key={item.id}
                  className={`p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                    item.is_completed ? "border-success/30 bg-success/5" : "border-border bg-card"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={item.is_completed ? "success" : "neutral"} size="sm">
                        Phase {item.phase_number}: {item.phase_name}
                      </Badge>
                      {item.is_completed ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {formatTimeHours(item.estimated_hours)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                      {item.resource_title}
                    </h3>

                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                      <span className="font-semibold text-foreground/90">{item.resource_provider}</span>
                      <span>&bull;</span>
                      <span className="capitalize">{item.difficulty}</span>
                    </p>

                    {/* Detected Tool Badges */}
                    {(() => {
                      const tools = getToolBadges(item.resource_title, item.resource_description);
                      if (tools.length === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {tools.map((t, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${t.color}`}
                            >
                              <span>{t.icon}</span>
                              <span>{t.name}</span>
                            </span>
                          ))}
                        </div>
                      );
                    })()}

                    {item.skills && item.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.skills.slice(0, 3).map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-surface-muted border border-border text-[11px] font-mono text-foreground/80"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-5 border-t border-border mt-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/courses/${item.resource_id || item.id}/syllabus`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full" leftIcon={<FileText className="h-3.5 w-3.5" />}>
                          Syllabus
                        </Button>
                      </Link>
                      <Link href={`/resources/${item.resource_id || item.id}`} className="flex-1">
                        <Button
                          variant={item.is_completed ? "secondary" : "primary"}
                          size="sm"
                          className="w-full"
                          leftIcon={<Play className="h-3.5 w-3.5" />}
                        >
                          {item.is_completed ? "Review" : "Learn"}
                        </Button>
                      </Link>
                    </div>

                    {(() => {
                      const directUrl = cleanVerifiedUrl(item.resource_url);
                      if (!directUrl) return null;
                      const isIgot = item.resource_provider?.toLowerCase().includes("karmayogi") || directUrl.includes("igotkarmayogi");
                      return (
                        <a
                          href={directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-primary hover:underline pt-1 text-center"
                        >
                          <span>{isIgot ? "View on iGOT Karmayogi" : `Open Official ${item.resource_provider} Course`}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      );
                    })()}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Course Catalog & Discovery */}
      {activeTab === "explore" && (
        <div className="space-y-6">
          {/* Multi-Source Tier Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-border/60">
            <button
              onClick={() => setSelectedTier("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTier === "all"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              All Sources ({allResources.length})
            </button>
            <button
              onClick={() => setSelectedTier("1")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTier === "1"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>🏛️</span>
              <span>Tier 1: Govt & Institutional (iGOT, NPTEL)</span>
            </button>
            <button
              onClick={() => setSelectedTier("2")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTier === "2"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>💻</span>
              <span>Tier 2: Tech Vendors (Microsoft, Google, AWS, Cisco, IBM)</span>
            </button>
            <button
              onClick={() => setSelectedTier("3")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTier === "3"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>🌐</span>
              <span>Tier 3: Global EdTech (Coursera, edX, Udemy)</span>
            </button>
            <button
              onClick={() => setSelectedTier("4")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTier === "4"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>📺</span>
              <span>Tier 4: Video Learning</span>
            </button>
          </div>

          {/* Controls: Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search courses, iGOT competencies, providers, or target technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                aria-label="Filter by Provider"
                className="bg-card border border-input text-foreground text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all" className="bg-card text-foreground">All Providers</option>
                <option value="igot_karmayogi" className="bg-card text-foreground">🏛️ iGOT Karmayogi (Govt of India)</option>
                <option value="nptel" className="bg-card text-foreground">🎓 NPTEL (IITs / MoE)</option>
                <option value="swayam" className="bg-card text-foreground">🎓 SWAYAM</option>
                <option value="microsoft_learn" className="bg-card text-foreground">💻 Microsoft Learn</option>
                <option value="google_cloud" className="bg-card text-foreground">💻 Google Cloud / AI</option>
                <option value="aws_skill_builder" className="bg-card text-foreground">💻 AWS Skill Builder</option>
                <option value="cisco_networking_academy" className="bg-card text-foreground">💻 Cisco Networking Academy</option>
                <option value="ibm_skillsbuild" className="bg-card text-foreground">💻 IBM SkillsBuild</option>
                <option value="coursera" className="bg-card text-foreground">🌐 Coursera</option>
                <option value="edx" className="bg-card text-foreground">🌐 edX</option>
                <option value="youtube" className="bg-card text-foreground">📺 YouTube</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                aria-label="Filter by Difficulty"
                className="bg-card border border-input text-foreground text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all" className="bg-card text-foreground">All Difficulties</option>
                <option value="beginner" className="bg-card text-foreground">Beginner</option>
                <option value="intermediate" className="bg-card text-foreground">Intermediate</option>
                <option value="advanced" className="bg-card text-foreground">Advanced</option>
              </select>

              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                aria-label="Filter by Pricing"
                className="bg-card border border-input text-foreground text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all" className="bg-card text-foreground">All Pricing</option>
                <option value="free" className="bg-card text-foreground">Free Only (Govt & Open)</option>
                <option value="paid" className="bg-card text-foreground">Paid Courses</option>
              </select>
            </div>
          </div>

          {/* Catalog Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="h-48 rounded-2xl bg-card border border-border animate-pulse p-6" />
              ))}
            </div>
          ) : filteredCatalog.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-foreground">No matching courses found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your source tier or search parameters.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCatalog.map((res) => {
                const isIgot = res.provider_id === "igot_karmayogi" || res.provider?.toLowerCase().includes("karmayogi");
                const directUrl = cleanVerifiedUrl(res.canonical_url || res.url);

                return (
                  <Card key={res.id} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow border-border bg-card">
                    <div className="space-y-3">
                      {/* Top Badges: Tier & Pricing */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {renderTierBadge(res.source_tier, res.provider_id, res.provider)}
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                          {res.price_type === "GENUINELY_FREE" ? "100% Free" : (res.price_type || "Free")}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                        {res.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {res.description}
                      </p>

                      {/* Explainability Callout: Why Recommended */}
                      {res.recommendation_reasons && res.recommendation_reasons.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-[11px] text-foreground/90 space-y-1">
                          <div className="font-semibold text-primary flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Why Recommended
                          </div>
                          <p className="text-muted-foreground leading-tight">
                            {res.recommendation_reasons[0]}
                          </p>
                        </div>
                      )}

                      {/* Competencies Tags (iGOT or Canonical) */}
                      {res.competencies && res.competencies.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Target Competencies
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {res.competencies.slice(0, 3).map((comp, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-[11px] font-medium text-foreground/90"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detected Tool Badges */}
                      {(() => {
                        const tools = getToolBadges(res.title, res.description);
                        if (tools.length === 0) return null;
                        return (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {tools.map((t, idx) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${t.color}`}
                              >
                                <span>{t.icon}</span>
                                <span>{t.name}</span>
                              </span>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Provider info & duration */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pt-1">
                        <span className="font-semibold text-foreground/90">{res.provider}</span>
                        <span>&bull;</span>
                        <span>{formatTimeHours(res.estimated_hours)}</span>
                        <span>&bull;</span>
                        <span className="capitalize">{res.difficulty}</span>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-border mt-5 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        {res.id ? (
                          <Link href={`/courses/${res.id}/syllabus`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full" leftIcon={<FileText className="h-3.5 w-3.5" />}>
                              Syllabus
                            </Button>
                          </Link>
                        ) : (
                          <span className="flex-1" />
                        )}
                        <Link href={`/resources/${res.id}`} className="flex-1">
                          <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                            Inspect
                          </Button>
                        </Link>
                      </div>

                      {/* Direct verified external course link */}
                      {directUrl && (
                        <a
                          href={directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                            isIgot
                              ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                              : "text-primary hover:underline"
                          }`}
                        >
                          <span>{isIgot ? "View on iGOT Karmayogi" : `Open Official ${res.provider} Course`}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
