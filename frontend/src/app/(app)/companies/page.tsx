'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CompanySummary } from '@/lib/types';
import {
  Building2,
  Search,
  CheckCircle2,
  MapPin,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  Layers,
  Globe2
} from 'lucide-react';

export default function CompaniesDirectoryPage() {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [industries, setIndustries] = useState<string[]>([]);

  // Fetch industries for filter dropdown
  useEffect(() => {
    api.getCompanyIndustries()
      .then((res: string[]) => setIndustries(res || []))
      .catch((err) => console.error('Error fetching industries:', err));
  }, []);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page,
        page_size: 24,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedIndustry) params.industry = selectedIndustry;
      if (selectedCountry) params.country = selectedCountry;

      const res = await api.getCompanies(params);
      setCompanies(res.items || []);
      setTotalCount(res.total_count || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedIndustry, selectedCountry]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCompanies();
  };

  const totalPages = Math.ceil(totalCount / 24) || 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Phase 12 Company & Role Intelligence
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl flex items-center gap-3">
                <Building2 className="w-9 h-9 text-blue-500" />
                Enterprise Company Directory
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-3xl">
                Explore 250+ enterprise companies across India and global markets with verified role specifications,
                DSA benchmarks, CS fundamentals requirements, and skill alignments.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-right">
                <div className="text-xs text-slate-400 font-medium">Verified Companies</div>
                <div className="text-2xl font-bold text-blue-400">{totalCount}</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-3">
            <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by company name, alias, or keyword (e.g. Google, Tata, Cloud)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </form>

            {/* Industry Filter */}
            <div className="md:col-span-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={selectedIndustry}
                  onChange={(e) => {
                    setSelectedIndustry(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by Industry"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Industries</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Country Filter */}
            <div className="md:col-span-3">
              <div className="relative">
                <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by Country"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">All Headquarters</option>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="Germany">Germany</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Japan">Japan</option>
                  <option value="Taiwan">Taiwan</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-950/40 border border-rose-800/60 p-6 text-center text-rose-300">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => loadCompanies()}
              className="mt-3 px-4 py-1.5 bg-rose-800 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-12 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-semibold text-slate-300">No companies found</p>
            <p className="text-xs text-slate-500 mt-1">Try relaxing your search query or industry filter.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {companies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.slug}`}
                  className="group block p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                          {company.display_name}
                        </h3>
                        {company.is_verified && (
                          <span title="Verified Enterprise Specification" className="shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{company.canonical_name}</p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {company.company_type}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate text-slate-300">{company.industry}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">
                        {company.headquarters_region ? `${company.headquarters_region}, ` : ''}
                        {company.headquarters_country}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300 font-medium">{company.roles_count}</span>{' '}
                      {company.roles_count === 1 ? 'verified role' : 'verified roles'}
                    </span>
                    <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                      Explore
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                <div className="text-xs text-slate-400">
                  Showing <span className="text-slate-200 font-medium">{(page - 1) * 24 + 1}</span> to{' '}
                  <span className="text-slate-200 font-medium">{Math.min(page * 24, totalCount)}</span> of{' '}
                  <span className="text-slate-200 font-medium">{totalCount}</span> companies
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-400 px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
