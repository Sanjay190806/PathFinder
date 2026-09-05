'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { DSADomain, DSATopic } from '@/lib/types';
import {
  Code2,
  Binary,
  Layers,
  Search,
  CheckCircle2,
  ChevronRight,
  GitFork,
  BookOpen,
  Sparkles,
  ArrowRight,
  Cpu,
  BrainCircuit
} from 'lucide-react';

export default function DSACurriculumPage() {
  const [domains, setDomains] = useState<DSADomain[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getDSADomains(),
      api.getDSATopics()
    ])
      .then(([domainsData, topicsData]) => {
        setDomains(domainsData || []);
        setTopics(topicsData || []);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load DSA curriculum');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredTopics = topics.filter((t) => {
    const matchesDomain = selectedDomain === 'all' || t.domain_slug === selectedDomain;
    const matchesDifficulty =
      selectedDifficulty === 'all' ||
      (t.difficulty_breakdown && t.difficulty_breakdown[selectedDifficulty] > 0);
    const matchesSearch =
      !search.trim() ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

    return matchesDomain && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Phase 12 Stage 2 DSA Intelligence
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl flex items-center gap-3">
                <Code2 className="w-9 h-9 text-blue-500" />
                Canonical DSA Learning Curriculum
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-3xl">
                Master 28 canonical topics across 5 foundational domains with structured Easy, Medium, and Hard
                progressions, prerequisite dependency graphs, and enterprise interview benchmarks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-right">
                <div className="text-xs text-slate-400 font-medium">Canonical Topics</div>
                <div className="text-2xl font-bold text-blue-400">{topics.length || 28}</div>
              </div>
            </div>
          </div>

          {/* Domain Tabs */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                selectedDomain === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All Domains
            </button>
            {domains.map((d) => (
              <button
                key={d.slug}
                onClick={() => setSelectedDomain(d.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  selectedDomain === d.slug
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          {/* Search & Difficulty Filter */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter DSA topics by name or concept (e.g. Sliding Window, Knapsack, Dijkstra)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                aria-label="Filter by difficulty"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Difficulty Levels</option>
                <option value="EASY">Contains Easy Concepts</option>
                <option value="MEDIUM">Contains Medium Concepts</option>
                <option value="HARD">Contains Hard Concepts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-950/40 border border-rose-800/60 p-6 text-center text-rose-300">
            <p className="font-semibold">{error}</p>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-12 text-center text-slate-400">
            <Code2 className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-semibold text-slate-300">No topics match your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTopics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/learning/dsa/${topic.slug}`}
                className="group block p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                      {topic.domain_name || 'DSA'}
                    </span>
                    <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors mt-0.5">
                      {topic.name}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                      topic.typical_importance === 'VERY_HIGH'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {topic.typical_importance.replace('_', ' ')}
                  </span>
                </div>

                {topic.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {topic.description}
                  </p>
                )}

                {/* Difficulty Breakdown Badges */}
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                    {topic.difficulty_breakdown?.EASY || 0} Easy
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                    {topic.difficulty_breakdown?.MEDIUM || 0} Med
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                    {topic.difficulty_breakdown?.HARD || 0} Hard
                  </span>
                </div>

                {/* Prerequisites */}
                {topic.prerequisite_topic_slugs && topic.prerequisite_topic_slugs.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <GitFork className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">
                      Requires: {topic.prerequisite_topic_slugs.join(', ')}
                    </span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {topic.concepts_count} {topic.concepts_count === 1 ? 'Concept' : 'Concepts'}
                  </span>
                  <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
                    Learn
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
