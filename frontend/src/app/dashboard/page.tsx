'use client';

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Target, ArrowRight, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { api, getAuthToken } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { WhyRecommendedModal } from "@/components/WhyRecommendedModal";
import { AIAssistantDrawer } from "@/components/AIAssistantDrawer";
import { LearningPath, Profile, LearningPathItem, AnalyticsSummary } from "@/lib/types";
import { Button, Card, EmptyState, Alert } from "@/components/ui";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NextStepCard } from "@/components/dashboard/NextStepCard";
import { ProgressSnapshot } from "@/components/dashboard/ProgressSnapshot";
import { CurrentPath } from "@/components/dashboard/CurrentPath";
import { SkillSnapshot } from "@/components/dashboard/SkillSnapshot";
import { AdaptiveUpdates } from "@/components/dashboard/AdaptiveUpdates";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawers
  const [selectedWhyItem, setSelectedWhyItem] = useState<LearningPathItem | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        // Auto-login to demo if not authenticated
        const demoRes = await api.demoLogin();
        localStorage.setItem("pathfinder_token", demoRes.access_token);
      }

      const [profData, pathData, analData] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getLearningPath().catch(() => null),
        api.getAnalytics().catch(() => null)
      ]);

      setProfile(profData);
      setLearningPath(pathData);
      setAnalytics(analData);
    } catch (err: any) {
      console.error("Error loading dashboard data", err);
      setError("Unable to load learner state. Please check the backend connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      await loadData();
    } catch (err) {
      console.error("Reset demo error", err);
    }
  };

  const handleWhyClick = (item: LearningPathItem) => {
    setSelectedWhyItem(item);
    setIsWhyModalOpen(true);
  };

  const activeVersion = learningPath?.current_version;
  const items = activeVersion?.items || [];
  // Dominant next best step: First incomplete and unlocked item, or first incomplete item
  const nextItem = items.find((it) => !it.is_completed && !it.is_locked) || items.find((it) => !it.is_completed) || items[0] || null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Global Navigation */}
      <Navbar
        user={profile}
        onResetDemo={profile?.user_id ? handleResetDemo : undefined}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
        {isLoading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="py-12 max-w-lg mx-auto text-center space-y-4">
            <Alert variant="danger" message={error} />
            <Button onClick={loadData} variant="primary" leftIcon={<RefreshCw className="h-4 w-4" />}>
              Retry Connection
            </Button>
          </div>
        ) : !profile?.primary_goal?.target_role && (!items || items.length === 0) ? (
          /* Empty State: Unonboarded user */
          <div className="py-12 max-w-lg mx-auto">
            <EmptyState
              icon={<Target className="h-8 w-8 text-primary-400" />}
              title="Let's build your career path"
              description="You haven't calibrated your technical destination yet. Complete the 2-minute diagnostic onboarding to generate your personalized roadmap."
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
          /* Authoritative Dashboard Layout */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* 1. Header & Greeting */}
            <DashboardHeader
              profile={profile}
              activeVersion={activeVersion}
              onResetDemo={profile?.user_id ? handleResetDemo : undefined}
              onOpenAssistant={() => setIsAssistantOpen(true)}
            />

            {/* 2. Dominant Hero: Your Next Step */}
            <NextStepCard item={nextItem} onWhyClick={handleWhyClick} />

            {/* 3. Progress Snapshot KPIs */}
            <ProgressSnapshot analytics={analytics} learningPath={learningPath} />

            {/* 4. Two-Column Layout: Active Path & Growth / Adaptive Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (2 Cols): Sequenced Path Preview */}
              <div className="lg:col-span-2 space-y-6">
                <CurrentPath items={items} onWhyClick={handleWhyClick} />
                <QuickActions onOpenAssistant={() => setIsAssistantOpen(true)} />
              </div>

              {/* Right Column (1 Col): Skill Matrix & Adaptive Feed */}
              <div className="space-y-6">
                <SkillSnapshot analytics={analytics} />
                <AdaptiveUpdates activeVersion={activeVersion} />
              </div>
            </div>
          </div>
        )}
      </main>

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
