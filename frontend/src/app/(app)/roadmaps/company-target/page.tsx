"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CompanyAwareRoadmap, CompanyRoadmapData } from "@/components/roadmap/CompanyAwareRoadmap";

export default function CompanyTargetRoadmapPage() {
  const [companySlug, setCompanySlug] = useState("google");
  const [roleSlug, setRoleSlug] = useState("software-engineer");
  const [learnerId, setLearnerId] = useState("default-learner");
  const [roadmap, setRoadmap] = useState<CompanyRoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = async (cSlug: string, rSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/company-roadmaps/generate?company_slug=${cSlug}&role_slug=${rSlug}&learner_id=${learnerId}`
      );
      if (!res.ok) {
        throw new Error(`Failed to generate roadmap (HTTP ${res.status})`);
      }
      const data = await res.json();
      setRoadmap(data);
    } catch (err: any) {
      setError(err.message || "Failed to load company roadmap");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap(companySlug, roleSlug);
  }, []);

  const handleSwitchCompany = (newSlug: string) => {
    setCompanySlug(newSlug);
    fetchRoadmap(newSlug, roleSlug);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/companies" className="hover:text-indigo-600 transition-colors">
            Companies
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Company Learning Roadmap</span>
        </div>

        {/* Controls */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Target Employer
              </label>
              <select
                value={companySlug}
                onChange={(e) => {
                  setCompanySlug(e.target.value);
                  fetchRoadmap(e.target.value, roleSlug);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="google">Google</option>
                <option value="amazon">Amazon</option>
                <option value="nvidia">NVIDIA</option>
                <option value="zerodha">Zerodha</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Target Role
              </label>
              <select
                value={roleSlug}
                onChange={(e) => {
                  setRoleSlug(e.target.value);
                  fetchRoadmap(companySlug, e.target.value);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="software-engineer">Software Engineer</option>
                <option value="ai-ml-engineer">AI/ML Engineer</option>
                <option value="vlsi-hardware-engineer">VLSI / Hardware Engineer</option>
                <option value="sde-1">SDE-1</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Comparing across top enterprises</span>
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 animate-pulse">
            Synthesizing personalized learning roadmap from company hiring blueprints...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
            {error}
          </div>
        )}

        {roadmap && !loading && (
          <CompanyAwareRoadmap roadmap={roadmap} onSwitchCompany={handleSwitchCompany} />
        )}
      </div>
    </main>
  );
}
