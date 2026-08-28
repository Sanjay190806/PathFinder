'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Sparkles, ArrowRight, Layers, Target, ShieldCheck, CheckCircle, Play, Zap, BarChart2, RefreshCw } from 'lucide-react';
import { api, setAuthToken } from '@/lib/api';

export default function LandingPage() {
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoClick = async () => {
    setIsDemoLoading(true);
    try {
      const res = await api.demoLogin();
      setAuthToken(res.access_token);
      router.push('/dashboard');
    } catch (err) {
      console.error('Demo login error', err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-surface-border bg-background/60 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-accent-cyan text-white shadow-lg shadow-primary-500/20">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">PathFinder</span>
            <span className="rounded-md bg-primary-950 px-1.5 py-0.5 text-[10px] font-semibold text-primary-400 border border-primary-800/60">AI</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-gray-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={handleDemoClick}
              disabled={isDemoLoading}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3.5 py-1.5 text-xs font-semibold text-accent-cyan hover:bg-accent-cyan/20 transition-all shadow-sm"
            >
              <Zap className="h-3.5 w-3.5" />
              {isDemoLoading ? 'Loading Demo...' : 'Explore Demo'}
            </button>
            <Link
              href="/onboarding"
              className="rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-500 transition-colors shadow-md shadow-primary-500/20"
            >
              Build My Path
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          {/* Subtle Glow Accents */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-600/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-accent-cyan/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-950/60 px-3.5 py-1.5 text-xs font-medium text-primary-300 mb-6 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
              College Hackathon Round 2 Prototype ? AI PathFinder
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
              Your Learning Path.{' '}
              <span className="bg-gradient-to-r from-primary-400 via-accent-cyan to-accent-purple bg-clip-text text-transparent">
                Built Around You.
              </span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              PathFinder uses deterministic skill graph analysis, hybrid multi-factor ranking, and AI reasoning to build a personalized roadmap that adapts dynamically to your real-time feedback.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary-500/25 hover:brightness-110 transition-all group"
              >
                Build My Learning Path
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                onClick={handleDemoClick}
                disabled={isDemoLoading}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-raised px-6 py-3.5 text-sm font-semibold text-gray-200 hover:bg-surface-border hover:text-white transition-colors"
              >
                <Zap className="h-4 w-4 text-accent-cyan" />
                {isDemoLoading ? 'Loading Alex (Demo)...' : 'Explore Demo (Alex Mercer)'}
              </button>
            </div>

            {/* Demo Evaluator Callout Banner */}
            <div className="mt-8 mx-auto max-w-xl rounded-xl border border-surface-border bg-surface/80 p-3 text-xs text-gray-400 backdrop-blur-sm">
              <span className="font-semibold text-accent-cyan">Quick Hackathon Evaluation:</span> Click{' '}
              <button onClick={handleDemoClick} className="underline text-white font-medium hover:text-primary-300">
                Explore Demo
              </button>{' '}
              to immediately inspect a live AI/ML roadmap with active progress, explainability scores, and adaptive feedback triggers.
            </div>
          </div>

          {/* Interactive Roadmap Preview Card */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
            <div className="rounded-3xl border border-surface-border bg-surface/90 p-6 sm:p-8 shadow-2xl shadow-black/60 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent-cyan">Live Roadmap Architecture Preview</span>
                  <h3 className="text-xl font-bold text-white mt-1">Goal: AI/ML Engineer (10h/Week)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-950/70 border border-emerald-800/50 px-2.5 py-1 text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Prerequisites Validated
                  </span>
                  <span className="rounded-full bg-primary-950/70 border border-primary-800/50 px-2.5 py-1 text-[11px] font-medium text-primary-300">
                    Version 1.0 (Active)
                  </span>
                </div>
              </div>

              {/* Phased Visual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 mt-6">
                {[
                  { phase: "Phase 1", name: "Foundations", desc: "Python & Linear Algebra", status: "In Progress", color: "border-primary-500/50 bg-primary-950/30" },
                  { phase: "Phase 2", name: "Core ML", desc: "Supervised & Unsupervised ML", status: "Upcoming", color: "border-surface-border bg-surface-raised/40" },
                  { phase: "Phase 3", name: "Deep Learning", desc: "PyTorch & Transformers", status: "Upcoming", color: "border-surface-border bg-surface-raised/40" },
                  { phase: "Phase 4", name: "Engineering", desc: "FastAPI, Docker & MLOps", status: "Upcoming", color: "border-surface-border bg-surface-raised/40" },
                  { phase: "Phase 5", name: "Capstone", desc: "Autonomous LLM Agent", status: "Capstone", color: "border-accent-purple/30 bg-purple-950/20" }
                ].map((p, idx) => (
                  <div key={idx} className={`rounded-2xl border p-4 flex flex-col justify-between ${p.color}`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{p.phase}</span>
                      <h4 className="text-sm font-bold text-white mt-1">{p.name}</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-snug">{p.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">{p.status}</span>
                      <Sparkles className="h-3 w-3 text-accent-cyan" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core Capabilities Grid */}
        <section className="py-16 sm:py-20 border-t border-surface-border bg-surface/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary-400">Core Intelligence Engine</h2>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">Why PathFinder is not just another chatbot</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Target,
                  title: "Skill-Gap Analysis",
                  desc: "Vectorizes learner competencies against role targets to isolate mastered, partially known, and missing priority skills.",
                  badge: "Deterministic"
                },
                {
                  icon: Layers,
                  title: "Prerequisite DAG Graph",
                  desc: "Directed dependency graph strictly prevents recommending advanced architectures before foundational prerequisites are mastered.",
                  badge: "0% Violations"
                },
                {
                  icon: RefreshCw,
                  title: "Adaptive Feedback Loop",
                  desc: "Submitting feedback (e.g. 'Too Difficult') recalibrates skill confidence and automatically adapts subsequent roadmap versions.",
                  badge: "Versioned"
                },
                {
                  icon: ShieldCheck,
                  title: "Transparent Explainability",
                  desc: "Every recommended course shows multi-factor scoring metrics (Goal, Gap, Prereqs, Diff, Time, Diversity) with zero fake AI.",
                  badge: "Explainable AI"
                }
              ].map((f, idx) => (
                <div key={idx} className="rounded-2xl border border-surface-border bg-surface p-6 flex flex-col justify-between hover:border-primary-500/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600/20 text-primary-400 border border-primary-500/30">
                        <f.icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-md bg-surface-raised px-2 py-0.5 text-[10px] font-semibold text-gray-300 border border-surface-border">
                        {f.badge}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{f.title}</h4>
                    <p className="mt-2 text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary-400" />
            <span className="font-semibold text-gray-300">PathFinder</span> ? AI-Powered Personalized Learning Path Recommender
          </div>
          <p>Built for College Hackathon Round 2 Prototype (2026)</p>
        </div>
      </footer>
    </div>
  );
}
