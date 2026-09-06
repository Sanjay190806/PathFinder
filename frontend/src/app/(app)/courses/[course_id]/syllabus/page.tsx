'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, RefreshCw, AlertTriangle, Award } from 'lucide-react';
import { AIAssistantDrawer } from '@/components/AIAssistantDrawer';
import { api, getAuthToken, setAuthToken } from '@/lib/api';
import {
  SyllabusDetail,
  CoverageData,
  SyllabusOverview,
  SyllabusCoverage,
  ModuleList
} from '@/components/syllabus/SyllabusComponents';

export default function CourseSyllabusPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.course_id as string;

  const [syllabus, setSyllabus] = useState<SyllabusDetail | null>(null);
  const [coverage, setCoverage] = useState<CoverageData | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  const loadSyllabusData = useCallback(async (version?: number) => {
    if (!courseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        await api.demoLogin();
        setAuthToken('cookie');
      }

      // Fetch syllabus (active or specific version), coverage, and version list
      const [sylData, covData, verList] = await Promise.all([
        version ? api.getCourseSyllabusVersion(courseId, version) : api.getCourseSyllabus(courseId),
        api.getCourseSyllabusCoverage(courseId).catch(() => null),
        api.getCourseSyllabusVersions(courseId).catch(() => [])
      ]);

      setSyllabus(sylData);
      setCoverage(covData);
      setVersions(verList || []);
      setSelectedVersion(sylData?.version || 1);
    } catch (err: any) {
      console.error('Failed to load course syllabus', err);
      setError(err.message || 'Course syllabus could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadSyllabusData();
  }, [loadSyllabusData]);

  // Toggle Topic Completion
  const handleToggleTopic = async (topicId: string, isCompleted: boolean) => {
    try {
      const updatedCov = await api.updateCourseSyllabusProgress(courseId, {
        topic_id: topicId,
        is_topic_completed: isCompleted
      });
      setCoverage(updatedCov);
    } catch (err: any) {
      console.error('Failed to update topic progress', err);
    }
  };

  // Toggle Objective Mastery
  const handleToggleObjective = async (objectiveId: string, isMastered: boolean) => {
    try {
      const updatedCov = await api.updateCourseSyllabusProgress(courseId, {
        objective_id: objectiveId,
        is_objective_mastered: isMastered
      });
      setCoverage(updatedCov);
    } catch (err: any) {
      console.error('Failed to update objective mastery', err);
    }
  };

  const completedTopicIds = new Set<string>(coverage?.completed_topic_ids || []);
  const masteredObjectiveIds = new Set<string>(coverage?.mastered_objective_ids || []);

  return (
    <div className="min-h-screen bg-slate-50">
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Courses
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href={`/resources/${courseId}`}
              className="text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Course Overview
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {syllabus && (
              <Link
                href={`/courses/${courseId}/assessment`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <Award className="w-3.5 h-3.5" />
                Assessment Blueprint
              </Link>
            )}

            {versions.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Syllabus Version:</span>
                <select
                  value={selectedVersion || 1}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setSelectedVersion(v);
                    loadSyllabusData(v);
                  }}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {versions.map((ver) => (
                    <option key={ver.version} value={ver.version}>
                      v{ver.version} {ver.is_active ? '(Active)' : ''} — {ver.verification_status}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-40 bg-white rounded-xl border border-slate-200" />
            <div className="h-32 bg-slate-800 rounded-xl" />
            <div className="h-64 bg-white rounded-xl border border-slate-200" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-red-800">Syllabus Unavailable</h3>
            <p className="text-sm text-red-600 mt-1 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => loadSyllabusData()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Main Syllabus Content */}
        {!isLoading && !error && syllabus && (
          <>
            <SyllabusOverview syllabus={syllabus} coverage={coverage} />

            <SyllabusCoverage coverage={coverage} />

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Curriculum Modules ({syllabus.total_modules})
              </h2>
              <span className="text-xs text-slate-500">
                Click topics or objectives to mark your study progress
              </span>
            </div>

            <ModuleList
              modules={syllabus.modules}
              completedTopicIds={completedTopicIds}
              masteredObjectiveIds={masteredObjectiveIds}
              onToggleTopic={handleToggleTopic}
              onToggleObjective={handleToggleObjective}
            />
          </>
        )}
      </main>

      <AIAssistantDrawer isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
}
