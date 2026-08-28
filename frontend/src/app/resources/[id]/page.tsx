'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { AIAssistantDrawer } from '@/components/AIAssistantDrawer';
import { api } from '@/lib/api';
import { ResourceDetail, Profile } from '@/lib/types';
import { formatTimeHours } from '@/lib/utils';
import { ArrowLeft, ExternalLink, Clock, CheckCircle2, Star, ThumbsUp, AlertTriangle, FastForward, Slash, Sparkles } from 'lucide-react';

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.id as string;

  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const loadResource = async () => {
    setIsLoading(true);
    try {
      const [resData, profData] = await Promise.all([
        api.getResource(resourceId),
        api.getProfile()
      ]);
      setResource(resData);
      setProfile(profData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resourceId) loadResource();
  }, [resourceId]);

  const handleToggleComplete = async () => {
    if (!resource) return;
    const newStatus = resource.learner_status === 'completed' ? 'not_started' : 'completed';
    try {
      await api.updateProgress({
        resource_id: resource.id,
        status: newStatus,
        time_spent_minutes: Math.round(resource.estimated_hours * 60)
      });
      await loadResource();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedback = async (type: string, rating: number) => {
    if (!resource) return;
    try {
      await api.submitFeedback({
        resource_id: resource.id,
        feedback_type: type,
        rating,
        idempotency_key: `fb-${resource.id}-${Date.now()}`
      });
      setFeedbackSuccess(`Feedback recorded (${type.replace('_', ' ')}). Roadmap adapted!`);
      setTimeout(() => setFeedbackSuccess(null), 4000);
      await loadResource();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !resource) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar user={profile} />
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
          Loading learning resource details...
        </div>
      </div>
    );
  }

  const isCompleted = resource.learner_status === 'completed';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar
        user={profile}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto w-full space-y-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {feedbackSuccess && (
          <div className="rounded-2xl border border-accent-emerald/40 bg-accent-emerald/10 p-4 text-xs font-semibold text-accent-emerald flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {feedbackSuccess}
          </div>
        )}

        <div className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-primary-950 text-primary-300 border border-primary-800">
                  {resource.resource_type.toUpperCase()}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-surface-raised text-gray-300 border border-surface-border">
                  {resource.difficulty}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-surface-raised text-gray-300 border border-surface-border">
                  Provider: {resource.provider}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {resource.title}
              </h1>
            </div>

            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 transition-colors shrink-0"
            >
              Open External Course
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {resource.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-surface-border">
            <div className="rounded-xl bg-surface-raised/40 p-3 text-center border border-surface-border">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Duration</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5 block">{formatTimeHours(resource.estimated_hours)}</span>
            </div>
            <div className="rounded-xl bg-surface-raised/40 p-3 text-center border border-surface-border">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Quality Score</span>
              <span className="text-sm font-bold text-accent-cyan font-mono mt-0.5 block">{(resource.quality_score * 100).toFixed(0)}%</span>
            </div>
            <div className="rounded-xl bg-surface-raised/40 p-3 text-center border border-surface-border">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Format</span>
              <span className="text-sm font-bold text-accent-purple capitalize mt-0.5 block">{resource.format}</span>
            </div>
            <div className="rounded-xl bg-surface-raised/40 p-3 text-center border border-surface-border">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Status</span>
              <span className={`text-sm font-bold mt-0.5 block capitalize ${isCompleted ? 'text-accent-emerald' : 'text-gray-300'}`}>
                {resource.learner_status?.replace('_', ' ') || 'Not Started'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-surface-border bg-surface p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Skills Taught & Prerequisites</h3>

            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">Competencies Gained:</span>
              <div className="flex flex-wrap gap-2">
                {resource.skills.map((s, idx) => (
                  <span key={idx} className="rounded-lg bg-primary-950/80 border border-primary-800/60 px-3 py-1 text-xs font-semibold text-primary-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {resource.prerequisites.length > 0 && (
              <div className="pt-3 border-t border-surface-border">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">Prerequisites:</span>
                <div className="flex flex-wrap gap-2">
                  {resource.prerequisites.map((p, idx) => (
                    <span key={idx} className="rounded-lg bg-surface-raised border border-surface-border px-3 py-1 text-xs font-medium text-gray-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-surface-border">
              <button
                onClick={handleToggleComplete}
                className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/40 hover:bg-accent-emerald/30'
                    : 'bg-primary-600 text-white hover:bg-primary-500 shadow-md shadow-primary-500/20'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCompleted ? 'Marked as Completed (Click to Reset)' : 'Mark Resource as Completed'}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-surface-border bg-surface p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-cyan" />
                Adaptive Feedback Controls
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Your feedback directly recalibrates the recommendation engine and adapts subsequent roadmap items.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleFeedback('helpful', 5)}
                className="flex items-center gap-2 rounded-xl border border-accent-emerald/40 bg-emerald-950/30 p-3 text-xs font-bold text-emerald-300 hover:bg-emerald-950/60 transition-colors"
              >
                <ThumbsUp className="h-4 w-4 text-accent-emerald" />
                Helpful (+Score)
              </button>

              <button
                onClick={() => handleFeedback('too_difficult', 2)}
                className="flex items-center gap-2 rounded-xl border border-accent-amber/40 bg-amber-950/30 p-3 text-xs font-bold text-amber-300 hover:bg-amber-950/60 transition-colors"
              >
                <AlertTriangle className="h-4 w-4 text-accent-amber" />
                Too Difficult (Insert Precursor)
              </button>

              <button
                onClick={() => handleFeedback('too_easy', 4)}
                className="flex items-center gap-2 rounded-xl border border-accent-cyan/40 bg-cyan-950/30 p-3 text-xs font-bold text-cyan-300 hover:bg-cyan-950/60 transition-colors"
              >
                <FastForward className="h-4 w-4 text-accent-cyan" />
                Too Easy (Fast-Track)
              </button>

              <button
                onClick={() => handleFeedback('not_relevant', 1)}
                className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-raised p-3 text-xs font-bold text-gray-300 hover:text-white transition-colors"
              >
                <Slash className="h-4 w-4 text-gray-400" />
                Not Relevant
              </button>
            </div>
          </div>
        </div>
      </main>

      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onPlanAdjusted={loadResource}
      />
    </div>
  );
}
