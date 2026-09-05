"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PriceBadge } from "./PriceBadge";

export interface CourseItem {
  id: string;
  title: string;
  slug: string;
  provider: string;
  url: string;
  resource_type: string;
  difficulty: string;
  estimated_hours: number;
  quality_score: number;
  language: string;
  skills: string[];
  dsa_topics: string[];
  price_type: string;
  learning_cost: number;
  certificate_cost: string;
  free_learning: boolean;
  free_certificate: boolean;
  verification_status: string;
  source: string;
  description: string;
}

interface CourseExplorerProps {
  initialDsaTopic?: string;
  initialSkill?: string;
}

export const CourseExplorer: React.FC<CourseExplorerProps> = ({
  initialDsaTopic,
  initialSkill,
}) => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("ALL");
  const [difficulty, setDifficulty] = useState("ALL");

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("q", search);
      if (initialDsaTopic) params.append("dsa_topic", initialDsaTopic);
      if (initialSkill) params.append("skill", initialSkill);
      if (priceFilter !== "ALL") params.append("price", priceFilter);
      if (difficulty !== "ALL") params.append("difficulty", difficulty);

      const res = await fetch(`/api/v1/resources/courses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, priceFilter, difficulty, initialDsaTopic, initialSkill]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search verified courses, platforms (e.g. MIT, NPTEL, Coursera)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Pricing Models</option>
              <option value="GENUINELY_FREE">100% Free Learning</option>
              <option value="FREE_TO_ENROLL_PAID_CERTIFICATE">Free to Enroll (Optional Paid Cert)</option>
              <option value="FREE_AUDIT_PAID_CERTIFICATE">Free Audit (Paid Cert)</option>
              <option value="SUBSCRIPTION_REQUIRED">Subscription</option>
              <option value="PAID">Paid</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 animate-pulse">
          Loading verified learning catalog...
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          No courses matching your filter criteria. Try adjusting the pricing or difficulty filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300 transition-all shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {course.provider}
                  </span>
                  <PriceBadge
                    priceType={course.price_type}
                    learningCost={course.learning_cost}
                    size="sm"
                  />
                </div>

                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {course.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {course.difficulty}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {course.estimated_hours}h
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {course.language}
                  </span>
                  {course.skills.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  ✓ {course.verification_status} ({course.source})
                </span>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Go to Resource ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
