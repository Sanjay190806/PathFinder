'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  ShieldCheck, Brain, ArrowLeft, PlayCircle, 
  CheckCircle2, AlertTriangle, Layers, Award, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function CourseAssessmentBlueprintPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.course_id as string;

  const [blueprint, setBlueprint] = useState<any | null>(null);
  const [syllabus, setSyllabus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    loadData();
  }, [courseId]);

  async function loadData() {
    setLoading(true);
    try {
      // 1. Fetch Syllabus
      const syl = await api.getCourseSyllabus(courseId);
      setSyllabus(syl);

      // 2. Fetch or create Blueprint
      try {
        const bp = await api.createAssessmentBlueprint({
          course_id: courseId,
          syllabus_id: syl.id,
          syllabus_version: syl.version,
          title: `${syl.title || 'Course'} Assessment Blueprint`,
          total_questions: 30,
          total_marks: 100.0,
          duration_minutes: 60,
          passing_score: 60.0
        });
        setBlueprint(bp);
      } catch (bpErr) {
        // May already exist
        console.warn(bpErr);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load course syllabus blueprint');
    } finally {
      setLoading(false);
    }
  }

  async function handleLaunchAssessment() {
    if (!blueprint) return;
    setGenerating(true);
    setError(null);
    try {
      const created = await api.generateAssessment({
        blueprint_id: blueprint.id,
        assessment_type: 'ADAPTIVE',
        randomize: true
      });
      router.push(`/assessment/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate assessment');
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <Link 
        href={`/courses/${courseId}/syllabus`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Syllabus
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Authoritative Assessment Blueprint
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {blueprint?.title || 'Course Assessment Blueprint'}
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Assessment questions and mark weight allocations are mathematically derived from the authoritative course syllabus modules and learning objectives.
            </p>
          </div>

          <button
            onClick={handleLaunchAssessment}
            disabled={generating}
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            <PlayCircle className="w-5 h-5" />
            {generating ? 'Synthesizing...' : 'Launch Assessment'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Total Questions</div>
            <div className="text-xl font-bold text-white">{blueprint?.total_questions || 30}</div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Total Marks</div>
            <div className="text-xl font-bold text-white">{blueprint?.total_marks || 100} Pts</div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Duration</div>
            <div className="text-xl font-bold text-white">{blueprint?.duration_minutes || 60} Min</div>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Passing Mark</div>
            <div className="text-xl font-bold text-emerald-400">{blueprint?.passing_score || 60}%</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Blueprint Sections derived from syllabus */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <Layers className="w-5 h-5 text-indigo-400" />
          Syllabus-Grounded Section Rules
        </div>

        <div className="grid gap-4">
          {blueprint?.section_rules?.map((sec: any, idx: number) => (
            <div 
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-indigo-400 font-semibold mb-1">Module {idx + 1}</div>
                  <h3 className="text-base font-bold text-white">{sec.module_title}</h3>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {sec.module_weight}% Weight
                  </span>
                  <div className="text-xs text-slate-400 mt-1.5">
                    {sec.target_questions} Questions ({sec.target_marks} Marks)
                  </div>
                </div>
              </div>

              {sec.topic_rules && sec.topic_rules.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/60">
                  <div className="text-xs font-semibold text-slate-400 mb-2">Topic Targets:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sec.topic_rules.map((tr: any, tIdx: number) => (
                      <div 
                        key={tIdx}
                        className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/40 border border-slate-800/60"
                      >
                        <span className="text-slate-300 truncate mr-2">{tr.topic_title}</span>
                        <span className="text-slate-400 shrink-0 font-mono">{tr.target_questions} Qs ({tr.difficulty})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
