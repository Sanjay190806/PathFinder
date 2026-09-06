'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Scale,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
  TrendingUp,
  X,
  Plus
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, Skeleton } from '@/components/ui';

interface CareerOption {
  slug: string;
  display_name: string;
  domain_name: string;
}

function CareerCompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [availableCareers, setAvailableCareers] = useState<CareerOption[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load catalog on mount
  useEffect(() => {
    api.getCanonicalCareerCatalog()
      .then((data: any[]) => {
        const opts = data.map((c: any) => ({
          slug: c.slug,
          display_name: c.display_name,
          domain_name: c.domain_name || 'General'
        }));
        setAvailableCareers(opts);

        // Pre-populate from URL if present
        const qRoles = searchParams.get('roles');
        if (qRoles) {
          const slugs = qRoles.split(',').filter(s => s.trim().length > 0).slice(0, 3);
          if (slugs.length >= 2) {
            setSelectedSlugs(slugs);
            triggerComparison(slugs);
            return;
          }
        }

        // Default to first 2
        if (opts.length >= 2) {
          const defaults = ['data-scientist', 'ai-ml-engineer'];
          setSelectedSlugs(defaults);
          triggerComparison(defaults);
        }
      })
      .catch((err) => {
        setError('Failed to load career catalog.');
      });
  }, []);

  const triggerComparison = async (slugs: string[]) => {
    if (slugs.length < 2 || slugs.length > 3) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.compareCareersMatrix(slugs);
      setComparisonData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to compare selected careers.');
    } finally {
      setIsLoading(false);
    }
  };

  const addCareer = (slug: string) => {
    if (selectedSlugs.includes(slug) || selectedSlugs.length >= 3) return;
    const next = [...selectedSlugs, slug];
    setSelectedSlugs(next);
    triggerComparison(next);
  };

  const removeCareer = (slug: string) => {
    if (selectedSlugs.length <= 2) return;
    const next = selectedSlugs.filter(s => s !== slug);
    setSelectedSlugs(next);
    triggerComparison(next);
  };

  return (
    <div className="min-h-screen bg-surface-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/onboarding" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Explorer
            </Link>
            <span>/</span>
            <span className="text-accent-cyan font-medium">Multi-Career Comparison Matrix</span>
          </div>

          <div className="text-xs text-slate-400">
            Comparing <span className="font-bold text-white">{selectedSlugs.length}</span> of maximum 3 careers
          </div>
        </div>

        {/* Header */}
        <div className="bg-surface-raised/60 border border-surface-border rounded-3xl p-6 sm:p-8 backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-semibold mb-2">
                <Scale className="h-3.5 w-3.5" /> Side-by-Side Analytics
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Career Comparison & Transition Matrix
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Compare educational barriers, shared vs. unique competencies, statutory regulation, and pair-wise transition feasibility.
              </p>
            </div>

            {/* Career Selector Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedSlugs.map(slug => {
                const c = availableCareers.find(opt => opt.slug === slug);
                return (
                  <div
                    key={slug}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs font-semibold text-white shadow-sm"
                  >
                    <span>{c?.display_name || slug}</span>
                    {selectedSlugs.length > 2 && (
                      <button
                        onClick={() => removeCareer(slug)}
                        className="text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove career"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {selectedSlugs.length < 3 && (
                <div className="relative">
                  <select
                    className="appearance-none bg-surface-raised border border-dashed border-accent-cyan/40 hover:border-accent-cyan text-accent-cyan text-xs font-semibold px-3 py-1.5 rounded-xl pr-6 cursor-pointer outline-none transition-colors"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) addCareer(e.target.value);
                    }}
                  >
                    <option value="" disabled>+ Add Career</option>
                    {availableCareers
                      .filter(c => !selectedSlugs.includes(c.slug))
                      .map(c => (
                        <option key={c.slug} value={c.slug} className="bg-surface text-slate-200">
                          {c.display_name} ({c.domain_name})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        )}

        {/* Main Comparison Content */}
        {!isLoading && comparisonData && (
          <div className="space-y-8">
            {/* Side-by-Side Comparison Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-${comparisonData.careers.length} gap-6`}>
              {comparisonData.careers.map((career: any) => (
                <div
                  key={career.slug}
                  className="bg-surface-raised/40 border border-surface-border rounded-2xl p-6 space-y-4 hover:border-primary-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-accent-cyan">
                        {career.domain}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-surface border border-surface-border text-[10px] text-slate-400">
                        {career.remote_compatibility} Remote
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{career.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{career.family}</p>

                    <div className="pt-3 border-t border-surface-border space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Minimum Education</span>
                        <span className="font-semibold text-slate-200">{career.min_education}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Entry Barrier</span>
                        <span className={`font-semibold ${career.entry_barrier.includes('High') ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {career.entry_barrier}
                        </span>
                      </div>
                      {career.regulatory_body && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Regulator</span>
                          <span className="font-mono text-[11px] text-rose-300 font-semibold">{career.regulatory_body}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Market Growth</span>
                        <span className="font-semibold text-primary-400">{career.growth_rate}</span>
                      </div>
                    </div>

                    {/* Key Required Skills */}
                    <div className="pt-3 border-t border-surface-border space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Core Competencies
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {career.key_skills.map((s: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-surface border border-surface-border text-[10px] text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link href={`/careers/${career.slug}`}>
                      <Button variant="outline" className="w-full text-xs justify-center gap-1">
                        Explore Requirements <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Skill Overlap & Transferability Analysis */}
            <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-accent-cyan" /> Competency Overlap & Synergy
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shared Skills */}
                <div className="bg-surface/50 border border-surface-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Shared Foundational Skills
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                      {comparisonData.skill_overlap.shared_skills.length} common
                    </span>
                  </div>
                  {comparisonData.skill_overlap.shared_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {comparisonData.skill_overlap.shared_skills.map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
                        >
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No direct identical skills shared across all selected careers; they represent distinct technical domains.
                    </p>
                  )}
                </div>

                {/* Unique Skills summary */}
                <div className="bg-surface/50 border border-surface-border rounded-xl p-4 space-y-3">
                  <span className="text-xs font-semibold text-slate-300">
                    Unique Domain Skills by Career
                  </span>
                  <div className="space-y-2">
                    {Object.entries(comparisonData.skill_overlap.unique_skills_by_career).map(([slug, skills]: [string, any]) => {
                      const c = comparisonData.careers.find((item: any) => item.slug === slug);
                      return (
                        <div key={slug} className="text-xs">
                          <span className="font-bold text-white">{c?.title || slug}: </span>
                          <span className="text-slate-400">
                            {skills.length > 0 ? skills.join(', ') : 'None unique'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Pair-wise Transition Feasibility Matrix */}
            <div className="bg-surface-raised/50 border border-surface-border rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-400" /> Career Transition Feasibility & Bridge Paths
              </h3>
              <p className="text-xs text-slate-400">
                Algorithmic ramp-up difficulty and estimated study timeline when switching between these selected roles.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {Object.entries(comparisonData.transition_feasibility).map(([pairKey, tf]: [string, any]) => {
                  const [src, tgt] = pairKey.split('_to_');
                  const srcCareer = comparisonData.careers.find((c: any) => c.slug === src);
                  const tgtCareer = comparisonData.careers.find((c: any) => c.slug === tgt);

                  const feasibilityBadgeColor =
                    tf.feasibility === 'HIGH'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : tf.feasibility === 'MODERATE'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                  return (
                    <div
                      key={pairKey}
                      className="bg-surface border border-surface-border rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <span>{srcCareer?.title || src}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <span>{tgtCareer?.title || tgt}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${feasibilityBadgeColor}`}>
                          {tf.feasibility} Feasibility
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed">
                        {tf.rationale}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-surface-border">
                        <span>Overlap: <strong className="text-white">{tf.overlap_percentage}%</strong></span>
                        <span>Estimated Ramp: <strong className="text-white">{tf.estimated_transition_time}</strong></span>
                      </div>

                      {tf.bridge_skills_needed && tf.bridge_skills_needed.length > 0 && (
                        <div className="pt-2 text-xs">
                          <span className="text-slate-400 text-[10px] uppercase font-semibold">Priority Bridge Skills: </span>
                          <span className="text-accent-cyan font-mono text-[11px]">
                            {tf.bridge_skills_needed.slice(0, 3).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CareerComparePage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-surface-dark py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    }>
      <CareerCompareContent />
    </React.Suspense>
  );
}

