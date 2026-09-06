'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CompanyRoleDetail } from '@/lib/types';
import {
  Building2,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Code2,
  Server,
  Database,
  Cpu,
  Globe2,
  Sparkles,
  ExternalLink,
  Target,
  Wrench,
  GraduationCap,
  Layers,
  AlertCircle
} from 'lucide-react';

export default function CompanyRoleDetailPage() {
  const params = useParams();
  const companySlug = params?.slug as string;
  const roleSlug = params?.roleSlug as string;

  const [role, setRole] = useState<CompanyRoleDetail | null>(null);
  const [profileReqs, setProfileReqs] = useState<any | null>(null);
  const [learnerFit, setLearnerFit] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companySlug || !roleSlug) return;
    setLoading(true);

    Promise.all([
      api.getCompanyRole(companySlug, roleSlug),
      api.getCompanyRoleRequirementsProfile(companySlug, roleSlug)
    ])
      .then(([roleData, reqsData]) => {
        setRole(roleData);
        setProfileReqs(reqsData);
        setError(null);

        // Fetch learner profile fit if user profile exists
        api.getProfile()
          .then((p: any) => {
            if (p && p.id) {
              api.get(`/companies/${companySlug}/roles/${roleSlug}/learner-fit/${p.id}`)
                .then((fitRes: any) => setLearnerFit(fitRes.data))
                .catch(() => {});
            }
          })
          .catch(() => {});
      })
      .catch((err) => {
        setError(err.message || 'Failed to load role specification');
      })
      .finally(() => setLoading(false));
  }, [companySlug, roleSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 w-36 bg-slate-900 rounded-lg" />
          <div className="h-44 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="h-60 bg-slate-900 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Role Specification Not Found</h2>
          <p className="text-sm text-slate-400">{error || "The requested role doesn't exist."}</p>
          <Link
            href={`/companies/${companySlug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Company
          </Link>
        </div>
      </div>
    );
  }

  const skillsList = profileReqs?.skills || role.skill_requirements || [];
  const dsaList = profileReqs?.dsa_requirements || role.dsa_requirements || [];
  const techList = profileReqs?.technology_requirements || role.tech_requirements || [];
  const interviewList = profileReqs?.interview_topics || role.interview_topics || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/companies" className="hover:text-white transition-colors">
            Companies
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href={`/companies/${companySlug}`} className="hover:text-white transition-colors">
            {role.company_name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 truncate">{role.display_name}</span>
        </div>

        {/* Role Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-medium uppercase tracking-wider rounded-md bg-blue-950/80 text-blue-400 border border-blue-800/80">
              {role.company_name}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium uppercase rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {role.experience_level.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {role.remote_type}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Employer Blueprint
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {role.display_name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Canonical Role: <span className="text-slate-300 font-medium">{role.canonical_role_name}</span>
            </p>
          </div>

          {role.description && (
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {role.description}
            </p>
          )}

          {/* Canonical Career Link */}
          {role.career_slug && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400 font-medium">Mapped Canonical Career (Phase 11)</div>
                  <div className="text-sm font-semibold text-white capitalize">{role.career_slug.replace(/-/g, ' ')}</div>
                </div>
              </div>
              <Link
                href={`/careers/${role.career_slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold border border-blue-500/30 transition-colors"
              >
                View Career Universe
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Learner Fit Card (if available) */}
        {learnerFit && (
          <div className="p-6 rounded-3xl bg-blue-950/20 border border-blue-800/40 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Learner Evidence Alignment
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Personalized Role Fit & Gap Analysis
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Fit Score</div>
                  <div className="text-2xl font-black text-blue-400">{learnerFit.overall_fit_score}%</div>
                </div>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    learnerFit.readiness_tier === 'INTERVIEW_READY'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : learnerFit.readiness_tier === 'MODERATE_ALIGNMENT'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  }`}
                >
                  {learnerFit.readiness_tier.replace('_', ' ')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {learnerFit.recommendation}
            </p>

            {learnerFit.identified_skill_gaps && learnerFit.identified_skill_gaps.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Target Skill Gaps to Close
                </div>
                <div className="flex flex-wrap gap-2">
                  {learnerFit.identified_skill_gaps.map((gap: any, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-medium"
                    >
                      {gap.skill_name} ({gap.minimum_level})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Requirements Blueprint Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grounded Skills */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              Verified Skill Requirements
            </h2>

            {skillsList.length === 0 ? (
              <p className="text-xs text-slate-400">
                Skills derived from canonical career taxonomy baseline.
              </p>
            ) : (
              <div className="space-y-3">
                {skillsList.map((sk: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">{sk.skill_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Minimum: <span className="text-slate-200">{sk.minimum_level}</span> • {sk.requirement_type}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {sk.importance}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DSA Topic Benchmarks */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-400" />
                DSA Benchmarks & Difficulty Targets
              </h2>
              <Link
                href="/learning/dsa"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5"
              >
                DSA Curriculum
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {dsaList.length === 0 ? (
              <p className="text-xs text-slate-400">
                General algorithmic problem solving applicable.
              </p>
            ) : (
              <div className="space-y-3">
                {dsaList.map((dsa: any, i: number) => (
                  <Link
                    key={i}
                    href={`/learning/dsa/${dsa.dsa_topic_slug}`}
                    className="group block p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-blue-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {dsa.dsa_topic_name || dsa.dsa_topic_slug}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          dsa.difficulty_target === 'HARD'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : dsa.difficulty_target === 'MEDIUM'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        Target: {dsa.difficulty_target}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Technology Requirements */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-400" />
              Technology Stack & Tools
            </h2>

            {techList.length === 0 ? (
              <p className="text-xs text-slate-400">
                Technology stack varies by internal team placement.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {techList.map((t: any, i: number) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2 text-xs"
                  >
                    <span className="font-semibold text-white">{t.technology_name}</span>
                    <span className="text-[10px] text-slate-400">({t.category.replace('_', ' ')})</span>
                    {t.is_mandatory && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        Required
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interview Topics Blueprint */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Interview Topics & Assessment Rounds
            </h2>

            {interviewList.length === 0 ? (
              <p className="text-xs text-slate-400">
                Standard technical evaluation rounds apply.
              </p>
            ) : (
              <div className="space-y-3">
                {interviewList.map((it: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">{it.topic_name}</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        Weight {it.weight}x
                      </span>
                    </div>
                    {it.focus_areas && it.focus_areas.length > 0 && (
                      <div className="text-[11px] text-slate-400">
                        Focus: {it.focus_areas.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
