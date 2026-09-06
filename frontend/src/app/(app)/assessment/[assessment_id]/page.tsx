'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  AssessmentIntro, AssessmentTimer, ProgressIndicator, 
  QuestionCard, AdaptationIndicator, QuestionData, AssessmentMetadata 
} from '@/components/assessment/AdaptiveAssessmentComponents';
import { ArrowRight, CheckCircle2, RotateCcw, Award } from 'lucide-react';

export default function AssessmentExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params?.assessment_id as string;

  const [assessment, setAssessment] = useState<AssessmentMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session State
  const [selectedMode, setSelectedMode] = useState<string>('ADAPTIVE');
  const [session, setSession] = useState<any | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600);
  const [currentDifficulty, setCurrentDifficulty] = useState('INTERMEDIATE');
  const [adaptationMessage, setAdaptationMessage] = useState<string | null>(null);

  // Answering State
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [codeAnswer, setCodeAnswer] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);

  // Result State
  const [completedResult, setCompletedResult] = useState<any | null>(null);

  useEffect(() => {
    if (!assessmentId) return;
    loadAssessment();
  }, [assessmentId]);

  // Authoritative server-synchronized countdown
  useEffect(() => {
    if (!session || session.status !== 'IN_PROGRESS' || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session, timeRemaining]);

  async function loadAssessment() {
    setLoading(true);
    try {
      const data = await api.getAssessment(assessmentId);
      setAssessment(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  }

  async function handleStartSession() {
    setLoading(true);
    setError(null);
    try {
      const s = await api.startAssessmentSession(assessmentId, { mode: selectedMode });
      setSession(s);
      setTimeRemaining(s.time_remaining_seconds || 3600);
      setCurrentDifficulty(s.current_difficulty || 'INTERMEDIATE');

      // Fetch first question
      const nextQ = await api.getNextQuestion(s.id);
      setCurrentQuestion(nextQ.question);
      setQuestionNumber(nextQ.question_number);
    } catch (err: any) {
      setError(err.message || 'Could not initiate assessment session');
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswerAndNext() {
    if (!session || !currentQuestion) return;
    setSubmitting(true);
    setError(null);
    try {
      const answerPayload: any = {
        question_id: currentQuestion.id,
        selected_option_index: typeof selectedAnswer === 'number' ? selectedAnswer : null,
        submitted_answer: typeof selectedAnswer === 'string' ? selectedAnswer : (codeAnswer || null),
        time_spent_seconds: 15
      };

      const resp = await api.submitAnswer(session.id, answerPayload);

      if (resp.adaptation_message) {
        setAdaptationMessage(resp.adaptation_message);
      } else {
        setAdaptationMessage(null);
      }

      if (resp.explanation) {
        setLastExplanation(resp.explanation);
      } else {
        setLastExplanation(null);
      }

      if (resp.current_difficulty) {
        setCurrentDifficulty(resp.current_difficulty);
      }

      // Check if session completed or get next
      if (!resp.next_question_available) {
        const finalSubmit = await api.submitSession(session.id);
        setCompletedResult(finalSubmit);
      } else {
        // Clear inputs for next question
        setSelectedAnswer(null);
        setCodeAnswer('');

        const nextData = await api.getNextQuestion(session.id);
        setCurrentQuestion(nextData.question);
        setQuestionNumber(nextData.question_number);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAutoSubmit() {
    if (!session) return;
    try {
      const finalSubmit = await api.submitSession(session.id);
      setCompletedResult(finalSubmit);
    } catch (e) {
      console.error(e);
    }
  }

  if (loading && !session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 rounded-2xl bg-card border border-border text-center shadow-sm">
        <p className="text-rose-600 dark:text-rose-400 text-sm mb-4 font-medium">{error}</p>
        <button
          onClick={loadAssessment}
          className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground font-semibold text-sm transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 1. Completion Screen
  if (completedResult) {
    const passed = completedResult.passed;
    return (
      <div className="max-w-xl mx-auto mt-12 p-8 rounded-2xl bg-card border border-border text-center shadow-sm">
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
          passed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
        }`}>
          {passed ? <CheckCircle2 className="w-8 h-8" /> : <Award className="w-8 h-8" />}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {passed ? 'Assessment Completed Successfully!' : 'Assessment Attempt Recorded'}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Your syllabus competency and performance footprint have been authoritatively recorded.
        </p>

        <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-border mb-6">
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Your Score</div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {completedResult.total_score} / {completedResult.total_max_marks}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-semibold">Passing Criteria</div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {completedResult.passing_score} Marks
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/dashboard`)}
            className="flex-1 py-3 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground font-semibold text-sm transition-all shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 2. Intro & Mode Selection Screen
  if (!session && assessment) {
    return (
      <div className="py-8 px-4 sm:px-6">
        <AssessmentIntro
          assessment={assessment}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          onStart={handleStartSession}
        />
      </div>
    );
  }

  // 3. Active Question View
  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <ProgressIndicator
            current={questionNumber}
            total={assessment?.total_questions || 30}
            difficulty={currentDifficulty}
          />
        </div>
        <AssessmentTimer seconds={timeRemaining} />
      </div>

      {adaptationMessage && (
        <div className="mb-4">
          <AdaptationIndicator message={adaptationMessage} />
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {currentQuestion && (
        <div className="space-y-6">
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={setSelectedAnswer}
            codeAnswer={codeAnswer}
            onChangeCodeAnswer={setCodeAnswer}
            explanation={lastExplanation}
          />

          <div className="flex justify-end">
            <button
              onClick={handleAnswerAndNext}
              disabled={submitting || (selectedAnswer === null && !codeAnswer)}
              className="flex items-center gap-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
            >
              {submitting ? 'Evaluating...' : 'Submit & Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
