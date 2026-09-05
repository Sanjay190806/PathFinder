'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Target } from "lucide-react";
import { Button, Input, Card, Alert } from "@/components/ui";
import { api, setAuthToken } from "@/lib/api";
import { HierarchicalEducationSelector } from "@/components/education/HierarchicalEducationSelector";
import { StructuredEducationSelection } from "@/lib/educationCatalog";
import { SIH26101Profile } from "@/lib/indiaEducationTaxonomy";
import { cn } from "@/lib/utils";

const TARGET_CAREER_OPTIONS = [
  { role: "AI/ML Engineer", category: "Artificial Intelligence" },
  { role: "Full Stack Developer", category: "Software Engineering" },
  { role: "Data Scientist", category: "Data Science" },
  { role: "Cloud / DevOps Engineer", category: "DevOps & Cloud" },
  { role: "Cybersecurity Analyst", category: "Cybersecurity" },
  { role: "VLSI Hardware Engineer", category: "Hardware Engineering" }
];

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [targetRole, setTargetRole] = useState("AI/ML Engineer");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🇮🇳 Hierarchical India Education Selector State
  const [showStreamSelector, setShowStreamSelector] = useState(true);
  const [educationSelection, setEducationSelection] = useState<StructuredEducationSelection>({
    education_level: "undergraduate",
    stream: "engineering-technology",
    specialization: "computer-science-engineering",
    qualification: "B.Tech"
  });
  const [indianProfile, setIndianProfile] = useState<SIH26101Profile>({
    country: "India",
    education_stage: "undergraduate",
    domain: "engineering-technology",
    stream: "computer-science-engineering",
    specialization: "Computer Science Engineering",
    qualification: "B.Tech",
    current_role: "Student / Fresher",
    work_domain: "Software & Technology"
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Save selected details for state synchronization
      if (typeof window !== "undefined") {
        localStorage.setItem("pathfinder_education_selection", JSON.stringify(educationSelection));
        localStorage.setItem("pathfinder_indian_stream_profile", JSON.stringify(indianProfile));
        localStorage.setItem("pathfinder_target_role", targetRole);
      }
      await api.register({ full_name: fullName, email, password });
      setAuthToken('cookie');

      // Auto-complete onboarding using the details provided right on this registration screen
      try {
        await api.completeOnboarding({
          target_role: targetRole,
          education_level: educationSelection.qualification || "Undergraduate (B.Tech)",
          field_of_study: educationSelection.specialization || "Computer Science",
          experience_level: "Beginner",
          weekly_hours: 10,
          preferred_formats: ["video", "hands-on", "projects"],
          learning_objective: "Placement / Career Goal",
          skills: [],
          country: "India",
          education_stage: educationSelection.education_level,
          education_domain: educationSelection.stream,
          education_stream: educationSelection.specialization,
          specialization: educationSelection.custom_education_label || educationSelection.specialization,
          qualification: educationSelection.qualification,
          institution: educationSelection.institution,
          graduation_year: educationSelection.graduation_year,
          custom_education_label: educationSelection.custom_education_label,
          current_role: indianProfile.current_role || "Student / Fresher",
          work_domain: indianProfile.work_domain || "Software & Technology",
          education_profile: indianProfile
        });
      } catch (onbErr) {
        console.warn("Auto-onboarding background sync notice:", onbErr);
      }

      // Navigate directly to dashboard, bypassing onboarding completely
      router.push("/dashboard");
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
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Narrative Feature */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6 pr-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary-500/30 bg-primary-950/60 px-3 py-1 text-xs font-semibold text-primary-300 mb-4">
                🇮🇳 JanSahay / SIH26101 Taxonomy
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                India-focused career roadmap & competency engine.
              </h1>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                PathFinder structures education specifically for India: from School & Higher Secondary (Classes 11–12 PCM/PCB/Commerce/Arts) to ITI, Diplomas, 18 UGC/AICTE degree domains, and Official Statistical Systems.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Hierarchical Stage → Domain → Stream → Specialization taxonomy",
                "School (1–10) captures subject interests without rigid stream forcing",
                "11th–12th (+2) supports PCM, PCB, PCMB, CS, Commerce & Arts",
                "Working Professional & SIH26101 Official Statistics competency paths"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl border border-surface-border bg-surface-raised/60 text-xs text-slate-400">
              <span className="font-semibold text-white">Active Stream Selected:</span>{" "}
              <span className="text-accent-cyan font-medium">
                {indianProfile.specialization || indianProfile.stream} ({indianProfile.qualification || indianProfile.education_stage})
              </span>
            </div>
          </div>

          {/* Right: Registration Form Card */}
          <Card variant="default" className="w-full lg:col-span-7 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Create Account</h2>
                <p className="text-xs text-slate-400 mt-1">Join PathFinder with your Indian education profile.</p>
              </div>
              <span className="text-2xl">🇮🇳</span>
            </div>

            {error && (
              <div className="mt-4">
                <Alert variant="danger" message={error} onClose={() => setError(null)} />
              </div>
            )}

            <form onSubmit={handleRegister} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

              {/* Target Career Destination */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-accent-cyan" />
                    <span>Target Career Goal</span>
                  </span>
                  <span className="text-[11px] text-accent-cyan font-medium">Personalizes your AI roadmap</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TARGET_CAREER_OPTIONS.map((item) => {
                    const isSelected = targetRole === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setTargetRole(item.role)}
                        className={cn(
                          "px-3 py-2 text-left rounded-xl border text-xs transition-all flex flex-col justify-between",
                          isSelected
                            ? "border-primary-500 bg-primary-500/15 text-white shadow-sm ring-1 ring-primary-500"
                            : "border-surface-border bg-surface-raised/40 text-slate-300 hover:border-slate-600 hover:text-white"
                        )}
                      >
                        <span className="font-semibold text-[12px] leading-tight">{item.role}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{item.category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🇮🇳 JanSahay / SIH26101 Indian Education Stream Section */}
              <div className="border border-surface-border rounded-2xl p-4 bg-surface-raised/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent-cyan" />
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        🇮🇳 Select Your Education Stream in India
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Pre-calibrates your learning path directly for the Indian framework
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowStreamSelector(!showStreamSelector)}
                    className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1 p-1"
                  >
                    {showStreamSelector ? "Collapse" : "Choose"}
                    {showStreamSelector ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {showStreamSelector && (
                  <div className="mt-4 pt-3 border-t border-surface-border">
                    <HierarchicalEducationSelector
                      compact={true}
                      showInstitutionFields={false}
                      value={educationSelection}
                      onChange={(sel) => {
                        setEducationSelection(sel);
                        setIndianProfile((prev) => ({
                          ...prev,
                          country: "India",
                          education_stage: sel.education_level,
                          domain: sel.stream,
                          stream: sel.specialization,
                          specialization: sel.custom_education_label || sel.specialization,
                          qualification: sel.qualification
                        }));
                      }}
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full mt-2"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Create Account & Launch Dashboard
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
        PathFinder &bull; AI-Powered Personalized Learning Path Recommender &bull; JanSahay / SIH26101
      </footer>
    </div>
  );
}
