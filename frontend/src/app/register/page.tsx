'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, Input, Card, Alert } from "@/components/ui";
import { api, setAuthToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.register({ full_name: fullName, email, password });
      setAuthToken(res.access_token);
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please verify your details and try again.");
    } finally {
      setIsLoading(false);
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
        <Link href="/login" className="text-xs font-semibold text-primary-400 hover:text-primary-300">
          Already have an account? Sign In &rarr;
        </Link>
      </header>

      {/* Main Content Split Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Narrative Feature */}
          <div className="hidden lg:flex flex-col justify-between space-y-8 pr-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary-500/30 bg-primary-950/60 px-3 py-1 text-xs font-semibold text-primary-300 mb-4">
                Personalized Career Growth
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                Create your learning profile and build your roadmap.
              </h1>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                PathFinder takes the guesswork out of learning. We evaluate your current technical skills and generate a structured path directly to your target career.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Target any technical career domain dynamically",
                "Skip concepts you already know with baseline calibration",
                "Learn at your own weekly schedule with adaptive pacing"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl border border-surface-border bg-surface-raised/60 text-xs text-slate-400">
              Registration takes less than 30 seconds and transitions immediately to the 2-minute diagnostic onboarding.
            </div>
          </div>

          {/* Right: Registration Form Card */}
          <Card variant="default" className="w-full max-w-md mx-auto p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="text-xs text-slate-400 mt-1">Start your personalized career journey.</p>

            {error && (
              <div className="mt-4">
                <Alert variant="danger" message={error} onClose={() => setError(null)} />
              </div>
            )}

            <form onSubmit={handleRegister} className="mt-5 space-y-4">
              <Input
                label="Full name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                leftIcon={<User className="h-4 w-4" />}
              />

              <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
                Continue to Onboarding
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-400 font-semibold hover:underline">
                Sign In
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
