'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { AIAssistantDrawer } from '@/components/AIAssistantDrawer';
import { api } from '@/lib/api';
import { Assessment, Profile, AssessmentResult } from '@/lib/types';
import { Brain, CheckCircle2, XCircle, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

export default function AssessmentPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(console.error);
    api.getAssessments().then(res => {
      setAssessments(res);
      if (res.length > 0) setSelectedAssessment(res[0]);
    }).catch(console.error);
  }, []);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmit = async () => {
    if (!selectedAssessment || isSubmitting) return;
    setIsSubmitting(true);

    const submissionAnswers = selectedAssessment.questions.map(q => ({
      question_id: q.id,
      selected_option_index: answers[q.id] ?? 0
    }));

    try {
      const res = await api.submitAssessment({
        assessment_id: selectedAssessment.id,
        answers: submissionAnswers
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar
        user={profile}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-400">Diagnostic Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Skill Calibration Quiz
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Answer multiple-choice diagnostics to calibrate your skill confidence and adapt your curriculum.
          </p>
        </div>

        {selectedAssessment && !result && (
          <div className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent-cyan" />
                {selectedAssessment.title}
              </h3>
              <span className="text-xs font-semibold text-gray-400">
                {selectedAssessment.questions.length} Questions
              </span>
            </div>

            <div className="space-y-6">
              {selectedAssessment.questions.map((q, idx) => (
                <div key={q.id} className="rounded-2xl border border-surface-border bg-surface-raised/40 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">
                      Question {idx + 1} ({q.skill_name})
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                    {q.question_text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`rounded-xl border p-3 text-xs text-left transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-950/70 text-white font-semibold shadow-md'
                              : 'border-surface-border bg-surface text-gray-300 hover:bg-surface-raised'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-primary-500/25 hover:brightness-110 transition-all disabled:opacity-40"
              >
                {isSubmitting ? 'Evaluating Answers...' : 'Submit & Calibrate Roadmap'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="rounded-3xl border border-primary-500/40 bg-surface p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="text-center max-w-md mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-emerald/20 text-accent-emerald mx-auto border border-accent-emerald/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">Assessment Complete!</h2>
              <p className="text-xs text-gray-400 mt-1">
                Score: <span className="text-accent-cyan font-bold font-mono text-sm">{result.correct_count} / {result.total_questions} ({result.score_percentage.toFixed(0)}%)</span>
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Skill Confidence Updates</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.skill_confidence_updates.map((u, idx) => (
                  <div key={idx} className="rounded-xl border border-surface-border bg-surface-raised/60 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">{u.skill}</span>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 font-mono">
                        <span>{(u.old_confidence * 100).toFixed(0)}%</span>
                        <span>?</span>
                        <span className="font-bold text-accent-cyan">{(u.new_confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    {u.is_correct ? (
                      <CheckCircle2 className="h-4 w-4 text-accent-emerald shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-accent-rose shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-between items-center">
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                }}
                className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-raised px-4 py-2.5 text-xs font-semibold text-gray-300 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retake Quiz
              </button>

              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-primary-500 transition-colors"
              >
                View Adapted Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
}
