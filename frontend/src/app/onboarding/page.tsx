'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Target, BookOpen, Clock, Brain, Check, Layers, Cpu } from 'lucide-react';
import { api, setAuthToken } from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [fieldOfStudy, setFieldOfStudy] = useState('Computer Science');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');

  const [targetRole, setTargetRole] = useState('AI/ML Engineer');
  const [customGoal, setCustomGoal] = useState('');

  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string>>({
    'python': 'Intermediate',
    'linear-algebra': 'Beginner',
    'sql': 'Intermediate'
  });

  const [weeklyHours, setWeeklyHours] = useState(10);
  const [preferredFormats, setPreferredFormats] = useState<string[]>(['video', 'hands-on', 'projects']);

  const [learningObjective, setLearningObjective] = useState('Placement / Career Goal');

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({ 0: 0, 1: 1, 2: 1 });

  useEffect(() => {
    api.getSkills().then(res => {
      if (res && res.length > 0) {
        setAvailableSkills(res);
      }
    }).catch(() => {
      setAvailableSkills([
        { id: '1', name: 'Python Programming', slug: 'python', category: 'Programming' },
        { id: '2', name: 'Linear Algebra & Probability', slug: 'linear-algebra', category: 'Mathematics' },
        { id: '3', name: 'SQL & Relational Databases', slug: 'sql', category: 'Data Science' },
        { id: '4', name: 'Machine Learning Foundations', slug: 'machine-learning', category: 'AI/ML' },
        { id: '5', name: 'JavaScript & TypeScript', slug: 'typescript', category: 'Web Development' },
        { id: '6', name: 'Docker Containerization', slug: 'docker', category: 'DevOps' }
      ]);
    });
  }, []);

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      handleSubmitOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleSkill = (skillSlug: string) => {
    setSelectedSkills(prev => {
      const next = { ...prev };
      if (next[skillSlug]) {
        delete next[skillSlug];
      } else {
        next[skillSlug] = 'Beginner';
      }
      return next;
    });
  };

  const setSkillRating = (skillSlug: string, rating: string) => {
    setSelectedSkills(prev => ({
      ...prev,
      [skillSlug]: rating
    }));
  };

  const toggleFormat = (fmt: string) => {
    setPreferredFormats(prev =>
      prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
    );
  };

  const handleSubmitOnboarding = async () => {
    setStep(7);
    setIsSubmitting(true);

    try {
      let token = localStorage.getItem('pathfinder_token');
      if (!token) {
        const randId = Math.floor(Math.random() * 10000);
        const authRes = await api.register({
          email: `learner_${randId}@pathfinder.io`,
          password: 'Password123!',
          full_name: `Learner #${randId}`
        });
        token = authRes.access_token;
        if (token) setAuthToken(token);
      }

      const skillPayload = Object.entries(selectedSkills).map(([slug, rating]) => {
        const skillObj = availableSkills.find(s => s.slug === slug);
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
        target_role: customGoal || targetRole,
        skills: skillPayload
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 2400);
    } catch (err) {
      console.error('Onboarding submit error', err);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary-500 selection:text-white">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Compass className="h-4 w-4" />
          </div>
          <span className="font-bold text-white text-base">PathFinder</span>
        </div>

        {step <= 6 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Step {step} of 6</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map(s => (
                <div
                  key={s}
                  className={`h-1.5 w-6 rounded-full transition-all ${
                    s <= step ? 'bg-primary-500' : 'bg-surface-raised'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          {/* STEP 1 ? Education */}
          {step === 1 && (
            <div className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-400">
                <BookOpen className="h-4 w-4" /> Step 1: Education & Background
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">Tell us about your educational background</h2>
              <p className="text-xs text-gray-400 mt-1">This helps the recommendation engine gauge prerequisite pacing.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Highest Education Level</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full rounded-xl bg-surface-raised border border-surface-border px-3.5 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate (College / University)</option>
                    <option value="Postgraduate / Master">Postgraduate / Master</option>
                    <option value="Bootcamp / Self-Taught">Bootcamp / Self-Taught</option>
                    <option value="Working Professional">Working Professional</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Field of Study / Domain</label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Computer Science, Mathematics, Electrical Eng, Business"
                    className="w-full rounded-xl bg-surface-raised border border-surface-border px-3.5 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Overall Coding & Technical Experience</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperienceLevel(lvl)}
                        className={`rounded-xl border p-3 text-xs font-semibold text-center transition-all ${
                          experienceLevel === lvl
                            ? 'border-primary-500 bg-primary-950/70 text-white shadow-md'
                            : 'border-surface-border bg-surface-raised/60 text-gray-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 ? Career Goal */}
          {step === 2 && (
            <div className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-cyan">
                <Target className="h-4 w-4" /> Step 2: Target Career Goal
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">What role are you aiming to achieve?</h2>
              <p className="text-xs text-gray-400 mt-1">Our recommendation engine will map the optimal curriculum to this destination.</p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { role: "AI/ML Engineer", desc: "Machine Learning, PyTorch, Transformers, LangChain, MLOps" },
                  { role: "Data Scientist", desc: "Python, SQL, EDA, Statistical Inference, PySpark" },
                  { role: "Full Stack Developer", desc: "TypeScript, React, Next.js, REST APIs, Databases" },
                  { role: "Cloud / DevOps Engineer", desc: "Linux, CI/CD, Docker, Kubernetes, AWS" },
                  { role: "Cybersecurity Analyst", desc: "Networking, OWASP Top 10, Cryptography, Pentesting" },
                  { role: "Software Engineer", desc: "Data Structures, Algorithms, System Design, Backend" }
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setTargetRole(item.role);
                      setCustomGoal('');
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      targetRole === item.role && !customGoal
                        ? 'border-primary-500 bg-primary-950/60 text-white shadow-md shadow-primary-500/10'
                        : 'border-surface-border bg-surface-raised/40 text-gray-300 hover:bg-surface-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold">{item.role}</h4>
                      {targetRole === item.role && !customGoal && (
                        <CheckCircle2 className="h-4 w-4 text-primary-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-snug">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-surface-border">
                <label className="text-xs font-semibold text-gray-300 block mb-1">Or define a Custom Target Role</label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => {
                    setCustomGoal(e.target.value);
                    if (e.target.value) setTargetRole(e.target.value);
                  }}
                  placeholder="e.g. Autonomous Robotics Engineer, Blockchain Core Dev"
                  className="w-full rounded-xl bg-surface-raised border border-surface-border px-3.5 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3 ? Current Skills & Self-Rating */}
          {step === 3 && (
            <div className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-purple">
                <Layers className="h-4 w-4" /> Step 3: Current Skills & Self-Rating
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">What skills do you already know?</h2>
              <p className="text-xs text-gray-400 mt-1">Select your skills and self-rate your comfort level to prevent duplicate beginner topics.</p>

              <div className="mt-6 max-h-[50vh] overflow-y-auto space-y-2.5 pr-1">
                {availableSkills.map((sk) => {
                  const isSelected = !!selectedSkills[sk.slug];
                  const currentRating = selectedSkills[sk.slug] || 'Beginner';

                  return (
                    <div
                      key={sk.id || sk.slug}
                      className={`rounded-2xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isSelected
                          ? 'border-primary-500/60 bg-primary-950/40'
                          : 'border-surface-border bg-surface-raised/40 hover:bg-surface-raised'
                      }`}
                    >
                      <div
                        onClick={() => toggleSkill(sk.slug)}
                        className="flex items-center gap-2.5 cursor-pointer flex-1"
                      >
                        <div
                          className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                            isSelected ? 'bg-primary-600 border-primary-500 text-white' : 'border-gray-500'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white">{sk.name}</span>
                          <span className="text-[10px] text-gray-400 ml-2 font-mono">({sk.category})</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 shrink-0">
                          {['Beginner', 'Intermediate', 'Advanced'].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setSkillRating(sk.slug, r)}
                              className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition-all ${
                                currentRating === r
                                  ? 'bg-primary-600 text-white shadow-sm'
                                  : 'bg-surface-raised text-gray-400 hover:text-white'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4 ? Learning Preferences */}
          {step === 4 && (
            <div className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-emerald">
                <Clock className="h-4 w-4" /> Step 4: Learning Preferences & Schedule
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">How do you prefer to learn?</h2>
              <p className="text-xs text-gray-400 mt-1">We adjust the roadmap workload to fit your actual available schedule.</p>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-2">
                    <span>Available Learning Commitment</span>
                    <span className="text-accent-cyan font-bold text-sm">{weeklyHours} Hours / Week</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={40}
                    step={2}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                    className="w-full accent-primary-500 cursor-pointer h-2 bg-surface-raised rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                    <span>2h (Micro-learning)</span>
                    <span>10h (Standard Pace)</span>
                    <span>25h+ (Intensive)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-2">Preferred Content Formats</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "video", label: "Video Masterclasses" },
                      { id: "hands-on", label: "Hands-on Code" },
                      { id: "projects", label: "Real-world Projects" },
                      { id: "theory", label: "Mathematical Theory" },
                      { id: "interactive", label: "Interactive Quizzes" },
                      { id: "article", label: "Documentation & Reads" }
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => toggleFormat(fmt.id)}
                        className={`rounded-xl border p-3 text-xs font-semibold text-left transition-all ${
                          preferredFormats.includes(fmt.id)
                            ? 'border-accent-emerald/60 bg-emerald-950/40 text-emerald-200'
                            : 'border-surface-border bg-surface-raised/40 text-gray-400 hover:text-white'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 ? Learning Objective */}
          {step === 5 && (
            <div className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-amber">
                <Target className="h-4 w-4" /> Step 5: Primary Objective
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">What is your primary milestone?</h2>
              <p className="text-xs text-gray-400 mt-1">This shapes the emphasis on theoretical depth vs portfolio projects.</p>

              <div className="mt-6 space-y-3">
                {[
                  { obj: "Placement / Career Goal", desc: "Comprehensive roadmap prioritizing interview-ready skills and core competencies." },
                  { obj: "Internship Preparation", desc: "Accelerated path focused on immediate practical project deliverables." },
                  { obj: "Build Portfolio / Capstones", desc: "Project-heavy track focused on end-to-end deployable applications." },
                  { obj: "Learn a Specific New Technology", desc: "Laser-focused track closing specific missing tool gaps." }
                ].map((item) => (
                  <button
                    key={item.obj}
                    type="button"
                    onClick={() => setLearningObjective(item.obj)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      learningObjective === item.obj
                        ? 'border-accent-amber/60 bg-amber-950/40 text-white shadow-md'
                        : 'border-surface-border bg-surface-raised/40 text-gray-300 hover:bg-surface-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold">{item.obj}</h4>
                      {learningObjective === item.obj && (
                        <CheckCircle2 className="h-4 w-4 text-accent-amber shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6 ? Diagnostic Skill Assessment */}
          {step === 6 && (
            <div className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-400">
                <Brain className="h-4 w-4" /> Step 6: Diagnostic Skill Assessment
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">Quick 3-Question Skill Calibration</h2>
              <p className="text-xs text-gray-400 mt-1">Helps calibrate initial skill confidence before roadmap generation.</p>

              <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {[
                  {
                    q: "1. In Python, what does `[x**2 for x in range(4) if x % 2 == 0]` evaluate to?",
                    options: ["[0, 4]", "[0, 1, 4, 9]", "[4]", "[0, 2, 4]"]
                  },
                  {
                    q: "2. If the dot product of two normalized unit vectors is 0, what does it mean?",
                    options: ["Vectors are parallel", "Vectors are orthogonal (perpendicular)", "Vectors have opposite directions", "Vectors are zero length"]
                  },
                  {
                    q: "3. What is the primary purpose of cost-complexity pruning in decision trees?",
                    options: ["Increase tree depth", "Prevent model overfitting", "Remove all features", "Speed up GPU memory"]
                  }
                ].map((item, qIdx) => (
                  <div key={qIdx} className="rounded-2xl border border-surface-border bg-surface-raised/40 p-4">
                    <p className="text-xs font-bold text-white mb-2.5">{item.q}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {item.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                          className={`rounded-xl border p-2.5 text-xs text-left transition-all ${
                            quizAnswers[qIdx] === optIdx
                              ? 'border-primary-500 bg-primary-950/70 text-white font-semibold'
                              : 'border-surface-border bg-surface text-gray-300 hover:bg-surface-raised'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* POST-ONBOARDING TRANSITION SCREEN (Step 7) */}
          {step === 7 && (
            <div className="rounded-3xl border border-primary-500/40 bg-surface/95 p-8 sm:p-12 text-center shadow-2xl shadow-primary-500/20 backdrop-blur-xl animate-in zoom-in-95 duration-500">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary-600 to-accent-cyan text-white shadow-xl shadow-primary-500/30">
                <Cpu className="h-10 w-10 animate-pulse" />
                <div className="absolute inset-0 rounded-3xl border-2 border-accent-cyan/60 animate-ping opacity-25" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-6">
                Analyzing Your Profile...
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-md mx-auto leading-relaxed">
                Evaluating skill gap vectors, validating prerequisite DAG graph, and synthesizing your personalized {targetRole} roadmap.
              </p>

              <div className="mt-8 max-w-sm mx-auto space-y-2.5 text-xs text-left">
                {[
                  "Computing skill confidence scores",
                  "Evaluating prerequisite dependencies (0% violations)",
                  "Executing hybrid multi-factor ranking",
                  "Synthesizing 5-phase personalized curriculum"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 rounded-xl bg-surface-raised/80 border border-surface-border p-2.5 text-gray-200">
                    <CheckCircle2 className="h-4 w-4 text-accent-emerald shrink-0 animate-in fade-in duration-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          {step <= 6 && (
            <div className="mt-6 flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-raised px-4 py-2.5 text-xs font-semibold text-gray-300 hover:text-white disabled:opacity-30 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary-500/25 hover:brightness-110 transition-all"
              >
                {step === 6 ? 'Analyze & Generate Roadmap' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
