"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Zap, BookOpen, Target, Sparkles, Map, LineChart,
  Compass, Brain, Trophy, Users, ChevronRight, Play,
  GraduationCap, Rocket, Shield, Code2, BarChart3, Search
} from "lucide-react";
import { motion } from "framer-motion";
import { LandingNav } from "@/components/landing/LandingNav";
import { Button, Card, Badge, BrandLogo } from "@/components/ui";
import { api, setAuthToken } from "@/lib/api";

// ── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};


const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

// ── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Career Paths", value: "500+", icon: Map },
  { label: "Active Learners", value: "12K+", icon: Users },
  { label: "Avg. Skill Growth", value: "3.8×", icon: LineChart },
  { label: "AI Powered", value: "100%", icon: Brain },
];

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Compass,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Dynamic Roadmaps",
    desc: "AI creates directed acyclic learning graphs calibrated to your current skills and target role.",
    badge: "AI Powered",
  },
  {
    icon: Shield,
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
    title: "100-Mark Assessments",
    desc: "Interactive, domain-specific 100-mark examinations with proctoring and malpractice prevention.",
    badge: "New",
  },
  {
    icon: BookOpen,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Curated Free Learning",
    desc: "Every milestone links to verified high-yield videos, official documentation, and real projects.",
    badge: "Verified",
  },
  {
    icon: Brain,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "24/7 AI Career Coach",
    desc: "Context-aware AI mentor that explains concepts, reviews code, and recommends your next step.",
    badge: "Personalized",
  },
];

// ── Step-by-Step How It Works ────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    icon: Target,
    title: "Select Your Ambition",
    desc: "Choose from 500+ Indian & global careers across engineering, creative arts, and finance.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    num: "02",
    icon: Brain,
    title: "Calibrate Knowledge",
    desc: "Complete an adaptive 100-mark assessment to establish your verified skill baseline.",
    color: "from-purple-500 to-pink-500",
  },
  {
    num: "03",
    icon: Map,
    title: "Follow the Path",
    desc: "Master step-by-step milestones with curated resources, quizzes, and project checkpoints.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    num: "04",
    icon: Rocket,
    title: "Career Ready",
    desc: "Portfolio, mock interviews, and real job opportunities.",
    color: "from-orange-500 to-amber-500",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      await api.demoLogin();
      setAuthToken("cookie");
      router.push("/dashboard");
    } catch (err) {
      console.error("Demo login error", err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      <LandingNav />

      <main className="flex-1 pt-16">

        {/* ══════════════════════════ HERO ══════════════════════════════════ */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-48">
          {/* Animated gradient orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-[10%] right-[10%] h-[400px] w-[400px] rounded-full bg-blue-500/15 blur-[100px]"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-[30%] right-[30%] h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[80px]"
              animate={{ x: [0, 30, 0], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div variants={stagger} initial="hidden" animate="visible">
              {/* Badge */}
              <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm font-semibold text-primary backdrop-blur-sm shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  ⚡ Powered by Groq AI · Now Live
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.05]"
              >
                Your AI{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-500 animate-gradient-x bg-[length:200%_200%]">
                  Career Coach
                </span>{" "}
                is here.
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                Stop wasting time on generic courses. PathFinder builds a personalized, adaptive learning roadmap — calibrated to your exact skills, goals, and career domain.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeUp}
                custom={3}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/onboarding" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-base h-14 px-8 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-200"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Start Your Journey — Free
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDemoLogin}
                  isLoading={isDemoLoading}
                  className="w-full sm:w-auto text-base h-14 px-8 rounded-2xl border-border/60 bg-surface/60 backdrop-blur-sm hover:bg-surface hover:scale-105 transition-all duration-200"
                  leftIcon={<Play className="h-5 w-5 text-primary" />}
                >
                  Try Live Demo
                </Button>
              </motion.div>

              {/* Social proof line */}
              <motion.p
                variants={fadeUp}
                custom={4}
                className="mt-6 text-sm text-muted-foreground"
              >
                ✓ No credit card &nbsp;·&nbsp; ✓ 5 min setup &nbsp;·&nbsp; ✓ 500+ career paths
              </motion.p>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-20 relative z-10"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 text-center hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
                >
                  <stat.icon className="h-5 w-5 text-primary mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-2xl font-black text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════ HOW IT WORKS ══════════════════════════ */}
        <section className="py-24 bg-surface/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
                How It Works
              </motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                From zero to career-ready in 4 steps
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="relative rounded-3xl border border-border bg-card p-7 cursor-default group overflow-hidden"
                >
                  {/* Gradient glow on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${step.color} rounded-3xl`} />

                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg mb-5`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="text-[11px] font-black text-muted-foreground tracking-[0.2em] uppercase mb-2">
                    Step {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>

                  {i < STEPS.length - 1 && (
                    <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-border z-10" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════ FEATURES ══════════════════════════════ */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
                Features
              </motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                A premium workspace for students
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Every feature is built around one goal: getting you hired faster.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-3xl border border-border bg-card p-8 cursor-default group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${feat.bg} mb-5 group-hover:scale-110 transition-transform`}>
                    <feat.icon className={`h-6 w-6 ${feat.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════ ASSESSMENT HIGHLIGHT ══════════════════ */}
        <section className="py-24 bg-surface/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">AI-Powered Exams</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-6">
                  100-mark domain exams,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                    generated by AI
                  </span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Every exam is uniquely generated for your career domain. Whether you're in Software, Hardware, Data Science, DevOps — the questions are specific, relevant, and graded fairly.
                </p>
                <ul className="space-y-3">
                  {[
                    "💻 Software Engineering — algorithms, system design",
                    "🔌 Hardware & Electronics — circuits, embedded systems",
                    "🤖 Data Science & AI — ML, statistics, neural nets",
                    "☁️ DevOps & Cloud — CI/CD, Kubernetes, AWS",
                    "🔒 Cybersecurity — threat models, protocols",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                      <span className="flex h-2 w-2 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding" className="mt-8 inline-block">
                  <Button size="lg" className="rounded-2xl" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Take Your Domain Exam
                  </Button>
                </Link>
              </motion.div>

              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Software Engineering · 100 Marks</div>
                    <div className="text-sm font-bold text-foreground">Question 12 of 30</div>
                  </div>
                  <span className="ml-auto text-xs font-mono font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg">48:32</span>
                </div>

                <p className="text-sm font-semibold text-foreground mb-4 leading-relaxed">
                  Which data structure provides O(1) average-case time complexity for both insertion and lookup?
                </p>

                <div className="space-y-2.5">
                  {["Binary Search Tree", "Hash Map", "AVL Tree", "Linked List"].map((opt, i) => (
                    <motion.div
                      key={opt}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-sm cursor-pointer transition-all ${
                        i === 1
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                        i === 1 ? "border-primary bg-primary text-white" : "border-muted-foreground"
                      }`}>
                        {i === 1 ? "✓" : String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">📷 Camera Active · Monitoring</span>
                  <span className="text-xs font-bold text-green-500">✓ Attentive</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════ CTA BANNER ════════════════════════════ */}
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-purple-500/5 to-blue-500/10 p-12 text-center shadow-2xl shadow-primary/10"
            >
              {/* Decorative orb */}
              <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-primary/20 blur-[60px] pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-purple-500/15 blur-[60px] pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-white/95 p-2 flex items-center justify-center shadow-xl border border-border">
                    <img
                      src="/sanzzdream_logo.png"
                      alt="Sanzz Dream Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4">
                  Your career starts today.
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                  Join learners accelerating their career trajectory with PathFinder AI by Sanzz Dream. Free to start, no credit card needed.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/onboarding">
                    <Button size="lg" className="h-14 px-10 text-base rounded-2xl shadow-xl shadow-primary/25 hover:scale-105 transition-transform" rightIcon={<ArrowRight className="h-5 w-5" />}>
                      Get Started — Free
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" onClick={handleDemoLogin} isLoading={isDemoLoading} className="h-14 px-10 text-base rounded-2xl" leftIcon={<Zap className="h-5 w-5 text-warning" />}>
                    Try Demo
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════ FOOTER ════════════════════════════════ */}
      <footer className="bg-surface border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <BrandLogo size="md" />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Sign Up</Link>
              <Link href="/onboarding" className="hover:text-foreground transition-colors">Get Started</Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 Sanzz Dream. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
