'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Sparkles, Target, Clock, Zap, BookOpen, CheckCircle2, ArrowRight, Play, RefreshCw, BarChart2, Flame, Award, ChevronRight } from 'lucide-react';
import { api, getAuthToken } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { WhyRecommendedModal } from '@/components/WhyRecommendedModal';
import { AdaptiveAlert } from '@/components/AdaptiveAlert';
import { AIAssistantDrawer } from '@/components/AIAssistantDrawer';
import { ResourceCard } from '@/components/ResourceCard';
import { LearningPath, Profile, LearningPathItem, AnalyticsSummary } from '@/lib/types';
import { formatTimeHours } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers
  const [selectedWhyItem, setSelectedWhyItem] = useState<LearningPathItem | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [dismissAdaptiveAlert, setDismissAdaptiveAlert] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        // Auto-login to demo if not authenticated
        const demoRes = await api.demoLogin();
        localStorage.setItem('pathfinder_token', demoRes.access_token);
      }

      const [profData, pathData, analData] = await Promise.all([
        api.getProfile(),
        api.getLearningPath(),
        api.getAnalytics()
      ]);

      setProfile(profData);
      setLearningPath(pathData);
      setAnalytics(analData);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      await loadData();
    } catch (err) {
      console.error('Reset demo error', err);
    }
  };

  const handleWhyClick = (item: LearningPathItem) => {
    setSelectedWhyItem(item);
    setIsWhyModalOpen(true);
  };

  const activeVersion = learningPath?.current_version;
  const items = activeVersion?.items || [];
  const nextItem = items.find(it => !it.is_completed) || items[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar
        user={profile}
        onResetDemo={profile?.user_id ? handleResetDemo : undefined}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Adaptive Alert Banner if Roadmap has adapted */}
        {activeVersion && activeVersion.version_number > 1 && !dismissAdaptiveAlert && (
          <AdaptiveAlert
            trigger={activeVersion.trigger}
            changeSummary={activeVersion.change_summary || "Roadmap adapted to match your latest learning feedback."}
            versionNumber={activeVersion.version_number}
            onDismiss={() => setDismissAdaptiveAlert(true)}
          />
        )}

        {/* Top Welcome & KPI Section */}
        <section className="rounded-3xl border border-surface-border bg-gradient-to-r from-surface via-surface-raised/60 to-surface p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan">Personalized Roadmap</span>
                {profile?.user_id && (
                  <span className="rounded-md bg-accent-cyan/15 px-2 py-0.5 text-[10px] font-bold text-accent-cyan border border-accent-cyan/30">
                    Version {activeVersion?.version_number || 1}.0 Active
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Good day, {profile?.full_name || 'Learner'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary-400" />
                Target Role: <span className="text-white font-semibold">{profile?.primary_goal?.target_role || 'AI/ML Engineer'}</span>
                <span className="text-gray-600">?</span>
                <span>{profile?.weekly_hours || 10}h / week pace</span>
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-surface-border bg-surface-raised/60 p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-center gap-1">
                  <Flame className="h-3 w-3 text-accent-amber" /> Streak
                </span>
                <span className="text-lg font-extrabold text-white mt-0.5 block font-mono">
                  {analytics?.current_streak_days || 5} Days
                </span>
              </div>

              <div className="rounded-2xl border border-surface-border bg-surface-raised/60 p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-accent-emerald" /> Progress
                </span>
                <span className="text-lg font-extrabold text-white mt-0.5 block font-mono">
                  {analytics?.overall_progress_percentage || 0}%
                </span>
              </div>

              <div className="rounded-2xl border border-surface-border bg-surface-raised/60 p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-primary-400" /> Hours
                </span>
                <span className="text-lg font-extrabold text-white mt-0.5 block font-mono">
                  {analytics?.hours_completed || 0} / {analytics?.total_learning_hours || 0}h
                </span>
              </div>

              <div className="rounded-2xl border border-surface-border bg-surface-raised/60 p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-center gap-1">
                  <Award className="h-3 w-3 text-accent-purple" /> Acceptance
                </span>
                <span className="text-lg font-extrabold text-white mt-0.5 block font-mono">
                  {analytics?.acceptance_rate || 95}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Continue Learning Spotlight */}
        {nextItem && (
          <section className="relative overflow-hidden rounded-3xl border border-primary-500/40 bg-gradient-to-r from-primary-950/70 via-surface to-surface p-6 sm:p-8 shadow-2xl shadow-primary-500/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-primary-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Next Recommended Step
                  </span>
                  <span className="text-xs font-semibold text-primary-300">
                    Phase {nextItem.phase_number}: {nextItem.phase_name}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {nextItem.resource_title}
                </h3>
                <p className="mt-2 text-xs text-gray-300 leading-relaxed line-clamp-2">
                  {nextItem.resource_description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1 font-semibold text-white">
                    <Clock className="h-3.5 w-3.5 text-primary-400" />
                    {formatTimeHours(nextItem.estimated_hours)}
                  </span>
                  <span>?</span>
                  <span>Provider: {nextItem.resource_provider}</span>
                  <span>?</span>
                  <span>Difficulty: {nextItem.difficulty}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={() => handleWhyClick(nextItem)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-surface-border bg-surface-raised px-4 py-3 text-xs font-semibold text-accent-cyan hover:bg-surface-border transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Why Recommended?
                </button>
                <Link
                  href={`/resources/${nextItem.resource_id}`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-primary-500/25 hover:brightness-110 transition-all"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Start Learning
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 2-Column Section: Active Curriculum & Skill Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 cols): Up Next in Your Roadmap */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Your Adaptive Learning Path</h3>
                <p className="text-xs text-gray-400">Topologically ordered to strictly respect skill prerequisites</p>
              </div>
              <Link
                href="/roadmap"
                className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                View Full Roadmap ({items.length} Items)
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {items.slice(0, 5).map((item) => (
                <ResourceCard
                  key={item.id}
                  item={item}
                  onWhyClick={handleWhyClick}
                />
              ))}
            </div>
          </div>

          {/* Right Column (1 col): Skill Confidence & AI Insights */}
          <div className="space-y-6">
            {/* Skill Mastery Breakdown */}
            <div className="rounded-3xl border border-surface-border bg-surface p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary-400" />
                  Skill Confidence Matrix
                </h3>
                <Link href="/analytics" className="text-[11px] font-semibold text-primary-400 hover:underline">
                  Details
                </Link>
              </div>

              <div className="space-y-3">
                {analytics?.skill_mastery && analytics.skill_mastery.length > 0 ? (
                  analytics.skill_mastery.map((sm, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-gray-300">{sm.skill}</span>
                        <span className="font-mono text-gray-400">{(sm.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface-raised overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full transition-all"
                          style={{ width: `${sm.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 py-4 text-center">
                    Completing courses and diagnostic assessments will calibrate your skill confidence.
                  </div>
                )}
              </div>

              {/* Strengths and Weaknesses */}
              <div className="mt-5 pt-4 border-t border-surface-border/80 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Top Strengths:</span>
                  <span className="font-semibold text-accent-emerald">{analytics?.strengths?.slice(0, 2).join(', ') || 'Python, SQL'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Priority Gaps:</span>
                  <span className="font-semibold text-accent-amber">{analytics?.weaknesses?.slice(0, 2).join(', ') || 'Deep Learning, MLOps'}</span>
                </div>
              </div>
            </div>

            {/* AI Coach Banner */}
            <div className="rounded-3xl border border-accent-purple/30 bg-gradient-to-br from-purple-950/30 via-surface to-surface p-6 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-purple/20 text-accent-purple border border-accent-purple/40">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">AI Learning Coach</h4>
                  <p className="text-[11px] text-gray-400">Contextual Tutor & Schedule Adaptor</p>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-300 leading-relaxed">
                Need to adjust for busy exam weeks, review prerequisite math, or request custom portfolio project ideas?
              </p>

              <button
                onClick={() => setIsAssistantOpen(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-surface-raised border border-surface-border px-4 py-2.5 text-xs font-bold text-white hover:bg-surface-border transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
                Ask AI Coach
              </button>
            </div>
          </div>
        </div>
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
