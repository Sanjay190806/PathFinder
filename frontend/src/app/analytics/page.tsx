'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { AIAssistantDrawer } from "@/components/AIAssistantDrawer";
import { api, getAuthToken, setAuthToken } from "@/lib/api";
import {
  AnalyticsSummary, Profile, AnalyticsOverview, CourseAnalytics,
  AssessmentAnalytics, SyllabusAnalytics, SkillAnalytics,
  LearningConsistency, PlannerAnalytics, CareerReadinessAnalytics,
  IntegrityAnalytics, MetricDefinition
} from "@/lib/types";

import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsSkeleton } from "@/components/analytics/AnalyticsSkeleton";
import { AnalyticsErrorState } from "@/components/analytics/AnalyticsErrorState";
import { AnalyticsEmptyState } from "@/components/analytics/AnalyticsEmptyState";

import { OverviewAuthoritativeKPIs } from "@/components/analytics/OverviewAuthoritativeKPIs";
import { CourseAndAssessmentAnalytics } from "@/components/analytics/CourseAndAssessmentAnalytics";
import { SyllabusMasteryAnalytics } from "@/components/analytics/SyllabusMasteryAnalytics";
import { SkillAndReadinessAnalytics } from "@/components/analytics/SkillAndReadinessAnalytics";
import { ConsistencyAndPlannerAnalytics } from "@/components/analytics/ConsistencyAndPlannerAnalytics";
import { IntegrityAuditSummary } from "@/components/analytics/IntegrityAuditSummary";
import { MetricDefinitionsModal } from "@/components/analytics/MetricDefinitionsModal";

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [courseData, setCourseData] = useState<CourseAnalytics | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentAnalytics | null>(null);
  const [syllabusData, setSyllabusData] = useState<SyllabusAnalytics | null>(null);
  const [skillData, setSkillData] = useState<SkillAnalytics | null>(null);
  const [consistencyData, setConsistencyData] = useState<LearningConsistency | null>(null);
  const [plannerData, setPlannerData] = useState<PlannerAnalytics | null>(null);
  const [readinessData, setReadinessData] = useState<CareerReadinessAnalytics | null>(null);
  const [integrityData, setIntegrityData] = useState<IntegrityAnalytics | null>(null);
  const [definitions, setDefinitions] = useState<MetricDefinition[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isDefinitionsOpen, setIsDefinitionsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'courses' | 'syllabus' | 'skills' | 'consistency'>('all');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        await api.demoLogin();
        setAuthToken('cookie');
      }

      const [
        profRes,
        overviewRes,
        courseRes,
        assessmentRes,
        syllabusRes,
        skillRes,
        consistencyRes,
        plannerRes,
        readinessRes,
        integrityRes,
        defsRes
      ] = await Promise.allSettled([
        api.getProfile(),
        api.getAnalyticsOverview(),
        api.getCourseAnalytics(),
        api.getAssessmentAnalytics(),
        api.getSyllabusAnalytics(),
        api.getSkillAnalytics(),
        api.getLearningConsistency(),
        api.getPlannerAnalytics(),
        api.getCareerReadinessAnalytics(),
        api.getIntegrityAnalytics(),
        api.getMetricDefinitions()
      ]);

      if (profRes.status === "fulfilled") setProfile(profRes.value);
      if (overviewRes.status === "fulfilled") setOverview(overviewRes.value);
      if (courseRes.status === "fulfilled") setCourseData(courseRes.value);
      if (assessmentRes.status === "fulfilled") setAssessmentData(assessmentRes.value);
      if (syllabusRes.status === "fulfilled") setSyllabusData(syllabusRes.value);
      if (skillRes.status === "fulfilled") setSkillData(skillRes.value);
      if (consistencyRes.status === "fulfilled") setConsistencyData(consistencyRes.value);
      if (plannerRes.status === "fulfilled") setPlannerData(plannerRes.value);
      if (readinessRes.status === "fulfilled") setReadinessData(readinessRes.value);
      if (integrityRes.status === "fulfilled") setIntegrityData(integrityRes.value);
      if (defsRes.status === "fulfilled") setDefinitions(defsRes.value);
    } catch (err: any) {
      console.error("Error loading authoritative analytics", err);
      setError(err.message || "Failed to load authoritative learning analytics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasData = overview !== null || (courseData && courseData.courses.length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Global Navigation */}
      <Navbar
        user={profile}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
        {isLoading ? (
          <AnalyticsSkeleton />
        ) : error ? (
          <AnalyticsErrorState error={error} onRetry={loadData} />
        ) : !hasData ? (
          <AnalyticsEmptyState />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <AnalyticsHeader
              profile={profile}
              onOpenAssistant={() => setIsAssistantOpen(true)}
            />

            {/* Authoritative KPI Bar */}
            <OverviewAuthoritativeKPIs
              overview={overview}
              onOpenDefinitions={() => setIsDefinitionsOpen(true)}
            />

            {/* Section Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-raised/80 rounded-xl border border-surface-border overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveSection('all')}
                className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeSection === 'all'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Complete Dashboard
              </button>
              <button
                onClick={() => setActiveSection('courses')}
                className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeSection === 'courses'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Courses & Assessments
              </button>
              <button
                onClick={() => setActiveSection('syllabus')}
                className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeSection === 'syllabus'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Syllabus Performance
              </button>
              <button
                onClick={() => setActiveSection('skills')}
                className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeSection === 'skills'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Skills & Readiness
              </button>
              <button
                onClick={() => setActiveSection('consistency')}
                className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeSection === 'consistency'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Consistency & Planner
              </button>
            </div>

            {/* Section Content */}
            {(activeSection === 'all' || activeSection === 'courses') && (
              <CourseAndAssessmentAnalytics
                courseData={courseData}
                assessmentData={assessmentData}
              />
            )}

            {(activeSection === 'all' || activeSection === 'syllabus') && (
              <SyllabusMasteryAnalytics
                syllabusData={syllabusData}
              />
            )}

            {(activeSection === 'all' || activeSection === 'skills') && (
              <SkillAndReadinessAnalytics
                skillData={skillData}
                readinessData={readinessData}
              />
            )}

            {(activeSection === 'all' || activeSection === 'consistency') && (
              <ConsistencyAndPlannerAnalytics
                consistencyData={consistencyData}
                plannerData={plannerData}
              />
            )}

            {/* Separate Assessment Integrity Proctored Audit */}
            <IntegrityAuditSummary
              integrityData={integrityData}
            />
          </div>
        )}
      </main>

      {/* Metric Definitions Modal */}
      <MetricDefinitionsModal
        isOpen={isDefinitionsOpen}
        onClose={() => setIsDefinitionsOpen(false)}
        definitions={definitions}
      />

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onPlanAdjusted={loadData}
      />
    </div>
  );
}
