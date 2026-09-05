'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { DSATopicDetail, DSAConcept } from '@/lib/types';
import {
  Code2,
  ChevronLeft,
  ChevronRight,
  GitFork,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Target,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function DSATopicDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [topic, setTopic] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getDSATopic(slug)
      .then((data) => {
        setTopic(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load topic details');
      })
      .finally(() => setLoading(false));

    // Optional aligned questions
    api.get('/dsa/topics/' + slug + '/questions')
      .then((res: any) => setQuestions(res.data?.questions || []))
      .catch(() => {});
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 w-36 bg-slate-900 rounded-lg" />
          <div className="h-40 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <Code2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">DSA Topic Not Found</h2>
          <p className="text-sm text-slate-400">{error || "The requested topic doesn't exist."}</p>
          <Link
            href="/learning/dsa"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Curriculum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div>
          <Link
            href="/learning/dsa"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to DSA Curriculum
          </Link>
        </div>

        {/* Topic Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-blue-950/80 text-blue-400 border border-blue-800/80">
              {topic.domain_name || 'DSA Core'}
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold uppercase rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/60">
              Importance: {topic.typical_importance}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              {topic.name}
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {topic.description}
            </p>
          </div>

          {/* Prerequisites */}
          {topic.prerequisite_topic_slugs && topic.prerequisite_topic_slugs.length > 0 && (
            <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs">
              <GitFork className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-slate-400 font-medium">Recommended Prerequisites:</span>
              <div className="flex flex-wrap gap-1.5">
                {topic.prerequisite_topic_slugs.map((prereq: string) => (
                  <Link
                    key={prereq}
                    href={`/learning/dsa/${prereq}`}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                  >
                    {prereq}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subtopics & Concepts Breakdown */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Canonical Concepts & Skill Blueprint
          </h2>

          {(topic.subtopics || []).map((subtopic: any) => (
            <div key={subtopic.id} className="space-y-4">
              <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800/80 pb-2">
                {subtopic.name}
              </h3>

              <div className="space-y-4">
                {(subtopic.concepts || []).map((concept: DSAConcept) => (
                  <div
                    key={concept.id}
                    className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-lg font-bold text-white">{concept.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            concept.difficulty === 'EASY'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                              : concept.difficulty === 'MEDIUM'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                              : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                          }`}
                        >
                          {concept.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Learning Objectives */}
                    {concept.learning_objectives && concept.learning_objectives.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Core Learning Objectives
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-1">
                          {concept.learning_objectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Common Patterns & Pitfalls Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {concept.common_patterns && concept.common_patterns.length > 0 && (
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                          <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                            Algorithmic Patterns
                          </div>
                          <div className="text-xs text-slate-300">
                            {concept.common_patterns.join(' • ')}
                          </div>
                        </div>
                      )}

                      {concept.common_mistakes && concept.common_mistakes.length > 0 && (
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Common Pitfalls
                          </div>
                          <div className="text-xs text-slate-300">
                            {concept.common_mistakes.join(' • ')}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Practice Resources */}
                    {concept.practice_resources && concept.practice_resources.length > 0 && (
                      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Practice & Reference:</span>
                        {concept.practice_resources.map((res, i) => (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-300 text-xs font-medium transition-colors"
                          >
                            <span>{res.title}</span>
                            <span className="text-[10px] text-slate-400">({res.platform})</span>
                            <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
