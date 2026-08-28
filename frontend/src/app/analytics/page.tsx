'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { AIAssistantDrawer } from '@/components/AIAssistantDrawer';
import { api } from '@/lib/api';
import { AnalyticsSummary, Profile } from '@/lib/types';
import { BarChart2, Clock, CheckCircle2, Award, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(console.error);
    api.getAnalytics().then(setAnalytics).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar
        user={profile}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan">Learning Intelligence</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Skill Analytics & Growth Velocity
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Quantitative metrics evaluating your curriculum progression and mastery confidence.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-surface-border bg-surface p-5">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-accent-emerald" /> Completed Resources
            </span>
            <span className="text-2xl font-extrabold text-white font-mono mt-2 block">
              {analytics?.completed_resources || 0} / {analytics?.total_resources || 0}
            </span>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface p-5">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary-400" /> Learning Hours
            </span>
            <span className="text-2xl font-extrabold text-white font-mono mt-2 block">
              {analytics?.hours_completed || 0}h
            </span>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface p-5">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-accent-cyan" /> Velocity Index
            </span>
            <span className="text-2xl font-extrabold text-white font-mono mt-2 block">
              {analytics?.weekly_velocity?.toFixed(1) || '1.0'}x
            </span>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface p-5">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <Award className="h-4 w-4 text-accent-purple" /> Acceptance Rate
            </span>
            <span className="text-2xl font-extrabold text-white font-mono mt-2 block">
              {analytics?.acceptance_rate || 95}%
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary-400" />
              Competency Mastery vs Target Benchmarks
            </h3>
            <span className="text-xs text-gray-400 font-mono">Target: 85% Mastery</span>
          </div>

          <div className="space-y-4">
            {analytics?.skill_mastery && analytics.skill_mastery.length > 0 ? (
              analytics.skill_mastery.map((sm, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-200">{sm.skill} <span className="text-gray-500 font-normal">({sm.category})</span></span>
                    <span className="font-mono text-accent-cyan">{(sm.confidence * 100).toFixed(0)}% / 85%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-raised overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full transition-all"
                      style={{ width: `${Math.min(100, (sm.confidence / 0.85) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 text-center py-6">
                No skill calibration records yet.
              </div>
            )}
          </div>
        </div>
      </main>

      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
}
