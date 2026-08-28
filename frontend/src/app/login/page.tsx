'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Zap, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, Input, Card, Alert } from "@/components/ui";
import { api, setAuthToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      setAuthToken(res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message || "Those credentials don't match an account. Please check your email and password and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError(null);
    try {
      const res = await api.demoLogin();
      setAuthToken(res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Demo login could not be initiated. Please check the backend connection.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-surface-border bg-surface/80 backdrop-blur-md flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
            <Compass className="h-4 w-4" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">PathFinder</span>
        </Link>
        <Link href="/onboarding" className="text-xs font-semibold text-primary-400 hover:text-primary-300">
          Create an account &rarr;
        </Link>
      </header>

      {/* Main Content Split Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Brand / Narrative Feature */}
          <div className="hidden lg:flex flex-col justify-between space-y-8 pr-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary-500/30 bg-primary-950/60 px-3 py-1 text-xs font-semibold text-primary-300 mb-4">
                Adaptive Career Path Recommender
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                Resume your personalized learning roadmap.
              </h1>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Log in to inspect newly unlocked skills, track your weekly velocity, and review AI Coach recommendations.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Prerequisite DAG graph with 0% dependency violations",
                "Real-time roadmap versioning and change audit trail",
                "Explainable multi-signal recommendation scoring"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-accent-cyan shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl border border-surface-border bg-surface-raised/60 text-xs text-slate-400">
              <span className="font-bold text-white">Evaluator Note:</span> For quick hackathon testing, click the <span className="text-accent-cyan font-semibold">Quick Demo Login</span> button to enter as demo learner Alex Mercer.
            </div>
          </div>

          {/* Right: Login Form Card */}
          <Card variant="default" className="w-full max-w-md mx-auto p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white tracking-tight">Sign in</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your email and password to access your dashboard.</p>

            {error && (
              <div className="mt-4">
                <Alert variant="danger" message={error} onClose={() => setError(null)} />
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@pathfinder.demo"
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="????????"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full mt-2"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-surface-border">
              <Button
                variant="subtle"
                onClick={handleDemoLogin}
                isLoading={isDemoLoading}
                className="w-full"
                leftIcon={<Zap className="h-4 w-4 text-accent-cyan" />}
              >
                Quick Demo Login (Alex Mercer)
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Don&apos;t have an account yet?{" "}
              <Link href="/onboarding" className="text-primary-400 font-semibold hover:underline">
                Get Started
              </Link>
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-surface-border text-center text-xs text-slate-500">
        PathFinder &bull; AI-Powered Personalized Learning Path Recommender
      </footer>
    </div>
  );
}
