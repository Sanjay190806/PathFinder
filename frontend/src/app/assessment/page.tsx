'use client';

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Brain, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { api, getAuthToken, setAuthToken } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { AIAssistantDrawer } from "@/components/AIAssistantDrawer";
import { Assessment, AssessmentQuestion, Profile, AssessmentResult } from "@/lib/types";
import { Button, EmptyState, Alert } from "@/components/ui";

import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { AssessmentProgress } from "@/components/assessment/AssessmentProgress";
import { AssessmentTimer } from "@/components/assessment/AssessmentTimer";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { AssessmentControls } from "@/components/assessment/AssessmentControls";
import { AssessmentSubmitModal } from "@/components/assessment/AssessmentSubmitModal";
import { CalibrationResult } from "@/components/assessment/CalibrationResult";
import { AssessmentSkeleton } from "@/components/assessment/AssessmentSkeleton";

export default function AssessmentPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  // Stepper & Answer state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Status & Modals
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        await api.demoLogin();
        setAuthToken('cookie');
      }

      const [profData, assessData] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getAssessments().catch(() => [])
      ]);

      setProfile(profData);
      setAssessments(assessData || []);
      if (assessData && assessData.length > 0) {
        setSelectedAssessment(assessData[0]);
      }
    } catch (err: any) {
      console.error("Error loading assessment data", err);
      setError("Unable to load calibration questions. Please check the backend connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const questions: AssessmentQuestion[] = selectedAssessment?.questions || [];
  const currentQuestion = questions[currentQuestionIndex] || null;
  const answeredCount = Object.keys(answers).length;

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssessment || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const submissionAnswers = selectedAssessment.questions.map((q) => ({
      question_id: q.id,
      selected_option_index: answers[q.id] ?? 0
    }));

    try {
      const res = await api.submitAssessment({
        assessment_id: selectedAssessment.id,
        answers: submissionAnswers
      });
      setResult(res);
      setIsConfirmModalOpen(false);
    } catch (err: any) {
      console.error("Failed to submit calibration", err);
      setError(
        err.message || "Failed to evaluate answers. Your selections are preserved ? please try submitting again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Global Navigation */}
      <Navbar
        user={profile}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto w-full space-y-8">
        {isLoading ? (
          <AssessmentSkeleton />
        ) : error && !result ? (
          <div className="py-12 max-w-lg mx-auto text-center space-y-4">
            <Alert variant="danger" message={error} />
            <Button onClick={loadData} variant="primary" leftIcon={<RefreshCw className="h-4 w-4" />}>
              Retry Connection
            </Button>
          </div>
        ) : result ? (
          /* Result Summary */
          <CalibrationResult result={result} onRetake={handleRetake} />
        ) : !selectedAssessment || questions.length === 0 ? (
          /* Empty State */
          <div className="py-12 max-w-lg mx-auto">
            <EmptyState
              icon={<Brain className="h-8 w-8 text-primary-400" />}
              title="No calibration questions available"
              description="Diagnostics are currently being calibrated for your career track. You can continue directly with your sequenced roadmap."
              action={
                <Link href="/roadmap">
                  <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Explore My Roadmap
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          /* Question View */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <AssessmentHeader
              targetRole={profile?.primary_goal?.target_role}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
            />

            {/* Pacing Timer & Progress Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <AssessmentProgress
                  currentIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                  answeredCount={answeredCount}
                />
              </div>
              <div className="shrink-0 self-end sm:self-auto">
                <AssessmentTimer />
              </div>
            </div>

            {/* Dominant Question Card */}
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                selectedOptionIndex={answers[currentQuestion.id]}
                onSelectOption={handleSelectOption}
              />
            )}

            {/* Navigation Controls */}
            <AssessmentControls
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              hasAnsweredCurrent={currentQuestion ? answers[currentQuestion.id] !== undefined : false}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmitPrompt={() => setIsConfirmModalOpen(true)}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </main>

      {/* Confirmation Modal before Final Submit */}
      <AssessmentSubmitModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirmSubmit={handleSubmit}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        isSubmitting={isSubmitting}
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
