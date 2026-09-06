'use client';

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Route, Layers, Network, ArrowRight, RefreshCw, Sparkles, BookOpen } from "lucide-react";
import { api, getAuthToken, setAuthToken } from "@/lib/api";
import { WhyRecommendedModal } from "@/components/WhyRecommendedModal";
import { AIAssistantDrawer } from "@/components/AIAssistantDrawer";
import { LearningPath, LearningPathItem, Profile, SkillGraph, SkillGraphNode } from "@/lib/types";
import { Tabs, Button, Card, EmptyState, Alert } from "@/components/ui";

import { RoadmapHeader } from "@/components/roadmap/RoadmapHeader";
import { RoadmapOverview } from "@/components/roadmap/RoadmapOverview";
import { PhaseNavigation } from "@/components/roadmap/PhaseNavigation";
import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";
import { SkillGraphView } from "@/components/roadmap/SkillGraphView";
import { SkillInspector } from "@/components/roadmap/SkillInspector";
import { RoadmapSkeleton } from "@/components/roadmap/RoadmapSkeleton";

function RoadmapContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // UX-002: Initialize state from URL params for deep linking and reload preservation
  const initialTab = searchParams.get("tab") === "graph" ? "graph" : "curriculum";
  const rawPhase = searchParams.get("phase");
  const initialPhase: number | "all" = rawPhase && rawPhase !== "all" && !isNaN(parseInt(rawPhase, 10))
    ? parseInt(rawPhase, 10)
    : "all";

  const [activeTab, setActiveTab] = useState<string>(initialTab); // "curriculum" | "graph"
  const [profile, setProfile] = useState<Profile | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [skillGraph, setSkillGraph] = useState<SkillGraph | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase Filtering
  const [activePhase, setActivePhase] = useState<number | "all">(initialPhase);

  // Synchronize state when browser back/forward buttons change searchParams
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab === "graph" || urlTab === "curriculum") {
      setActiveTab(urlTab);
    }
    const urlPhase = searchParams.get("phase");
    if (urlPhase === "all") {
      setActivePhase("all");
    } else if (urlPhase && !isNaN(parseInt(urlPhase, 10))) {
      setActivePhase(parseInt(urlPhase, 10));
    }
  }, [searchParams]);

  // Helper to persist stepper and tab selection into URL query parameters
  const updateUrlParams = useCallback((newTab: string, newPhase: number | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    params.set("phase", String(newPhase));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    updateUrlParams(tab, activePhase);
  };

  const handlePhaseSelect = (phase: number | "all") => {
    setActivePhase(phase);
    updateUrlParams(activeTab, phase);
  };

  // Modals & Inspector State
  const [selectedWhyItem, setSelectedWhyItem] = useState<LearningPathItem | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillGraphNode | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        await api.demoLogin();
        setAuthToken('cookie');
      }

      const [profData, pathData, graphData] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getLearningPath().catch(() => null),
        api.getSkillGraph().catch(() => null)
      ]);

      setProfile(profData);
      setLearningPath(pathData);
      setSkillGraph(graphData);
    } catch (err: any) {
      console.error("Error loading roadmap data", err);
      setError("Unable to load curriculum data. Please check the backend connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const updatedPath = await api.regenerateRoadmap();
      setLearningPath(updatedPath);
    } catch (err) {
      console.error("Failed to regenerate roadmap", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleWhyClick = (item: LearningPathItem) => {
    setSelectedWhyItem(item);
    setIsWhyModalOpen(true);
  };

  const handleSelectSkillNode = (node: SkillGraphNode) => {
    setSelectedSkill(node);
    setIsInspectorOpen(true);
  };

  const handleSelectSkillSlug = (slug: string) => {
    const found = skillGraph?.nodes.find((n) => n.slug === slug);
    if (found) {
      setSelectedSkill(found);
    }
  };

  const activeVersion = learningPath?.current_version;
  const items = activeVersion?.items || [];

  // Extract dynamic phase summary for PhaseNavigation
  const phaseMap = new Map<number, { name: string; count: number; completedCount: number }>();
  for (const it of items) {
    if (!phaseMap.has(it.phase_number)) {
      phaseMap.set(it.phase_number, { name: it.phase_name, count: 0, completedCount: 0 });
    }
    const p = phaseMap.get(it.phase_number)!;
    p.count += 1;
    if (it.is_completed) p.completedCount += 1;
  }

  const dynamicPhases = Array.from(phaseMap.entries())
    .map(([number, data]) => ({ number, ...data }))
    .sort((a, b) => a.number - b.number);

  return (
    <div className="flex flex-col w-full selection:bg-primary-500 selection:text-white">
      {/* Global Navigation */}
      

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
        {isLoading ? (
          <RoadmapSkeleton />
        ) : error ? (
          <div className="py-12 max-w-lg mx-auto text-center space-y-4">
            <Alert variant="danger" message={error} />
            <Button onClick={loadData} variant="primary" leftIcon={<RefreshCw className="h-4 w-4" />}>
              Retry Connection
            </Button>
          </div>
        ) : !items || items.length === 0 ? (
          <div className="py-12 max-w-lg mx-auto">
            <EmptyState
              icon={<Route className="h-8 w-8 text-primary-400" />}
              title="No roadmap synthesized yet"
              description="Complete the onboarding calibration to generate your structured learning roadmap."
              action={
                <Link href="/onboarding">
                  <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Start Career Onboarding
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <RoadmapHeader
              profile={profile}
              activeVersion={activeVersion}
              isRegenerating={isRegenerating}
              onRegenerate={handleRegenerate}
              onOpenAssistant={() => setIsAssistantOpen(true)}
            />

            {/* Overview KPIs */}
            <RoadmapOverview items={items} phaseCount={dynamicPhases.length} />

            {/* Main Tab Controller: Sequenced Curriculum vs Skill Dependency Graph */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
              <Tabs
                items={[
                  { id: "curriculum", label: "Sequenced Curriculum", icon: <Layers className="h-3.5 w-3.5" />, count: items.length },
                  { id: "graph", label: "Skill Dependency Graph", icon: <Network className="h-3.5 w-3.5" />, count: skillGraph?.nodes.length || 0 }
                ]}
                activeTab={activeTab}
                onChange={handleTabChange}
              />

              {activeTab === "curriculum" && (
                <div className="text-xs text-slate-400">
                  Showing {activePhase === "all" ? "all phases" : `Phase ${activePhase}`}
                </div>
              )}
            </div>

            {/* TAB 1: Sequenced Curriculum */}
            {activeTab === "curriculum" && (
              <div className="space-y-6">
                <PhaseNavigation
                  phases={dynamicPhases}
                  activePhase={activePhase}
                  onSelectPhase={handlePhaseSelect}
                />

                <RoadmapTimeline
                  items={items}
                  filterPhase={activePhase}
                  onWhyClick={handleWhyClick}
                />
              </div>
            )}

            {/* TAB 2: Interactive Skill Dependency Graph */}
            {activeTab === "graph" && (
              <div className="space-y-6">
                {skillGraph && skillGraph.nodes.length > 0 ? (
                  <SkillGraphView
                    nodes={skillGraph.nodes}
                    edges={skillGraph.edges}
                    selectedSkillSlug={selectedSkill?.slug || null}
                    onSelectSkill={handleSelectSkillNode}
                  />
                ) : (
                  <EmptyState
                    icon={<Network className="h-6 w-6 text-slate-400" />}
                    title="Skill map unavailable"
                    description="No skill graph records found for this domain."
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Skill Inspector Drawer */}
      <SkillInspector
        skill={selectedSkill}
        allNodes={skillGraph?.nodes || []}
        edges={skillGraph?.edges || []}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onSelectSkill={handleSelectSkillSlug}
      />

      {/* Why Recommended Modal */}
      <WhyRecommendedModal
        item={selectedWhyItem}
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
      />

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onPlanAdjusted={loadData}
      />
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<RoadmapSkeleton />}>
      <RoadmapContent />
    </Suspense>
  );
}

