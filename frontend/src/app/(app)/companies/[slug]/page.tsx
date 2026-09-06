'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CompanyDetail } from '@/lib/types';
import {
  Building2,
  CheckCircle2,
  MapPin,
  Globe2,
  ExternalLink,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Code2,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

export default function CompanyDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getCompany(slug)
      .then((data) => {
        setCompany(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load company details');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-slate-900 rounded-lg" />
          <div className="h-40 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Company Not Found</h2>
          <p className="text-sm text-slate-400">{error || "The requested company doesn't exist."}</p>
          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/companies"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Directory
          </Link>
        </div>

        {/* Company Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-medium uppercase tracking-wider rounded-md bg-blue-950/80 text-blue-400 border border-blue-800/80">
                  {company.company_type}
                </span>
                <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {company.industry}
                </span>
                {company.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Specification
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {company.display_name}
                </h1>
                <p className="text-sm text-slate-400 mt-1">{company.canonical_name}</p>
              </div>

              {company.description && (
                <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {company.description}
                </p>
              )}

              {/* Aliases */}
              {company.aliases && company.aliases.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-medium text-slate-500">Known as:</span>
                  <span className="text-slate-300">{company.aliases.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Quick Actions & Links */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                  Official Website
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
              {company.careers_url && (
                <a
                  href={company.careers_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Careers Portal
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-slate-500 font-medium">Headquarters</div>
              <div className="text-slate-200 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {company.headquarters_region ? `${company.headquarters_region}, ` : ''}
                {company.headquarters_country}
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Operating Hubs</div>
              <div className="text-slate-200 font-semibold mt-0.5 truncate">
                {(company.operating_regions || []).join(', ') || 'National'}
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Source Registry</div>
              <div className="text-slate-200 font-semibold mt-0.5 truncate flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {company.source}
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Registry Version</div>
              <div className="text-slate-200 font-semibold mt-0.5">
                v{company.version} (Verified)
              </div>
            </div>
          </div>
        </div>

        {/* Roles Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              Verified Roles & Specifications
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                {company.roles?.length || 0}
              </span>
            </h2>
          </div>

          {(!company.roles || company.roles.length === 0) ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center text-slate-400">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No active verified roles seeded yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Enterprise roles for this company are undergoing verification against hiring blue-prints.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.roles.map((role) => (
                <Link
                  key={role.id}
                  href={`/companies/${company.slug}/roles/${role.role_slug}`}
                  className="group block p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/40 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {role.display_name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{role.canonical_role_name}</p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {role.experience_level.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    {/* DSA Relevance Pill */}
                    <span
                      className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                        role.dsa_relevance === 'VERY_HIGH'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                          : role.dsa_relevance === 'HIGH'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                          : role.dsa_relevance === 'MEDIUM'
                          ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      DSA: {role.dsa_relevance.replace('_', ' ')}
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700 text-[11px]">
                      {role.remote_type}
                    </span>

                    {role.career_slug && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/50 text-emerald-300 border border-emerald-800/50 text-[11px]">
                        Career: {role.career_slug}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>{role.location_scope} Scope</span>
                    <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                      View Blueprint
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
