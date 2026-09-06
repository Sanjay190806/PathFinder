"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Clock, AlertCircle, CheckCircle, 
  Pause, Play, ShieldAlert, 
  ChevronRight, Save, RefreshCw, Check
} from "lucide-react";
import { api } from "@/lib/api";
import { IntegrityMonitoringWidget } from "@/components/assessment/IntegrityMonitoringWidget";
import { IntegrityWarningBanner } from "@/components/assessment/IntegrityWarningBanner";

interface SessionDetail {
  id: string;
  assessment_id: string;
  profile_id: string;
  mode: string;
  status: string;
  attempt_number: number;
  total_questions: number;
  answered_count: number;
  time_remaining_seconds: number;
  is_paused: boolean;
  pause_count: number;
  max_pauses_allowed: number;
  total_paused_seconds: number;
  max_pause_seconds: number;
  navigation_policy: string;
  selected_question_ids: string[];
  answered_question_ids: string[];
}

interface QuestionData {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  marks: number;
  options?: string[];
  code_template?: string;
  code_language?: string;
  topic_id?: string;
  module_id?: string;
  objective_id?: string;
}

interface ExamResult {
  raw_score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  passing_score: number;
  module_breakdown: Record<string, any>;
  topic_breakdown: Record<string, any>;
  objective_breakdown: Record<string, any>;
  feedback_summary: string;
}

export default function ExamSessionPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessment_id as string;
  const sessionId = params.session_id as string;

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>("");
  
  const [timeRemaining, setTimeRemaining] = useState<number>(3600);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [integrityStateData, setIntegrityStateData] = useState<any>(null);

  const fetchIntegrityState = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await api.getIntegrityState(sessionId);
      setIntegrityStateData(data);
      if (data.action_instruction === "PAUSE_REQUIRED" && !isPaused) {
        setIsPaused(true);
      }
    } catch {
      // non-blocking fallback
    }
  }, [sessionId, isPaused]);

  useEffect(() => {
    fetchIntegrityState();
    const intInterval = setInterval(fetchIntegrityState, 8000);
    return () => clearInterval(intInterval);
  }, [fetchIntegrityState]);

  // 1. Initial Load & Recovery
  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        const res = await api.get(`/assessment-sessions/${sessionId}`);
        setSession(res.data);
        setTimeRemaining(res.data.time_remaining_seconds);
        setIsPaused(res.data.is_paused);

        if (["PASSED", "FAILED", "SUBMITTED", "COMPLETED"].includes(res.data.status)) {
          const resultRes = await api.get(`/assessment-sessions/${sessionId}/result`);
          setExamResult(resultRes.data);
        } else {
          await loadCurrentQuestion();
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load assessment session.");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  // 2. Authoritative Timer Countdown
  useEffect(() => {
    if (isPaused || !session || examResult || session.status !== "IN_PROGRESS") return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, session, examResult]);

  async function handleAutoExpire() {
    try {
      const res = await api.post(`/assessment-sessions/${sessionId}/submit`);
      setExamResult(res.data);
    } catch (e) {
      console.error("Auto-expire submission error:", e);
    }
  }

  async function loadCurrentQuestion(questionId?: string) {
    try {
      const endpoint = questionId 
        ? `/assessment-sessions/${sessionId}/current?question_id=${questionId}`
        : `/assessment-sessions/${sessionId}/current`;
      const res = await api.get(endpoint);
      setCurrentQuestion(res.data.question);
      setQuestionNumber(res.data.question_number);
      setSelectedOption(null);
      setTextAnswer("");
    } catch (err: any) {
      console.error("Failed to load question:", err);
    }
  }

  async function handleAnswerSubmit() {
    if (!currentQuestion) return;
    try {
      setSaveState("saving");
      await api.post(`/assessment-sessions/${sessionId}/answers`, {
        question_id: currentQuestion.id,
        selected_option_index: selectedOption,
        submitted_answer: textAnswer || (selectedOption !== null ? currentQuestion.options?.[selectedOption] : null),
        time_spent_seconds: 30
      });

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);

      // Refresh session progress
      const sRes = await api.get(`/assessment-sessions/${sessionId}`);
      setSession(sRes.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to submit answer.");
      setSaveState("idle");
    }
  }

  async function handlePauseToggle() {
    try {
      if (isPaused) {
        const res = await api.post(`/assessment-sessions/${sessionId}/resume`);
        setIsPaused(false);
        setTimeRemaining(res.data.time_remaining_seconds);
      } else {
        await api.post(`/assessment-sessions/${sessionId}/pause`);
        setIsPaused(true);
      }
      const sRes = await api.get(`/assessment-sessions/${sessionId}`);
      setSession(sRes.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update pause state.");
    }
  }

  async function handleFinalSubmit() {
    try {
      setIsSubmitting(true);
      const res = await api.post(`/assessment-sessions/${sessionId}/submit`);
      setExamResult(res.data);
      setShowSubmitModal(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to finalize exam.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-3 text-indigo-400" />
        Loading secure exam session...
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/30 rounded-xl p-6 max-w-md text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Session Inaccessible</h2>
          <p className="text-slate-400 text-sm mb-6">{error || "Assessment session not found."}</p>
          <button 
            onClick={() => router.push(`/courses`)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
          >
            Return to Courses
          </button>
        </div>
      </div>
    );
  }

  // Result Summary View
  if (examResult) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                examResult.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {examResult.passed ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {examResult.passed ? 'Assessment Passed' : 'Assessment Not Passed'}
              </span>
              <h1 className="text-2xl font-bold text-white">Assessment Results</h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-white">{examResult.percentage}%</div>
              <div className="text-xs text-slate-400">Passing: {examResult.passing_score}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 uppercase">Score Awarded</div>
              <div className="text-xl font-bold text-indigo-400 mt-1">{examResult.raw_score} / {examResult.max_score}</div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 uppercase">Attempt</div>
              <div className="text-xl font-bold text-white mt-1">#{session.attempt_number}</div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 uppercase">Status</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">FINALIZED</div>
            </div>
          </div>

          {/* Module Breakdown */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-white mb-4">Syllabus Module Breakdown</h3>
            <div className="space-y-3">
              {Object.values(examResult.module_breakdown || {}).map((m: any, idx: number) => (
                <div key={idx} className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white text-sm">{m.title || `Module ${idx + 1}`}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{m.questions || 0} questions evaluated</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{m.earned} / {m.max} marks</div>
                    <div className="text-xs font-semibold text-indigo-400">{m.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => router.push(`/courses/${assessmentId}/assessment`)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            Done & Return to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. Header Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {session.mode}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">Attempt #{session.attempt_number}</span>
          {integrityStateData && (
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium tracking-wide hidden md:inline-flex items-center gap-1 ${
              integrityStateData.integrity_state === 'NORMAL'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : integrityStateData.integrity_state === 'WARNING'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              Supervision: {integrityStateData.integrity_state.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Server Authoritative Timer */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono text-sm font-semibold ${
            timeRemaining < 300 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
              : 'bg-slate-800/80 text-white border-slate-700'
          }`}>
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{formatTime(timeRemaining)}</span>
          </div>

          {session.max_pauses_allowed > 0 && (
            <button
              onClick={handlePauseToggle}
              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Submit
          </button>
        </div>
      </header>

      {/* 2. Main Exam Runtime Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Question Panel */}
        <div className="lg:col-span-3 space-y-6">
          {integrityStateData && (
            <IntegrityWarningBanner
              sessionId={sessionId}
              integrityState={integrityStateData.integrity_state}
              actionInstruction={integrityStateData.action_instruction}
              warningCount={integrityStateData.warning_count}
              allowedWarningCount={integrityStateData.allowed_warning_count}
              activeWarning={integrityStateData.active_warning}
              onAcknowledged={fetchIntegrityState}
            />
          )}

          {isPaused ? (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-12 text-center">
              <Pause className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Exam Session Paused</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                The server timer is halted. Your answers are saved securely. Click resume when you are ready to continue.
              </p>
              <button
                onClick={handlePauseToggle}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Resume Assessment
              </button>
            </div>
          ) : currentQuestion ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Question {questionNumber} of {session.total_questions}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <div className="text-xs font-semibold text-indigo-400">
                  {currentQuestion.marks} Marks
                </div>
              </div>

              {/* Stem */}
              <div className="text-base md:text-lg text-white font-medium leading-relaxed mb-6">
                {currentQuestion.question_text}
              </div>

              {/* MCQ Options */}
              {currentQuestion.options && currentQuestion.options.length > 0 && (
                <div className="space-y-3 mb-8">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                        selectedOption === idx
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-slate-800 bg-slate-800/30 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        selectedOption === idx
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-slate-600 text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm leading-normal">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Coding / Text Input if applicable */}
              {currentQuestion.question_type === 'CODING' && (
                <div className="mb-8">
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Write your solution code here..."
                    rows={8}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {saveState === 'saving' && <span className="text-amber-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Saving answer...</span>}
                  {saveState === 'saved' && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Answer recorded</span>}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAnswerSubmit}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Response
                  </button>

                  <button
                    onClick={async () => {
                      await handleAnswerSubmit();
                      await loadCurrentQuestion();
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              All questions completed. Review your answers in the navigator or click Submit.
            </div>
          )}
        </div>

        {/* Right: Question Navigator Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Question Grid</h3>
              <span className="text-xs text-slate-400">
                {session.answered_count} / {session.total_questions} Answered
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5 mb-6">
              {Array.from({ length: session.total_questions }, (_, idx) => {
                const qId = session.selected_question_ids[idx];
                const isAnswered = qId ? session.answered_question_ids.includes(qId) : false;
                const isCurrent = (idx + 1) === questionNumber;

                return (
                  <button
                    key={idx}
                    disabled={session.navigation_policy === 'SEQUENTIAL_ONLY' && idx > session.selected_question_ids.length}
                    onClick={() => qId && loadCurrentQuestion(qId)}
                    className={`h-9 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'border-2 border-indigo-500 bg-indigo-500/20 text-white'
                        : isAnswered
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800/60 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-indigo-500" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
                <span>Unvisited</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Final Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Submit Assessment?</h3>
            <p className="text-slate-400 text-sm mb-6">
              You have answered {session.answered_count} of {session.total_questions} questions. Once submitted, your answers will be locked and graded authoritatively.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Continue Exam
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                {isSubmitting ? 'Grading...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 4. Integrity & Gadget Monitoring Widget */}
      {session && (
        <IntegrityMonitoringWidget
          sessionId={sessionId}
          assessmentId={assessmentId}
          policy={(session as any)?.integrity_monitoring_policy || "WARNING_ONLY"}
          monitoringConsent={(session as any)?.monitoring_consent || "MONITORING_CONSENT_REQUIRED"}
          isPaused={isPaused}
          isCompleted={Boolean(examResult || ["PASSED", "FAILED", "SUBMITTED", "COMPLETED", "EXPIRED"].includes(session.status))}
          onConsentChange={(c) => {
            setSession((prev) => prev ? { ...prev, monitoring_consent: c } as any : null);
          }}
        />
      )}
    </div>
  );
}
