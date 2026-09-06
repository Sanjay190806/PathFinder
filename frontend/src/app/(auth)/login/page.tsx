'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Zap, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button, Input, Card, Alert, BrandLogo } from "@/components/ui";
import { api, setAuthToken } from "@/lib/api";
import { HierarchicalEducationSelector } from "@/components/education/HierarchicalEducationSelector";
import { StructuredEducationSelection } from "@/lib/educationCatalog";
import { SIH26101Profile } from "@/lib/indiaEducationTaxonomy";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // 🇮🇳 JanSahay / SIH26101 Stream Selector on Sign-in Page
  const [showStreamPicker, setShowStreamPicker] = useState(false);
  const [selectedStreamProfile, setSelectedStreamProfile] = useState<SIH26101Profile>({
    country: "India",
    education_stage: "undergraduate",
    domain: "computer_it",
    stream: "cs_core",
    specialization: "Artificial Intelligence & Machine Learning (AI/ML)",
    qualification: "B.Tech CSE",
    current_role: "Student / Fresher",
    work_domain: "Artificial Intelligence & Machine Learning"
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("pathfinder_indian_stream_profile", JSON.stringify(selectedStreamProfile));
      }
      await api.login({ email, password });
      // Token is now in an httpOnly cookie set by the server — just mark as logged in.
      setAuthToken('cookie');
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
      if (typeof window !== "undefined") {
        localStorage.setItem("pathfinder_indian_stream_profile", JSON.stringify(selectedStreamProfile));
      }
      await api.demoLogin();
      // Token is in the httpOnly cookie — mark as logged in.
      setAuthToken('cookie');

      // Save selected stream to demo profile
      await api.updateEducationProfile({
        country: "India",
        education_stage: selectedStreamProfile.education_stage,
        education_domain: selectedStreamProfile.domain,
        education_stream: selectedStreamProfile.stream,
        specialization: selectedStreamProfile.specialization,
        qualification: selectedStreamProfile.qualification,
        current_role: selectedStreamProfile.current_role,
        work_domain: selectedStreamProfile.work_domain,
        education_profile: selectedStreamProfile
      }).catch(() => {});

      router.push("/dashboard");
    } catch (err: any) {
      setError("Demo login could not be initiated. Please check the backend connection.");
    } finally {
      setIsDemoLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between">
        <BrandLogo size="sm" />
        <Link href="/register" className="text-xs font-semibold text-primary hover:text-primary/80">
          Create an account &rarr;
        </Link>
      </header>

      {/* Main Content Split Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Brand / Narrative Feature */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6 pr-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                🇮🇳 JanSahay / SIH26101 Education Taxonomy
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                Resume your personalized learning roadmap.
              </h1>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Log in to inspect newly unlocked skills, track your weekly velocity, and review AI Coach recommendations calibrated to your specific educational stream.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Prerequisite DAG graph with 0% dependency violations",
                "Real-time roadmap versioning and change audit trail",
                "Full support for 18 canonical Indian domains & official statistics",
                "Dynamic calibration based on Education Stage and Specialization"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card text-xs text-muted-foreground">
              <span className="font-bold text-foreground">Evaluator Note:</span> You can select any Indian stream (School, 11th–12th PCM/PCB/Commerce, Polytechnic, or SIH26101 Official Statistics) using the dropdown on the sign-in card, then click <span className="text-primary font-semibold">Quick Demo Login</span> to test immediately!
            </div>
          </div>

          {/* Right: Login Form Card */}
          {/* Right: Login Form Card */}
          <Card variant="default" className="w-full lg:col-span-7 p-6 sm:p-8 shadow-2xl bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Sign in</h2>
                <p className="text-xs text-muted-foreground mt-1">Enter your credentials to access your dashboard.</p>
              </div>
              <span className="text-2xl">🇮🇳</span>
            </div>

            {/* UX-001: Always-mounted ARIA live region container for screen-reader error announcements */}
            <div
              aria-live="assertive"
              aria-atomic="true"
              id="login-error-container"
              className="mt-4"
            >
              {error && (
                <Alert variant="danger" message={error} onClose={() => setError(null)} />
              )}
            </div>

            {/* 🇮🇳 JanSahay / SIH26101 Stream Dropdown on Sign-In Page */}
            <div className="mt-4 p-3 rounded-2xl border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      Education Stream in India
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      {selectedStreamProfile.specialization || selectedStreamProfile.stream} ({selectedStreamProfile.qualification || selectedStreamProfile.education_stage})
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStreamPicker(!showStreamPicker)}
                  className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 px-2 py-1 rounded bg-surface-muted border border-border"
                >
                  {showStreamPicker ? "Hide" : "Change Stream"}
                  {showStreamPicker ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {showStreamPicker && (
                <div className="mt-4 pt-3 border-t border-border">
                  <HierarchicalEducationSelector
                    compact={true}
                    showInstitutionFields={false}
                    value={{
                      education_level: selectedStreamProfile.education_stage,
                      stream: selectedStreamProfile.domain,
                      specialization: selectedStreamProfile.stream,
                      qualification: selectedStreamProfile.qualification
                    }}
                    onChange={(sel) => {
                      setSelectedStreamProfile({
                        country: "India",
                        education_stage: sel.education_level,
                        domain: sel.stream,
                        stream: sel.specialization,
                        specialization: sel.custom_education_label || sel.specialization,
                        qualification: sel.qualification,
                        current_role: "Student / Fresher",
                        work_domain: "Software & Technology"
                      });
                      if (typeof window !== "undefined") {
                        localStorage.setItem("pathfinder_education_selection", JSON.stringify(sel));
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <form onSubmit={handleLogin} className="mt-5 space-y-4" aria-busy={isLoading}>
              <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@pathfinder.demo"
                leftIcon={<Mail className="h-4 w-4" />}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error-container" : undefined}
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error-container" : undefined}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-muted-foreground hover:text-foreground"
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

            <div className="mt-5 pt-4 border-t border-border">
              <Button
                variant="subtle"
                onClick={handleDemoLogin}
                isLoading={isDemoLoading}
                className="w-full"
                leftIcon={<Zap className="h-4 w-4 text-warning" />}
              >
                Quick Demo Login with Chosen Stream
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Create Account &rarr;
              </Link>
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-border text-center text-xs text-muted-foreground">
        PathFinder &bull; AI-Powered Personalized Learning Path Recommender &bull; JanSahay / SIH26101
      </footer>
    </div>
  );
}
