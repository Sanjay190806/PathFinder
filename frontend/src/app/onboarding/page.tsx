'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { api, setAuthToken, getAuthToken } from "@/lib/api";
import { CareerRole, Skill, AssessmentQuestion, LearningPath } from "@/lib/types";
import { SIH26101Profile } from "@/lib/indiaEducationTaxonomy";
import { StructuredEducationSelection } from "@/lib/educationCatalog";
import { Button, Card, Alert } from "@/components/ui";
import { OnboardingProgress, StepInfo } from "@/components/onboarding/OnboardingProgress";
import { CareerDestinationStep } from "@/components/onboarding/CareerDestinationStep";
import { StartingPointStep } from "@/components/onboarding/StartingPointStep";
import { SkillConfidenceStep } from "@/components/onboarding/SkillConfidenceStep";
import { LearningPaceStep } from "@/components/onboarding/LearningPaceStep";
import { CalibrationStep } from "@/components/onboarding/CalibrationStep";
import { PathPreviewStep } from "@/components/onboarding/PathPreviewStep";

const ONBOARDING_STEPS: StepInfo[] = [
  { number: 1, label: "Destination", shortLabel: "Goal" },
  { number: 2, label: "Background", shortLabel: "Start" },
  { number: 3, label: "Skills", shortLabel: "Skills" },
  { number: 4, label: "Pace", shortLabel: "Pace" },
  { number: 5, label: "Calibration", shortLabel: "Quiz" },
  { number: 6, label: "Your Path", shortLabel: "Path" }
];

export default function OnboardingPage() {
  const router = useRouter();

  // Navigation & Loading State
  const [step, setStep] = useState(1);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetched Catalog Data
  const [careerRoles, setCareerRoles] = useState<CareerRole[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);

  // Learner Onboarding Form State
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [customRole, setCustomRole] = useState<string>("");

  const [educationLevel, setEducationLevel] = useState("Undergraduate (B.Tech)");
  const [fieldOfStudy, setFieldOfStudy] = useState("Computer Science Engineering");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");

  // 🇮🇳 Hierarchical India Education Selection
  const [educationSelection, setEducationSelection] = useState<StructuredEducationSelection>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pathfinder_education_selection");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      education_level: "undergraduate",
      stream: "engineering-technology",
      specialization: "computer-science-engineering",
      qualification: "B.Tech"
    };
  });

  // 🇮🇳 JanSahay / SIH26101 Indian Education Taxonomy Profile
  const [indianProfile, setIndianProfile] = useState<SIH26101Profile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pathfinder_indian_stream_profile");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      country: "India",
      education_stage: "undergraduate",
      domain: "computer_it",
      stream: "cs_core",
      specialization: "Artificial Intelligence & Machine Learning (AI/ML)",
      qualification: "B.Tech CSE",
      current_role: "Student / Fresher",
      work_domain: "Artificial Intelligence & Machine Learning"
    };
  });

  const [selectedSkills, setSelectedSkills] = useState<Record<string, string>>({});
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [preferredFormats, setPreferredFormats] = useState<string[]>(["video", "hands-on", "projects"]);
  const [learningObjective, setLearningObjective] = useState("Placement / Career Goal");

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [synthesizedPath, setSynthesizedPath] = useState<LearningPath | null>(null);

  // 1. Initial Dynamic Data Fetching
  useEffect(() => {
    // Fetch authoritative career catalog
    api
      .getCareerCatalog()
      .then((res: CareerRole[]) => {
        if (res && res.length > 0) {
          setCareerRoles(res);
          setSelectedRole(res[0].role);
        }
      })
      .catch(() => {
        api
          .getGoalTemplates()
          .then((res: CareerRole[]) => {
            if (res && res.length > 0) {
              setCareerRoles(res);
              setSelectedRole(res[0].role);
            }
          })
          .catch(() => {});
      })
      .finally(() => setIsLoadingCatalog(false));

    // Fetch skills
    api
      .getSkills()
      .then((res: Skill[]) => {
        if (res && res.length > 0) {
          setAllSkills(res);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingSkills(false));

    // Fetch diagnostic assessment questions if available
    api
      .getAssessments()
      .then((res: any[]) => {
        if (res && res.length > 0 && res[0].questions) {
          setAssessmentQuestions(res[0].questions);
        }
      })
      .catch(() => {});
  }, []);

  // Filter skills relevant to selected career role if catalog provides target_skills
  const activeRoleDef = careerRoles.find((r) => r.role === (customRole || selectedRole));
  const relevantSkills = activeRoleDef?.target_skills
    ? allSkills.filter((s) => activeRoleDef.target_skills.includes(s.slug))
    : allSkills;

  const displaySkills = relevantSkills.length > 0 ? relevantSkills : allSkills;

  // Handlers for Form State
  const handleToggleSkill = (slug: string) => {
    setSelectedSkills((prev) => {
      const next = { ...prev };
      if (next[slug]) {
        delete next[slug];
      } else {
        next[slug] = "Beginner";
      }
      return next;
    });
  };

  const handleSetRating = (slug: string, rating: string) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [slug]: rating
    }));
  };

  const handleToggleFormat = (fmt: string) => {
    setPreferredFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]
    );
  };

  const handleSelectQuizOption = (qId: string, optIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  // Stepper Navigation
  const handleNext = () => {
    setError(null);
    if (step === 1 && !selectedRole && !customRole) {
      setError("Please choose a career destination to continue.");
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    } else if (step === 5) {
      handleSubmitOnboarding();
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  // Final Onboarding Submission
  const handleSubmitOnboarding = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      let token = getAuthToken();
      if (!token) {
        const randId = Math.floor(Math.random() * 10000);
        const authRes = await api.register({
          email: `learner_${randId}@pathfinder.io`,
          password: "Password123!",
          full_name: `Learner #${randId}`
        });
        token = authRes.access_token;
        if (token) setAuthToken(token);
      }

      const targetCareer = customRole.trim() || selectedRole;

      const skillPayload = Object.entries(selectedSkills).map(([slug, rating]) => {
        const skillObj = allSkills.find((s) => s.slug === slug);
        return {
          skill_id: skillObj ? skillObj.id : slug,
          self_rating: rating
        };
      });

      await api.completeOnboarding({
        education_level: educationLevel,
        field_of_study: fieldOfStudy,
        experience_level: experienceLevel,
        weekly_hours: weeklyHours,
        preferred_formats: preferredFormats,
        learning_objective: learningObjective,
        target_role: targetCareer,
        country: "India",
        education_stage: educationSelection.education_level,
        education_domain: educationSelection.stream,
        education_stream: educationSelection.specialization,
        specialization: educationSelection.custom_education_label || educationSelection.specialization,
        qualification: educationSelection.qualification,
        institution: educationSelection.institution,
        graduation_year: educationSelection.graduation_year,
        custom_education_label: educationSelection.custom_education_label,
        current_role: indianProfile.current_role,
        work_domain: indianProfile.work_domain,
        education_profile: {
          ...indianProfile,
          ...educationSelection
        },
        skills: skillPayload
      });

      // Fetch synthesized learning path
      const pathData = await api.getLearningPath();
      setSynthesizedPath(pathData);
      setStep(6);
    } catch (err: any) {
      console.error("Onboarding submission error", err);
      setError(
        err.message || "Failed to finalize onboarding. Please check your network and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if learner already has a completed profile or goal, and redirect to dashboard immediately
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getProfile().then((prof) => {
        if (prof && prof.goals && prof.goals.length > 0) {
          router.replace("/dashboard");
        }
      }).catch(() => {});
    }
  }, [router]);

  const handleFastTrackDashboard = async () => {
    setIsSubmitting(true);
    try {
      let token = getAuthToken();
      if (!token) {
        const demoRes = await api.demoLogin();
        token = demoRes.access_token;
        if (token) setAuthToken(token);
      }
      const targetCareer = customRole.trim() || selectedRole || "AI/ML Engineer";
      await api.completeOnboarding({
        education_level: educationSelection.qualification || "Undergraduate (B.Tech)",
        field_of_study: educationSelection.specialization || "Computer Science",
        experience_level: experienceLevel || "Beginner",
        weekly_hours: weeklyHours || 10,
        preferred_formats: preferredFormats || ["video", "hands-on", "projects"],
        learning_objective: learningObjective || "Placement / Career Goal",
        target_role: targetCareer,
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
        education_profile: {
          ...indianProfile,
          ...educationSelection
        }
      }).catch(() => {});
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-surface-border bg-surface/85 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
            <Compass className="h-4 w-4" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">PathFinder</span>
        </Link>

        {step <= 5 && (
          <div className="max-w-md w-full mx-4">
            <OnboardingProgress
              currentStep={step}
              totalSteps={5}
              steps={ONBOARDING_STEPS.slice(0, 5)}
              onStepClick={(s) => setStep(s)}
            />
          </div>
        )}

        <div className="hidden sm:block">
          <Link href="/dashboard" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Exit to Dashboard &rarr;
          </Link>
        </div>
      </header>

      {/* Main Guided Content Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          <Card variant="default" className="p-6 sm:p-8 shadow-2xl">
            {/* Quick Skip to Dashboard if details already filled */}
            <div className="mb-5 p-3 rounded-xl border border-primary-500/30 bg-primary-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Sparkles className="h-4 w-4 text-accent-cyan shrink-0" />
                <span>Already filled your details? Skip this setup and launch your personalized dashboard now.</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleFastTrackDashboard}
                isLoading={isSubmitting}
                className="shrink-0 text-xs py-1 px-3"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Go to Dashboard
              </Button>
            </div>

            {error && (
              <div className="mb-5">
                <Alert variant="danger" message={error} onClose={() => setError(null)} />
              </div>
            )}

            {/* STEP 1: Career Destination */}
            {step === 1 && (
              <CareerDestinationStep
                careerRoles={careerRoles}
                selectedRole={selectedRole}
                customRole={customRole}
                onSelectRole={setSelectedRole}
                onChangeCustomRole={setCustomRole}
                isLoading={isLoadingCatalog}
              />
            )}

            {/* STEP 2: Starting Point & Background */}
            {step === 2 && (
              <StartingPointStep
                educationLevel={educationLevel}
                fieldOfStudy={fieldOfStudy}
                experienceLevel={experienceLevel}
                onChangeEducation={setEducationLevel}
                onChangeField={setFieldOfStudy}
                onChangeExperience={setExperienceLevel}
                educationSelection={educationSelection}
                onChangeEducationSelection={(sel) => {
                  setEducationSelection(sel);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("pathfinder_education_selection", JSON.stringify(sel));
                  }
                }}
                indianProfile={indianProfile}
                onChangeIndianProfile={setIndianProfile}
              />
            )}

            {/* STEP 3: Skill Confidence */}
            {step === 3 && (
              <SkillConfidenceStep
                skills={displaySkills}
                selectedSkills={selectedSkills}
                targetRole={customRole || selectedRole}
                onToggleSkill={handleToggleSkill}
                onSetRating={handleSetRating}
                isLoading={isLoadingSkills}
              />
            )}

            {/* STEP 4: Learning Pace & Preferences */}
            {step === 4 && (
              <LearningPaceStep
                weeklyHours={weeklyHours}
                preferredFormats={preferredFormats}
                learningObjective={learningObjective}
                onChangeHours={setWeeklyHours}
                onToggleFormat={handleToggleFormat}
                onChangeObjective={setLearningObjective}
              />
            )}

            {/* STEP 5: Diagnostic Calibration */}
            {step === 5 && (
              <CalibrationStep
                questions={assessmentQuestions}
                answers={quizAnswers}
                onSelectOption={handleSelectQuizOption}
                targetRole={customRole || selectedRole}
              />
            )}

            {/* STEP 6: Path Preview & Synthesis */}
            {step === 6 && (
              <PathPreviewStep
                learningPath={synthesizedPath}
                targetRole={customRole || selectedRole}
              />
            )}

            {/* Bottom Navigation Buttons */}
            {step <= 5 && (
              <div className="mt-8 pt-5 border-t border-surface-border flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleBack}
                  disabled={step === 1 || isSubmitting}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleFastTrackDashboard}
                  isLoading={isSubmitting}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Skip & Go to Dashboard &rarr;
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  isLoading={isSubmitting}
                  rightIcon={step === 5 ? undefined : <ArrowRight className="h-4 w-4" />}
                >
                  {step === 5 ? "Synthesize My Path" : "Continue"}
                </Button>
              </div>
            )}
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
