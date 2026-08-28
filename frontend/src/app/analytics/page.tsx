'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { AIAssistantDrawer } from "@/components/AIAssistantDrawer";
import { api, getAuthToken } from "@/lib/api";
import { AnalyticsSummary, Profile } from "@/lib/types";

import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { GrowthSummary } from "@/components/analytics/GrowthSummary";
import { SkillConfidenceChart } from "@/components/analytics/SkillConfidenceChart";
import { SkillMasteryOverview } from "@/components/analytics/SkillMasteryOverview";
import { PhaseProgressChart } from "@/components/analytics/PhaseProgressChart";
import { SkillStrengths } from "@/components/analytics/SkillStrengths";
import { SkillGaps } from "@/components/analytics/SkillGaps";
import { LearningVelocity } from "@/components/analytics/LearningVelocity";
import { AnalyticsNextAction } from "@/components/analytics/AnalyticsNextAction";
import { AnalyticsSkeleton } from "@/components/analytics/AnalyticsSkeleton";
import { AnalyticsErrorState } from "@/components/analytics/AnalyticsErrorState";
import { AnalyticsEmptyState } from "@/components/analytics/AnalyticsEmptyState";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        const demoRes = await api.demoLogin();
        localStorage.setItem("pathfinder_token", demoRes.access_token);
      }

      const [profData, analyticsData] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getAnalytics()
      ]);

      setProfile(profData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error("Error loading growth analytics", err);
      setError(err.message || "Failed to load growth analytics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasData = analytics && (analytics.total_resources > 0 || analytics.skill_mastery.length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Global Navigation */}
      <Navbar
        user={profile}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
        {isLoading ? (
          <AnalyticsSkeleton />
        ) : error ? (
          <AnalyticsErrorState error={error} onRetry={loadData} />
        ) : !hasData ? (
          <AnalyticsEmptyState />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <AnalyticsHeader
              profile={profile}
              onOpenAssistant={() => setIsAssistantOpen(true)}
            />

            {/* Growth Summary KPIs */}
            <GrowthSummary analytics={analytics} />

            {/* Main Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Confidence Recharts Bar Chart */}
              <SkillConfidenceChart skills={analytics.skill_mastery} />

              {/* Skill Mastery Overview List */}
              <SkillMasteryOverview skills={analytics.skill_mastery} />
            </div>

            {/* Phase Progression */}
            {analytics.phase_progress && analytics.phase_progress.length > 0 && (
              <PhaseProgressChart phases={analytics.phase_progress} />
            )}

            {/* Strengths, Gaps & Velocity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkillStrengths strengths={analytics.strengths} />
              <SkillGaps weaknesses={analytics.weaknesses} />
              <LearningVelocity
                velocityScore={analytics.weekly_velocity || 1.0}
                streakDays={analytics.current_streak_days || 1}
                activePhase={analytics.active_phase}
              />
            </div>

            {/* Recommended Next Action */}
            <AnalyticsNextAction activePhase={analytics.active_phase} />
          </div>
        )}
      </main>

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onPlanAdjusted={loadData}
      />
    </div>
  );
}
