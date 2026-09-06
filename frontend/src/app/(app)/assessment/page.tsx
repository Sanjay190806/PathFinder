'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Brain, ArrowRight, RefreshCw, AlertCircle, Camera,
  CameraOff, Shield, ChevronDown, Sparkles, Video, CheckCircle2, XCircle
} from "lucide-react";
import { api, getAuthToken, setAuthToken } from "@/lib/api";
import { AIAssistantDrawer } from "@/components/AIAssistantDrawer";
import { Profile, AssessmentResult } from "@/lib/types";
import { Button, EmptyState, Alert, Badge } from "@/components/ui";
import { getQuestionsForDomain, calculateTotalMarks, LocalQuestion, getDomainFromRole } from "@/lib/questionBank";

import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { ThemeToggleControls } from "@/components/theme/ThemeToggleControls";
import { AssessmentProgress } from "@/components/assessment/AssessmentProgress";
import { AssessmentTimer } from "@/components/assessment/AssessmentTimer";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { AssessmentControls } from "@/components/assessment/AssessmentControls";
import { AssessmentSubmitModal } from "@/components/assessment/AssessmentSubmitModal";
import { CalibrationResult } from "@/components/assessment/CalibrationResult";
import { AssessmentSkeleton } from "@/components/assessment/AssessmentSkeleton";
import { DraggableProctorCamera, ProctorAttentionStatus } from "@/components/assessment/DraggableProctorCamera";
import { FullscreenProctorModal } from "@/components/assessment/FullscreenProctorModal";
import { CandidateFaceRegistrationModal } from "@/components/assessment/CandidateFaceRegistrationModal";
import { CandidateFaceProfile, loadCandidateProfile } from "@/lib/faceVision";

// ─── Domain options for 100-mark exam ────────────────────────────────────────
const EXAM_DOMAINS = [
  { label: "Video Editing & Media", value: "video_editing", icon: "🎬" },
  { label: "UI/UX & Graphic Design", value: "design", icon: "🎨" },
  { label: "Software Engineering", value: "software_engineering", icon: "💻" },
  { label: "Data Science & AI", value: "data_science", icon: "🤖" },
  { label: "Hardware & Electronics", value: "hardware_electronics", icon: "🔌" },
  { label: "DevOps & Cloud Architecture", value: "devops_cloud", icon: "☁️" },
  { label: "Cybersecurity & InfoSec", value: "cybersecurity", icon: "🔒" },
  { label: "Healthcare & Medicine", value: "healthcare_medicine", icon: "🏥" },
  { label: "Civil Engineering", value: "civil_engineering", icon: "🏗️" },
  { label: "Mechanical Engineering", value: "mechanical_engineering", icon: "⚙️" },
  { label: "Finance & Accounting", value: "finance_accounting", icon: "📈" },
  { label: "Law & Legal Studies", value: "law_legal", icon: "⚖️" },
  { label: "Education & Teaching", value: "education_teaching", icon: "📚" },
  { label: "Aviation & Aerospace", value: "aviation_aerospace", icon: "✈️" },
  { label: "Business & Management", value: "business", icon: "📊" },
];

// ─── Attention state types ────────────────────────────────────────────────────
type AttentionBannerState = "ok" | "face_missing" | "looking_away" | "multiple_faces" | "different_person" | "camera_off";

// ─── Camera consent + simple face detection banner ──────────────────────────
function CameraMonitorBanner({
  state,
  cameraActive,
  candidateName,
}: {
  state: AttentionBannerState;
  cameraActive: boolean;
  candidateName?: string;
}) {
  if (!cameraActive) return null;

  const banners: Record<AttentionBannerState, { icon: React.ReactNode; text: string; color: string } | null> = {
    ok: null,
    face_missing: {
      icon: <CameraOff className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />,
      text: "Candidate face not detected in frame. Please adjust camera position squarely at your face.",
      color: "bg-red-100/90 dark:bg-red-500/15 border-red-300 dark:border-red-500/30 text-red-950 dark:text-red-200 font-bold",
    },
    looking_away: {
      icon: <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />,
      text: "Attention warning: Please keep your eyes and attention centered on the assessment screen.",
      color: "bg-amber-100/90 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/30 text-amber-950 dark:text-amber-200 font-bold",
    },
    multiple_faces: {
      icon: <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />,
      text: "Multiple faces detected in assessment environment. Ensure you are taking this test alone.",
      color: "bg-red-100/90 dark:bg-red-500/20 border-red-300 dark:border-red-500/40 text-red-950 dark:text-red-200 font-bold",
    },
    different_person: {
      icon: <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />,
      text: "Biometric Impersonation Alert: Detected face does not match the registered candidate baseline!",
      color: "bg-red-100/90 dark:bg-red-500/25 border-red-300 dark:border-red-500/50 text-red-950 dark:text-red-200 font-bold",
    },
    camera_off: {
      icon: <CameraOff className="h-4 w-4 shrink-0 text-slate-600 dark:text-slate-400" />,
      text: "Camera monitoring paused.",
      color: "bg-slate-100 dark:bg-slate-500/15 border-slate-300 dark:border-slate-500/30 text-slate-900 dark:text-slate-200 font-bold",
    },
  };

  const banner = banners[state];
  if (!banner) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-300 text-xs font-bold">
        <Video className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
        <span>AI Vision Proctor Active — {candidateName ? `Candidate ${candidateName} Verified & Attentive` : "Face Monitored & Attentive"}</span>
        <span className="ml-auto h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${banner.color}`}
    >
      {banner.icon}
      <span>{banner.text}</span>
    </div>
  );
}

// ─── Domain selector component ───────────────────────────────────────────────
function DomainSelector({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (v: string) => void;
}) {
  const current = EXAM_DOMAINS.find((d) => d.value === selected) || EXAM_DOMAINS[0];
  return (
    <div className="relative inline-flex items-center gap-2 group">
      <span className="text-lg">{current.icon}</span>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent font-bold text-foreground text-base cursor-pointer pr-6 focus:outline-none"
        aria-label="Select exam domain"
      >
        {EXAM_DOMAINS.map((d) => (
          <option key={d.value} value={d.value} className="bg-surface text-foreground font-normal">
            {d.icon} {d.label}
          </option>
        ))}
      </select>
      <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-0 pointer-events-none" />
    </div>
  );
}

// ─── Question type from generated assessment ──────────────────────────────────
interface GeneratedQuestion {
  id: string;
  question_text: string;
  options: string[];
  skill_id?: string;
  skill_name?: string;
  marks?: number;
  difficulty?: string;
  instrumental_quality_score?: number;
  certification_level?: string;
  detected_bloom_level?: string;
}

export default function AssessmentPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  // Domain & blueprint state
  const [selectedDomain, setSelectedDomain] = useState(EXAM_DOMAINS[0].value);
  const domainInfo = EXAM_DOMAINS.find((d) => d.value === selectedDomain) || EXAM_DOMAINS[0];
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalMarks, setTotalMarks] = useState(100);
  const [examQualityMetrics, setExamQualityMetrics] = useState<{
    averageIqs: number;
    certificationLevel: string;
    approvedCount: number;
  } | null>(null);

  // Stepper & answer state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Status & modals
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Camera & monitoring
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [attentionState, setAttentionState] = useState<AttentionBannerState>("ok");
  const streamRef = useRef<MediaStream | null>(null);
  const faceCheckIntervalRef = useRef<number | null>(null);
  const isStartingCameraRef = useRef(false);

  // Candidate Biometric Face Baseline
  const [candidateProfile, setCandidateProfile] = useState<CandidateFaceProfile | null>(() => {
    return loadCandidateProfile();
  });
  const [showFaceRegistrationModal, setShowFaceRegistrationModal] = useState(false);

  // Fullscreen & Proctoring Malpractice Enforcement
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
  const [showFullscreenGate, setShowFullscreenGate] = useState(false);
  const [showFullscreenExitWarning, setShowFullscreenExitWarning] = useState(false);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [strikesCount, setStrikesCount] = useState(0);
  const strikesCountRef = useRef(0);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [autoSubmitReason, setAutoSubmitReason] = useState<string>("");

  // ─── Load profile and initial data ─────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        await api.demoLogin();
        setAuthToken("cookie");
      }
      const prof = await api.getProfile().catch(() => null);
      setProfile(prof);

      // Detect domain from profile
      if (prof?.primary_goal?.target_role) {
        const detected = getDomainFromRole(prof.primary_goal.target_role);
        setSelectedDomain(detected);
      }
    } catch (err: any) {
      setError("Unable to load profile. Please check the backend connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ─── Generate domain-specific 100-mark assessment ──────────────────────────
  const generateAssessment = useCallback(async (domain: string) => {
    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setAssessmentId(null);
    setSessionId(null);

    try {
      // STEP 1: Immediately load from local question bank (domain-specific, 30 Qs, 100 marks)
      const localQs = getQuestionsForDomain(domain);
      const localTotal = calculateTotalMarks(localQs);

      // Map local questions to the GeneratedQuestion shape
      const mapped: GeneratedQuestion[] = localQs.map((q) => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        skill_name: q.skill_name,
        marks: q.marks,
        difficulty: q.difficulty,
      }));

      setQuestions(mapped);
      setTotalMarks(localTotal);

      // STEP 2: Pipe candidate questions through the Backend Generative AI & Instrumental Quality Certification Pipeline
      try {
        const candidatePayload = localQs.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          correct_option_index: q.correct_index,
          marks: q.marks,
          difficulty: q.difficulty,
          skill_name: q.skill_name,
        }));

        const certifiedExam = await api.generateDomainExam({
          domain,
          target_role: profile?.primary_goal?.target_role || profile?.current_role || undefined,
          total_questions: candidatePayload.length,
          total_marks: localTotal,
          min_quality_score: 70.0,
          candidate_questions: candidatePayload,
        });

        if (certifiedExam?.questions?.length > 0) {
          setAssessmentId(certifiedExam.exam_id);
          setExamQualityMetrics({
            averageIqs: certifiedExam.average_iqs,
            certificationLevel: certifiedExam.certification_level,
            approvedCount: certifiedExam.approved_questions_count,
          });

          const certifiedQs: GeneratedQuestion[] = certifiedExam.questions.map((q: any) => ({
            id: q.id,
            question_text: q.question_text,
            options: q.options,
            skill_name: q.skill_name,
            marks: q.marks,
            difficulty: q.difficulty,
            instrumental_quality_score: q.instrumental_quality_score,
            certification_level: q.certification_level,
            detected_bloom_level: q.detected_bloom_level,
          }));

          setQuestions(certifiedQs);
          setTotalMarks(certifiedExam.total_marks || localTotal);
        }
      } catch (backendErr) {
        console.info("Backend assessment quality pipeline note:", backendErr);
      }
    } catch (err: any) {
      console.error("Assessment generation failed:", err);
      setError(err.message || "Failed to generate assessment. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, []);


  // Regenerate when domain changes (but only after first load)
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setHasLoaded(true);
      generateAssessment(selectedDomain);
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasLoaded) {
      generateAssessment(selectedDomain);
    }
  }, [selectedDomain]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Camera / face detection ────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStream(null);
    if (faceCheckIntervalRef.current) {
      clearInterval(faceCheckIntervalRef.current);
      faceCheckIntervalRef.current = null;
    }
    setCameraActive(false);
    setAttentionState("ok");
    if (typeof document !== "undefined") {
      document.body.classList.remove("assessment-fullscreen");
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (isStartingCameraRef.current) return;
    isStartingCameraRef.current = true;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Webcam API not supported in this browser");
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraActive(true);
      setCameraError(null);
      setAttentionState("ok");
    } catch (err: any) {
      console.warn("Camera ideal constraints failed, attempting fallback:", err);
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Webcam API not supported");
        }
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = fallbackStream;
        setStream(fallbackStream);
        setCameraActive(true);
        setCameraError(null);
        setAttentionState("ok");
      } catch (fallbackErr: any) {
        console.warn("Camera fallback access failed:", fallbackErr);
        setCameraError(
          fallbackErr.name === "NotAllowedError"
            ? "Camera permission was denied in browser settings."
            : "Webcam unavailable or in use."
        );
        setAttentionState("camera_off");
        setCameraActive(false);
      }
    } finally {
      isStartingCameraRef.current = false;
    }
  }, []);

  const handleStreamReady = useCallback((newStream: MediaStream) => {
    streamRef.current = newStream;
    setStream(newStream);
    setCameraActive(true);
    setCameraError(null);
    setAttentionState("ok");
  }, []);

  // Automatically start camera as soon as questions are generated and loaded
  useEffect(() => {
    if (questions.length > 0 && !result && !stream && !cameraActive) {
      startCamera();
    }
  }, [questions.length, result, stream, cameraActive, startCamera]);

  // Stop camera when exam ends
  useEffect(() => {
    if (result) stopCamera();
    return () => stopCamera();
  }, [result, stopCamera]);

  // Clean up body fullscreen class on component unmount
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("assessment-fullscreen");
      }
    };
  }, []);

  // ─── Fullscreen Management ───────────────────────────────────────────────────
  const handleEnterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen permission/error:", err);
    } finally {
      if (typeof document !== "undefined") {
        document.body.classList.add("assessment-fullscreen");
      }
      setHasEnteredFullscreen(true);
      setShowFullscreenGate(false);
      setShowFullscreenExitWarning(false);
      if (!cameraActive) {
        startCamera();
      }
    }
  }, [cameraActive, startCamera]);

  // Handle successful face registration & biometric enrollment
  const handleFaceRegistered = useCallback((profile: CandidateFaceProfile) => {
    setCandidateProfile(profile);
    setShowFaceRegistrationModal(false);
    // Directly transition into fullscreen mode
    handleEnterFullscreen();
  }, [handleEnterFullscreen]);

  // Show face registration first if candidate baseline is not registered yet; otherwise show fullscreen gate
  useEffect(() => {
    if (questions.length > 0 && !result) {
      if (!candidateProfile) {
        setShowFaceRegistrationModal(true);
        setShowFullscreenGate(false);
      } else if (!hasEnteredFullscreen) {
        const isFs = typeof document !== "undefined" && !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
        if (isFs) {
          setHasEnteredFullscreen(true);
          setShowFullscreenGate(false);
        } else {
          setShowFullscreenGate(true);
        }
      }
    }
  }, [questions.length, hasEnteredFullscreen, result, candidateProfile]);

  // Listen for fullscreen exits
  useEffect(() => {
    if (!hasEnteredFullscreen || result || isAutoSubmitting) return;

    const handleFullscreenChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isFs && hasEnteredFullscreen && !result) {
        setShowFullscreenExitWarning(true);
      } else {
        setShowFullscreenExitWarning(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [hasEnteredFullscreen, result, isAutoSubmitting]);

  // ─── Auto-Submission on 3 Strikes / Violations ──────────────────────────────
  const handleAutoSubmit = useCallback(async (reason: string) => {
    if (isSubmitting || isAutoSubmitting || result) return;
    setIsAutoSubmitting(true);
    setAutoSubmitReason(reason);

    // Score answers submitted so far
    let correctCount = 0;
    const confidenceUpdates: any[] = [];

    questions.forEach((q) => {
      const selected = answers[q.id];
      const isCorrect = selected !== undefined && selected === 0;
      if (isCorrect) correctCount++;
      confidenceUpdates.push({
        skill: q.skill_name || domainInfo.label,
        old_confidence: 0.5,
        new_confidence: isCorrect ? 0.85 : 0.35,
        is_correct: isCorrect,
      });
    });

    const scorePct = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

    try {
      if (assessmentId) {
        const submissionAnswers = questions.map((q) => ({
          question_id: q.id,
          selected_option_index: answers[q.id] ?? 0,
        }));
        await api.submitAssessment({
          assessment_id: assessmentId,
          answers: submissionAnswers,
        }).catch(() => null);
      }
    } catch {}

    const autoResult: AssessmentResult = {
      assessment_id: assessmentId || "assessment-proctor-auto",
      total_questions: questions.length,
      correct_count: correctCount,
      score_percentage: Math.round(scorePct),
      skill_confidence_updates: confidenceUpdates.slice(0, 4),
      adaptation_triggered: false,
      summary_message: `Assessment concluded. Auto-submitted due to proctoring violation (${reason}).`,
      auto_submitted: true,
      auto_submit_reason: reason,
      malpractice_strikes: 3,
    };

    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    stopCamera();

    setTimeout(() => {
      setResult(autoResult);
      setIsAutoSubmitting(false);
      setShowTabSwitchWarning(false);
      setShowFullscreenExitWarning(false);
      setShowFullscreenGate(false);
    }, 1500);
  }, [answers, assessmentId, domainInfo.label, isAutoSubmitting, isSubmitting, questions, result, stopCamera]);

  // ─── Tab-Switch & Focus Loss Watchdog (Active whenever test is in progress) ───
  const lastViolationTimeRef = useRef<number>(0);

  const registerMalpracticeStrike = useCallback((reason: string) => {
    if (result || isAutoSubmitting) return;

    const now = Date.now();
    // Debounce to prevent blur and visibilitychange from double-counting the same event
    if (now - lastViolationTimeRef.current < 1000) return;
    lastViolationTimeRef.current = now;

    strikesCountRef.current += 1;
    const next = strikesCountRef.current;
    setStrikesCount(next);

    if (next >= 3) {
      handleAutoSubmit(reason ? `${reason} (Strike 3 of 3).` : "Tab switch limit exceeded (3 of 3 strikes).");
    } else {
      setShowTabSwitchWarning(true);
    }
  }, [handleAutoSubmit, isAutoSubmitting, result]);

  useEffect(() => {
    // Tab-switching (visibilitychange and blur) MUST be monitored as long as test is in progress
    if (questions.length === 0 || result || isAutoSubmitting) return;

    const onVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        registerMalpracticeStrike("Browser tab switched or window minimized");
      }
    };

    const onWindowBlur = () => {
      registerMalpracticeStrike("Assessment window focus lost");
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [questions.length, result, isAutoSubmitting, registerMalpracticeStrike]);

  // ─── Answer & navigation handlers ──────────────────────────────────────────
  const currentQuestion = questions[currentQuestionIndex] || null;
  const answeredCount = Object.keys(answers).length;

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
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

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!assessmentId || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const submissionAnswers = questions.map((q) => ({
      question_id: q.id,
      selected_option_index: answers[q.id] ?? 0,
    }));

    try {
      let res: any;
      if (sessionId) {
        res = await api.submitSession(sessionId);
      } else {
        res = await api.submitAssessment({
          assessment_id: assessmentId,
          answers: submissionAnswers,
        });
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setResult(res);
      setIsConfirmModalOpen(false);
    } catch (err: any) {
      console.error("Submit failed:", err);
      setError(err.message || "Failed to submit assessment. Your answers are preserved — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    strikesCountRef.current = 0;
    setStrikesCount(0);
    setHasEnteredFullscreen(false);
    setShowFullscreenGate(false);
    setShowFullscreenExitWarning(false);
    setShowTabSwitchWarning(false);
    setIsAutoSubmitting(false);
    if (typeof document !== "undefined") {
      document.body.classList.remove("assessment-fullscreen");
    }
    generateAssessment(selectedDomain);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full">
      {/* Biometric Face Registration Check-In Modal */}
      <CandidateFaceRegistrationModal
        isOpen={showFaceRegistrationModal}
        stream={stream}
        candidateName={profile?.full_name || "Candidate"}
        onRegistered={handleFaceRegistered}
        onClose={() => setShowFaceRegistrationModal(false)}
      />

      {/* Draggable Picture-in-Picture Proctoring Camera Feed */}
      {questions.length > 0 && !result && (
        <DraggableProctorCamera
          stream={stream}
          cameraActive={cameraActive}
          cameraError={cameraError}
          strikesCount={strikesCount}
          maxStrikes={3}
          candidateProfile={candidateProfile}
          onRequestRecalibrate={() => setShowFaceRegistrationModal(true)}
          onStreamReady={handleStreamReady}
          onStatusChange={(status: ProctorAttentionStatus) => {
            if (status === "ATTENTIVE") setAttentionState("ok");
            else if (status === "LOOKING_AWAY") setAttentionState("looking_away");
            else if (status === "FACE_NOT_DETECTED") setAttentionState("face_missing");
            else if (status === "MULTIPLE_FACES") setAttentionState("multiple_faces");
            else if (status === "DIFFERENT_PERSON") setAttentionState("different_person");
            else if (status === "CAMERA_OFF") setAttentionState("camera_off");
          }}
          onMalpracticeAlert={(reason) => {
            registerMalpracticeStrike(reason);
          }}
        />
      )}

      {/* Fullscreen & Malpractice Warning Modals */}
      <FullscreenProctorModal
        showFullscreenGate={showFullscreenGate}
        onEnterFullscreen={handleEnterFullscreen}
        showFullscreenExitWarning={showFullscreenExitWarning}
        onResumeFullscreen={handleEnterFullscreen}
        onFullscreenExitExpired={() => {
          registerMalpracticeStrike("Fullscreen mode exited for over 10 seconds");
        }}
        showTabSwitchWarning={showTabSwitchWarning}
        tabStrikesCount={strikesCount}
        maxStrikes={3}
        onDismissTabWarning={() => setShowTabSwitchWarning(false)}
        isAutoSubmitting={isAutoSubmitting}
        autoSubmitReason={autoSubmitReason}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto w-full space-y-6">

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {isLoading ? (
          <AssessmentSkeleton />
        ) : result ? (
          /* ── Result ─────────────────────────────────────────────────────── */
          <CalibrationResult result={result} onRetake={handleRetake} />
        ) : (
          <>
            {/* ── Domain header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="cyan" size="sm">
                    <Sparkles className="h-3 w-3 mr-1" /> AI-Generated Exam
                  </Badge>
                  <Badge variant="neutral" size="sm">100 Marks</Badge>
                  {examQualityMetrics && (
                    <Badge variant="success" size="sm" title="Certified by Psychometric Instrumental Quality Evaluator">
                      <Shield className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                      Quality IQS: {Math.round(examQualityMetrics.averageIqs)}% ({examQualityMetrics.certificationLevel.replace('_', ' ')})
                    </Badge>
                  )}
                  {candidateProfile && (
                    <Badge variant="success" size="sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1 inline-block" />
                      Face Calibrated: {candidateProfile.name || "Candidate"}
                    </Badge>
                  )}
                  {cameraActive && (
                    <Badge variant="success" size="sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse mr-1 inline-block" />
                      Camera On
                    </Badge>
                  )}
                  {hasEnteredFullscreen && (
                    <Badge variant="secondary" size="sm">
                      Fullscreen Active
                    </Badge>
                  )}
                  {strikesCount > 0 && (
                    <Badge variant="danger" size="sm">
                      ⚠️ Strikes: {strikesCount}/3
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <DomainSelector
                    selected={selectedDomain}
                    onChange={(v) => { setSelectedDomain(v); }}
                  />
                  <span className="text-muted-foreground text-sm">Assessment</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {questions.length > 0
                    ? `${questions.length} questions · ${totalMarks} total marks · AI-generated for ${domainInfo.label}`
                    : "Generating domain-specific questions with AI..."}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ThemeToggleControls />
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:bg-muted px-2.5 py-1.5 rounded-lg border border-border/80 bg-card transition-colors shadow-sm"
                >
                  ← Exit Exam
                </Link>
              </div>
            </div>

            {/* ── Camera monitoring banner ─────────────────────────────── */}
            <CameraMonitorBanner state={attentionState} cameraActive={cameraActive} candidateName={candidateProfile?.name || profile?.full_name} />

            {/* ── Error ─────────────────────────────────────────────────── */}
            {error && !result && (
              <div className="space-y-3">
                <Alert variant="danger" message={error} />
                <Button onClick={() => generateAssessment(selectedDomain)} variant="primary" leftIcon={<RefreshCw className="h-4 w-4" />}>
                  Retry
                </Button>
              </div>
            )}

            {/* ── Generating spinner ────────────────────────────────────── */}
            {isGenerating && (
              <div className="py-16 flex flex-col items-center gap-4 text-center">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Generating your {domainInfo.label} exam…</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI is creating 30 domain-specific questions worth 100 marks
                  </p>
                </div>
              </div>
            )}

            {/* ── Empty state ───────────────────────────────────────────── */}
            {!isGenerating && !error && questions.length === 0 && (
              <div className="py-12 max-w-lg mx-auto">
                <EmptyState
                  icon={<Brain className="h-8 w-8 text-primary-400" />}
                  title="No questions available"
                  description="Questions for this domain are being calibrated. Try another domain or check the backend connection."
                  action={
                    <Button
                      onClick={() => generateAssessment(selectedDomain)}
                      size="lg"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Retry
                    </Button>
                  }
                />
              </div>
            )}

            {/* ── Question view ─────────────────────────────────────────── */}
            {!isGenerating && questions.length > 0 && currentQuestion && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Progress */}
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

                {/* Marks badge */}
                {currentQuestion.marks && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
                      {currentQuestion.marks} marks
                    </span>
                    {currentQuestion.difficulty && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize
                        ${currentQuestion.difficulty === "hard"
                          ? "bg-red-100/90 dark:bg-red-500/15 text-red-950 dark:text-red-200 border-red-300 dark:border-red-500/30"
                          : currentQuestion.difficulty === "medium"
                          ? "bg-amber-100/90 dark:bg-amber-500/15 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-500/30"
                          : "bg-emerald-100/90 dark:bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/30"
                        }`}>
                        {currentQuestion.difficulty}
                      </span>
                    )}
                  </div>
                )}

                {/* Question card */}
                <QuestionCard
                  question={{
                    id: currentQuestion.id,
                    skill_id: currentQuestion.skill_id || "",
                    skill_name: currentQuestion.skill_name || domainInfo.label,
                    question_text: currentQuestion.question_text,
                    options: currentQuestion.options,
                    marks: currentQuestion.marks,
                    difficulty: currentQuestion.difficulty,
                    instrumental_quality_score: currentQuestion.instrumental_quality_score,
                    certification_level: currentQuestion.certification_level,
                    detected_bloom_level: currentQuestion.detected_bloom_level,
                  }}
                  selectedOptionIndex={answers[currentQuestion.id]}
                  onSelectOption={handleSelectOption}
                />

                {/* Controls */}
                <AssessmentControls
                  currentIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                  hasAnsweredCurrent={answers[currentQuestion.id] !== undefined}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onSubmitPrompt={() => setIsConfirmModalOpen(true)}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Submit confirmation modal */}
      <AssessmentSubmitModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirmSubmit={handleSubmit}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        isSubmitting={isSubmitting}
      />

      {/* AI Career Coach drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onPlanAdjusted={() => generateAssessment(selectedDomain)}
      />
    </div>
  );
}
