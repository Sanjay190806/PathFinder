'use client';

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  MessageSquare,
  Briefcase,
  ShieldCheck,
  Send,
  RefreshCw,
  Award,
  ChevronRight,
  Check,
  AlertTriangle
} from "lucide-react";
import { api } from "@/lib/api";
import { Badge, Card } from "@/components/ui";

export default function PreparationPage() {
  const [activeTab, setActiveTab] = useState<"readiness" | "interview" | "resume" | "plan">("readiness");
  const [loading, setLoading] = useState<boolean>(true);
  const [readinessData, setReadinessData] = useState<any>(null);
  const [gapsData, setGapsData] = useState<any>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);

  // Mock Interview State
  const [interviewSession, setInterviewSession] = useState<any>(null);
  const [interviewType, setInterviewType] = useState<string>("MIXED");
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [submittingTurn, setSubmittingTurn] = useState<boolean>(false);
  const [lastTurnResult, setLastTurnResult] = useState<any>(null);

  // Resume Audit State
  const [resumeText, setResumeText] = useState<string>(
    "Full Stack Software Engineer with experience in Python, FastAPI, and PostgreSQL. Built scalable backend APIs and deployed containerized services using Docker and Git. Implemented automated testing reducing regression bugs by 25% and optimized database queries to reduce P99 latency from 180ms to 45ms. Designed responsive frontend interfaces using Next.js and TypeScript."
  );
  const [resumeAudit, setResumeAudit] = useState<any>(null);
  const [auditingResume, setAuditingResume] = useState<boolean>(false);

  useEffect(() => {
    loadPreparationData();
  }, []);

  const loadPreparationData = async () => {
    setLoading(true);
    try {
      const [readinessRes, gapsRes, planRes, portfolioRes] = await Promise.allSettled([
        api.getPreparationReadiness(),
        api.getPreparationGaps(),
        api.getPreparationPlan(),
        api.auditPortfolio(),
      ]);

      if (readinessRes.status === "fulfilled") setReadinessData(readinessRes.value);
      if (gapsRes.status === "fulfilled") setGapsData(gapsRes.value);
      if (planRes.status === "fulfilled") setPlanData(planRes.value);
      if (portfolioRes.status === "fulfilled") setPortfolioData(portfolioRes.value);
    } catch (err) {
      console.error("Failed to load preparation data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    try {
      const session = await api.startMockInterviewSession({
        session_type: interviewType,
        target_difficulty: "AUTO"
      });
      setInterviewSession(session);
      setLastTurnResult(null);
      setCurrentAnswer("");
    } catch (err) {
      console.error("Failed to start mock interview:", err);
    }
  };

  const handleSubmitTurn = async () => {
    if (!interviewSession || !currentAnswer.trim() || submittingTurn) return;
    setSubmittingTurn(true);
    try {
      const currentQ = interviewSession.questions[interviewSession.current_question_index || 0];
      const result = await api.submitMockInterviewTurn(interviewSession.session_id, {
        question_id: currentQ?.id || "q1",
        response_text: currentAnswer
      });
      setLastTurnResult(result.turn_evaluation);

      // Refresh session
      const updated = await api.getMockInterviewSession(interviewSession.session_id);
      setInterviewSession(updated);
      setCurrentAnswer("");
      // Refresh readiness score
      api.getPreparationReadiness().then(setReadinessData).catch(() => {});
    } catch (err) {
      console.error("Failed to submit interview response:", err);
    } finally {
      setSubmittingTurn(false);
    }
  };

  const handleAuditResume = async () => {
    if (!resumeText.trim() || auditingResume) return;
    setAuditingResume(true);
    try {
      const result = await api.auditResume({
        resume_text: resumeText
      });
      setResumeAudit(result);
      // Refresh readiness
      api.getPreparationReadiness().then(setReadinessData).catch(() => {});
    } catch (err) {
      console.error("Failed to audit resume:", err);
    } finally {
      setAuditingResume(false);
    }
  };

  const getReadinessBadge = (level: string) => {
    switch (level) {
      case "APPLICATION_READY":
        return <Badge variant="success">Application Ready</Badge>;
      case "GOOD":
        return <Badge variant="primary">Good Standing</Badge>;
      case "MODERATE":
        return <Badge variant="warning">Moderate Readiness</Badge>;
      default:
        return <Badge variant="danger">Developing</Badge>;
    }
  };

  if (loading && !readinessData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="h-10 w-10 animate-spin text-primary-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-100">Analyzing Preparation Intelligence</h2>
        <p className="text-sm text-slate-400 mt-2">Computing 9-dimension composite score, resume ATS audit, and mock chamber...</p>
      </div>
    );
  }

  const overallScore = readinessData?.overall_score ?? 68.5;
  const readinessLevel = readinessData?.readiness_level ?? "MODERATE";
  const dimensionScores = readinessData?.dimension_scores ?? {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900/60 via-slate-900/90 to-surface border border-primary-500/20 p-6 md:p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
                <GraduationCap className="h-6 w-6" />
              </span>
              <Badge variant="purple">Phase 9 • Stage 10</Badge>
              {getReadinessBadge(readinessLevel)}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Career Preparation & Interview Intelligence
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl">
              Turn-by-turn mock interview evaluation, verified ATS resume scoring, portfolio audit, and opportunity requirement evidence matching.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-surface-border">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Preparation Score</div>
              <div className="text-3xl font-extrabold text-primary-400">{overallScore}%</div>
            </div>
            <div className="h-12 w-12 rounded-full border-4 border-primary-500/30 border-t-primary-500 flex items-center justify-center font-bold text-xs text-white">
              {readinessLevel.slice(0, 4)}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab("readiness")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "readiness"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Readiness & Dimensions
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "interview"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Mock Interview Chamber
          </button>
          <button
            onClick={() => setActiveTab("resume")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "resume"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileText className="h-4 w-4" />
            ATS Resume Intelligence
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "plan"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Clock className="h-4 w-4" />
            Preparation Tasks & Plan
          </button>
        </div>
      </div>

      {/* TAB 1: READINESS & DIMENSIONS */}
      {activeTab === "readiness" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strengths Card */}
            <Card className="p-5 border-surface-border bg-surface/60">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Key Strengths
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {(readinessData?.strengths || ["Technical foundations verified"]).map((s: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Weaknesses Card */}
            <Card className="p-5 border-surface-border bg-surface/60">
              <div className="flex items-center gap-2 text-amber-400 font-semibold mb-3 text-sm">
                <AlertCircle className="h-4 w-4" /> Areas Needing Polish
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {(readinessData?.weaknesses || ["Increase mock interview practice"]).map((w: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 shrink-0">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Critical Blockers Card */}
            <Card className="p-5 border-surface-border bg-surface/60">
              <div className="flex items-center gap-2 text-rose-400 font-semibold mb-3 text-sm">
                <AlertTriangle className="h-4 w-4" /> Critical Blockers
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {readinessData?.critical_blockers && readinessData.critical_blockers.length > 0 ? (
                  readinessData.critical_blockers.map((b: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-rose-300">
                      <span className="text-rose-500 shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-emerald-400 flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> No critical blockers detected! You are on track for application readiness.
                  </li>
                )}
              </ul>
            </Card>
          </div>

          {/* 9 Dimensions Breakdown */}
          <Card className="p-6 border-surface-border bg-surface/70 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">9-Dimension Preparation Breakdown</h3>
                <p className="text-xs text-slate-400">Holistic multi-dimensional evaluation of candidate employability</p>
              </div>
              <Badge variant="cyan">Deterministic Scoring</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(dimensionScores).map(([key, score]: [string, any]) => {
                const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                const numScore = Number(score) || 0;
                return (
                  <div key={key} className="p-4 rounded-xl bg-slate-900/60 border border-surface-border space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-300">{label}</span>
                      <span className="font-bold text-primary-400">{numScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          numScore >= 80 ? "bg-emerald-500" : numScore >= 60 ? "bg-primary-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, numScore))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DecisionTrace Explainability Card */}
            {readinessData?.decision_trace && (
              <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary-400" />
                  <span>DecisionTrace Explainability Matrix</span>
                </div>
                <p className="text-slate-400">
                  Algorithm: <span className="text-slate-200 font-mono">{readinessData.decision_trace.algorithm}</span> • 
                  Formula: <span className="text-slate-200 font-mono">{readinessData.decision_trace.formula}</span>
                </p>
                <div className="flex flex-wrap gap-3 pt-2 text-[11px] text-slate-400">
                  <span>Evidence records: <strong className="text-slate-200">{readinessData.decision_trace.inputs?.evidence_count ?? 0}</strong></span>
                  <span>Scenarios passed: <strong className="text-slate-200">{readinessData.decision_trace.inputs?.scenario_attempts_passed ?? 0}</strong></span>
                  <span>Portfolio artifacts: <strong className="text-slate-200">{readinessData.decision_trace.inputs?.portfolio_artifacts_count ?? 0}</strong></span>
                  <span>Mock interviews: <strong className="text-slate-200">{readinessData.decision_trace.inputs?.mock_sessions_count ?? 0}</strong></span>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: MOCK INTERVIEW CHAMBER */}
      {activeTab === "interview" && (
        <div className="space-y-6">
          {!interviewSession ? (
            <Card className="p-8 border-surface-border bg-surface/70 text-center max-w-2xl mx-auto space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-primary-500/20 text-primary-400 flex items-center justify-center mx-auto">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Start Interactive Mock Interview Chamber</h3>
                <p className="text-sm text-slate-400">
                  Experience realistic technical and behavioral interview questions tailored to your career goal.
                  Evaluated across 6 dimensions including STAR framework, tradeoff analysis, and India market context.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {(["MIXED", "TECHNICAL", "BEHAVIORAL", "OPPORTUNITY_SPECIFIC"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setInterviewType(type)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      interviewType === type
                        ? "bg-primary-600 border-primary-500 text-white shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {type.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              <button
                onClick={handleStartInterview}
                className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 mx-auto"
              >
                <span>Initialize Interview Chamber</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Question & Response */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 border-surface-border bg-surface/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="cyan">Question {(interviewSession.current_question_index || 0) + 1} of {interviewSession.questions?.length || 3}</Badge>
                      <Badge variant="primary">{interviewSession.session_type}</Badge>
                    </div>
                    {interviewSession.status === "COMPLETED" && (
                      <Badge variant="success">Interview Complete</Badge>
                    )}
                  </div>

                  {interviewSession.questions && interviewSession.questions[interviewSession.current_question_index || 0] ? (
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-white leading-relaxed">
                        {interviewSession.questions[interviewSession.current_question_index || 0].prompt}
                      </h4>
                      <p className="text-xs text-slate-400 italic">
                        {interviewSession.questions[interviewSession.current_question_index || 0].context}
                      </p>

                      {interviewSession.status !== "COMPLETED" && (
                        <div className="space-y-3 pt-2">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Your Technical Answer
                          </label>
                          <textarea
                            rows={6}
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder="Provide your structured answer. Consider stating your operational assumptions, evaluating latency/memory tradeoffs, and citing concrete examples..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 resize-none font-sans"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">{currentAnswer.split(/\s+/).filter(Boolean).length} words</span>
                            <button
                              onClick={handleSubmitTurn}
                              disabled={!currentAnswer.trim() || submittingTurn}
                              className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-xs font-semibold transition-all flex items-center gap-2"
                            >
                              {submittingTurn ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  <span>Evaluating...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5" />
                                  <span>Submit Answer</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                      <h4 className="text-lg font-bold text-white">All Questions Completed!</h4>
                      <p className="text-xs text-slate-400 mt-1">Check your turn evaluations on the right.</p>
                      <button
                        onClick={handleStartInterview}
                        className="mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white text-xs font-semibold"
                      >
                        Start New Session
                      </button>
                    </div>
                  )}
                </Card>

                {/* Turn Feedback Breakdown */}
                {lastTurnResult && (
                  <Card className="p-6 border-surface-border bg-slate-900/90 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary-400" />
                        <h4 className="text-sm font-bold text-white">Real-Time Turn Evaluation</h4>
                      </div>
                      <span className="text-base font-extrabold text-primary-400">
                        {lastTurnResult.overall_turn_score}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Technical Accuracy</div>
                        <div className="text-xs font-bold text-slate-200">{lastTurnResult.technical_accuracy}%</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Depth & Clarity</div>
                        <div className="text-xs font-bold text-slate-200">{lastTurnResult.depth_clarity}%</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Structure / STAR</div>
                        <div className="text-xs font-bold text-slate-200">{lastTurnResult.structure_framework}%</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Confidence</div>
                        <div className="text-xs font-bold text-slate-200">{lastTurnResult.confidence_language}%</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">India Scale Context</div>
                        <div className="text-xs font-bold text-slate-200">{lastTurnResult.india_market_relevance}%</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Turn Score</div>
                        <div className="text-xs font-bold text-primary-400">{lastTurnResult.overall_turn_score}%</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-2">
                      <p className="text-slate-300 leading-relaxed font-medium">{lastTurnResult.feedback}</p>
                      {lastTurnResult.model_answer && (
                        <div className="p-3 rounded-lg bg-primary-950/40 border border-primary-800/40 text-primary-200 text-xs mt-3">
                          <strong className="block text-primary-400 mb-1">Exemplary Model Answer:</strong>
                          {lastTurnResult.model_answer}
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Column: Session Transcript & History */}
              <div className="space-y-6">
                <Card className="p-5 border-surface-border bg-surface/70 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Session Transcript</h4>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {interviewSession.turn_evaluations && interviewSession.turn_evaluations.length > 0 ? (
                      interviewSession.turn_evaluations.map((t: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-300">Question {idx + 1}</span>
                            <Badge variant="cyan">{t.evaluation?.overall_turn_score || 0}%</Badge>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 italic">"{t.response_text}"</p>
                          <p className="text-[11px] text-slate-300 font-medium">{t.evaluation?.feedback}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">No turns submitted yet in this session.</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ATS RESUME INTELLIGENCE */}
      {activeTab === "resume" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Input and Audit */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-surface-border bg-surface/70 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">ATS Keyword Scanner & Bullet Enhancer</h3>
                  <p className="text-xs text-slate-400">Audited against target career keywords with verified achievement mapping</p>
                </div>
                <button
                  onClick={handleAuditResume}
                  disabled={auditingResume || !resumeText.trim()}
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-xs font-semibold transition-all flex items-center gap-2"
                >
                  {auditingResume ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Auditing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Audit Resume</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={8}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text or experience bullet points here..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 font-mono"
              />
            </Card>

            {/* Audit Results */}
            {resumeAudit && (
              <div className="space-y-6">
                {/* Metric Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="p-4 border-surface-border bg-slate-900/80 text-center space-y-1">
                    <div className="text-[11px] text-slate-400">ATS Match Score</div>
                    <div className="text-2xl font-extrabold text-primary-400">{resumeAudit.ats_score}%</div>
                  </Card>
                  <Card className="p-4 border-surface-border bg-slate-900/80 text-center space-y-1">
                    <div className="text-[11px] text-slate-400">Action Verbs</div>
                    <div className="text-2xl font-extrabold text-emerald-400">{resumeAudit.action_verb_strength}%</div>
                  </Card>
                  <Card className="p-4 border-surface-border bg-slate-900/80 text-center space-y-1">
                    <div className="text-[11px] text-slate-400">Quantified Impact</div>
                    <div className="text-2xl font-extrabold text-cyan-400">{resumeAudit.quantification_score}%</div>
                  </Card>
                  <Card className="p-4 border-surface-border bg-slate-900/80 text-center space-y-1">
                    <div className="text-[11px] text-slate-400">Consistency</div>
                    <div className="text-2xl font-extrabold text-purple-400">{resumeAudit.experience_consistency}%</div>
                  </Card>
                </div>

                {/* Verified Bullet Enhancements */}
                <Card className="p-6 border-surface-border bg-surface/70 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary-400" />
                    Verified Experience Enhancement Suggestions
                  </h4>
                  <p className="text-xs text-slate-400">
                    Rewrites synthesized directly from your verified practical labs and completed projects without fabricating experience:
                  </p>

                  <div className="space-y-3">
                    {resumeAudit.enhancement_suggestions?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-primary-400">{item.source}</span>
                          <span className="text-[11px] text-slate-500">{item.original_issue}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-200 font-mono">
                          {item.suggested_bullet}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Right Col: Keywords & Red Flags */}
          <div className="space-y-6">
            {resumeAudit && (
              <>
                <Card className="p-5 border-surface-border bg-surface/70 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Keywords Found</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeAudit.keyword_coverage?.matched_keywords?.map((k: string, idx: number) => (
                      <Badge key={idx} variant="success">{k}</Badge>
                    ))}
                  </div>

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-3">Keywords Missing</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeAudit.keyword_coverage?.missing_keywords?.map((k: string, idx: number) => (
                      <Badge key={idx} variant="danger">{k}</Badge>
                    ))}
                  </div>
                </Card>

                {resumeAudit.red_flags && resumeAudit.red_flags.length > 0 && (
                  <Card className="p-5 border-surface-border bg-rose-950/20 border-rose-800/30 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Detected Red Flags
                    </h4>
                    <ul className="space-y-2 text-xs text-rose-300">
                      {resumeAudit.red_flags.map((rf: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-500">•</span>
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PREPARATION PLAN & TASKS */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          {/* Plan Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 border-surface-border bg-surface/70 md:col-span-2 space-y-2">
              <div className="text-xs uppercase tracking-wider text-primary-400 font-semibold">Priority Focus</div>
              <h3 className="text-lg font-bold text-white">{planData?.priority_focus || "Remediate Technical Gaps"}</h3>
              <p className="text-xs text-slate-400">
                Estimated time to application readiness: <strong className="text-slate-200">{planData?.estimated_days_to_ready || 7} days</strong> at 2 hours/day study pace.
              </p>
            </Card>

            {/* Portfolio Snapshot */}
            <Card className="p-5 border-surface-border bg-surface/70 space-y-2">
              <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">Portfolio Quality</div>
              <div className="text-2xl font-extrabold text-white">{portfolioData?.portfolio_score ?? 65}%</div>
              <p className="text-[11px] text-slate-400">
                Live demo: {portfolioData?.live_demo_score ? "Attached" : "Missing"} • Tests: {portfolioData?.test_coverage_score ?? 50}%
              </p>
            </Card>
          </div>

          {/* Action Tasks */}
          <Card className="p-6 border-surface-border bg-surface/70 space-y-4">
            <h3 className="text-base font-bold text-white">Prioritized Preparation Task Feed</h3>
            <div className="space-y-3">
              {(planData?.plan_items || [
                {
                  id: "t1",
                  title: "Optimize Resume ATS Keyword Density",
                  description: "Incorporate verified project technical keywords and quantify performance metrics.",
                  category: "RESUME",
                  priority: "HIGH",
                  estimated_hours: 3,
                },
                {
                  id: "t2",
                  title: "Complete 2 Adaptive Mock Interview Sessions",
                  description: "Practice answering technical tradeoff and behavioral STAR questions with real-time feedback.",
                  category: "INTERVIEW",
                  priority: "MEDIUM",
                  estimated_hours: 4,
                },
              ]).map((task: any, idx: number) => (
                <div key={task.id || idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={task.priority === "CRITICAL" ? "danger" : task.priority === "HIGH" ? "warning" : "primary"}>
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-slate-400 uppercase font-semibold">{task.category}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{task.title}</h4>
                    <p className="text-xs text-slate-400">{task.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {task.estimated_hours} hrs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
