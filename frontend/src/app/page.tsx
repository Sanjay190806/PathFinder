'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowRight,
  Target,
  Route,
  Zap,
  CheckCircle2,
  Layers,
  Sparkles,
  ShieldCheck,
  Clock,
  BookOpen,
  Activity
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button, Card, Badge } from "@/components/ui";
import { HeroJourneyVisual } from "@/components/landing/HeroJourneyVisual";
import { CareerDomainCards } from "@/components/landing/CareerDomainCards";
import { api, setAuthToken } from "@/lib/api";

export default function LandingPage() {
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      await api.demoLogin();
      setAuthToken('cookie');
      router.push("/dashboard");
    } catch (err) {
      console.error("Demo login error", err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Global Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32">
          {/* Subtle Ambient Background */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-600/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-raised/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary-400 animate-pulse" />
              <span>Adaptive Career Learning & Recommendation Engine</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
              Your career destination,{" "}
              <span className="bg-gradient-to-r from-primary-400 via-accent-cyan to-indigo-300 bg-clip-text text-transparent">
                mapped step-by-step.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Stop wondering what to study next. PathFinder evaluates what you already know, identifies critical prerequisite gaps, and synthesizes a personalized roadmap that adapts dynamically as you learn.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/onboarding">
                <Button size="lg" className="w-full sm:w-auto shadow-md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Build My Learning Path
                </Button>
              </Link>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleDemoLogin}
                isLoading={isDemoLoading}
                className="w-full sm:w-auto"
                leftIcon={<Zap className="h-4 w-4 text-accent-cyan" />}
              >
                Explore Live Demo (Alex Mercer)
              </Button>
            </div>

            {/* Quick Demo Context */}
            <div className="mt-6 mx-auto max-w-md text-xs text-slate-500">
              Zero configuration required. Evaluators can explore a live AI/ML or Cybersecurity roadmap in one click.
            </div>
          </div>

          {/* Interactive Journey Architecture Visual */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20 relative z-10">
            <HeroJourneyVisual />
          </div>
        </section>

        {/* THE PROBLEM SECTION */}
        <section className="py-16 sm:py-24 border-t border-surface-border bg-surface/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <Badge variant="primary" size="md">The Core Challenge</Badge>
              <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
                Learning isn&apos;t the hard part. Knowing what to learn next is.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Most students and engineers waste hundreds of hours navigating disconnected tutorials and hitting invisible prerequisite walls.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="default">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised border border-surface-border text-rose-400 mb-4">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Course Overload & Duplication</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Linear tutorials force you to repeat syntax you already know, or assume foundational math and system skills you haven&apos;t covered yet.
                </p>
              </Card>

              <Card variant="default">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised border border-surface-border text-amber-400 mb-4">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Unclear Prerequisite Chains</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Jumping straight into complex frameworks without core competencies leads to frustration, slow retention, and cognitive burnout.
                </p>
              </Card>

              <Card variant="default">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised border border-surface-border text-cyan-400 mb-4">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Rigid, Static Curricula</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Standard roadmaps never adjust when you finish a topic early, struggle with an algorithm, or have limited weekly hours.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* HOW PATHFINDER WORKS */}
        <section className="py-16 sm:py-24 border-t border-surface-border bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge variant="cyan" size="md">The Solution</Badge>
              <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
                How PathFinder structures your path
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                A deterministic, graph-backed recommendation engine built on mathematical pedagogical principles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  num: "01",
                  title: "Choose Your Destination",
                  desc: "Select any engineering domain from the dynamic catalog or define a custom technical objective."
                },
                {
                  num: "02",
                  title: "Calibrate Existing Skills",
                  desc: "Self-rate and run quick calibration checks so the engine skips topics you have already mastered."
                },
                {
                  num: "03",
                  title: "Prerequisite DAG Sequencing",
                  desc: "Directed Acyclic Graph strictly validates dependencies so foundational skills unlock advanced specializations."
                },
                {
                  num: "04",
                  title: "Adaptive Recalibration",
                  desc: "As you finish courses or submit feedback, your roadmap automatically updates with new version history."
                }
              ].map((step, idx) => (
                <div key={idx} className="rounded-2xl border border-surface-border bg-surface p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-black font-mono text-primary-500/60 block mb-2">{step.num}</span>
                    <h4 className="text-base font-bold text-white">{step.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DOMAIN-AGNOSTIC CAREER SHOWCASE */}
        <section className="py-16 sm:py-24 border-t border-surface-border bg-surface/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <Badge variant="purple" size="md">Domain-Agnostic Architecture</Badge>
                <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
                  Built for every engineering domain
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2">
                  The core graph & recommendation engine operates on abstract skills, goals, and prerequisites.
                </p>
              </div>
              <Link href="/onboarding">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  View All Careers
                </Button>
              </Link>
            </div>

            <CareerDomainCards />
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-16 sm:py-24 border-t border-surface-border bg-background relative overflow-hidden">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="rounded-3xl border border-primary-500/40 bg-surface/90 p-8 sm:p-14 shadow-2xl backdrop-blur-xl">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Stop guessing your curriculum.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-lg mx-auto leading-relaxed">
                Take the 2-minute onboarding to evaluate your skill baseline and generate your tailored career roadmap.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link href="/onboarding">
                  <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Build My Learning Path
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg">
                    Sign In to Existing Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-surface-border py-8 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Compass className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-slate-300">PathFinder</span>
            <span>&bull; AI-Powered Personalized Learning Path Recommender</span>
          </div>
          <p className="text-slate-500">College Hackathon Round 2 Prototype &bull; Fully Domain-Agnostic</p>
        </div>
      </footer>
    </div>
  );
}
