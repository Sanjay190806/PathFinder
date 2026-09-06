import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookmarkPlus,
  CheckCircle2,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Save,
  Square,
  TimerReset,
  Trophy,
  Volume2,
} from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { useCareerStore } from '../app/store/useCareerStore';
import { useResumeStudioStore } from '../app/store/useResumeStudioStore';
import { useInterviewStore } from '../app/store/useInterviewStore';
import { useAISettingsStore } from '../app/store/useAISettingsStore';
import {
  buildInterviewCoachContext,
  buildInterviewSessionId,
  deriveVoiceStats,
  formatInterviewContextForPrompt,
} from '../utils/interviewCoachUtils';
import {
  finalReviewInterviewSession,
  fetchNextInterviewQuestion,
  scoreInterviewAnswer,
  startInterviewSession,
} from '../services/interviewService';
import {
  InterviewDifficulty,
  InterviewFinalReview,
  InterviewMode,
  InterviewSessionQuestion,
} from '../types/interview';

const modeOptions: { value: InterviewMode; label: string }[] = [
  { value: 'HR', label: 'HR' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Behavioral', label: 'Behavioral' },
  { value: 'Product/Analyst', label: 'Product / Analyst' },
  { value: 'German', label: 'German' },
  { value: 'Company-Specific', label: 'Company-Specific' },
  { value: 'Resume-Based', label: 'Resume-Based' },
  { value: 'Rapid Fire', label: 'Rapid Fire' },
];

const difficultyOptions: { value: InterviewDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'German' },
];

const toQuestion = (question: string, index: number, source?: Partial<InterviewSessionQuestion>): InterviewSessionQuestion => ({
  id: `q-${index + 1}-${buildInterviewSessionId()}`,
  question,
  followUpHint: source?.followUpHint,
  focusAreas: source?.focusAreas || [],
  scoringRubric: source?.scoringRubric || [],
});

function confidenceLabel(value: number) {
  if (value >= 5) return 'Very confident';
  if (value >= 4) return 'Confident';
  if (value >= 3) return 'Steady';
  if (value >= 2) return 'Uneven';
  return 'Nervous';
}

export const InterviewCoachPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const resumeStudio = useResumeStudioStore((s) => s);
  const aiSettings = useAISettingsStore((s) => s);
  const {
    activeSession,
    answers,
    scores,
    favoriteQuestions,
    voiceStats,
    loading,
    error,
    setLoading,
    setError,
    setActiveQuestionIndex,
    updateVoiceStats,
    startSession,
    appendQuestion,
    answerQuestion,
    scoreAnswer,
    endSession,
    saveSession,
    resetSession,
    markQuestionForRevision,
  } = useInterviewStore();

  const [mode, setMode] = useState<InterviewMode>('HR');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('medium');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [companyName, setCompanyName] = useState(careerState.applications[0]?.company || careerState.resume.targetRole || 'General placement target');
  const [roleTitle, setRoleTitle] = useState(careerState.resume.targetRole || 'SWE');
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [currentQuestion, setCurrentQuestion] = useState<InterviewSessionQuestion | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [statusText, setStatusText] = useState('Start a session to begin.');
  const [finalReview, setFinalReview] = useState<InterviewFinalReview | null>(null);
  const [confidenceRating, setConfidenceRating] = useState(3);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const speechStartedAtRef = useRef<number | null>(null);
  const speechTranscriptRef = useRef('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ambient particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const parent = canvas.parentElement;
    let w = (canvas.width = parent?.offsetWidth || window.innerWidth);
    let h = (canvas.height = parent?.offsetHeight || window.innerHeight);
    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    const colors = ['#eab308', '#3b82f6', '#00f0ff', '#ef4444'];
    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.5 + 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.12 + 0.03
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 5; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
  }, []);

  const interviewContext = useMemo(
    () => buildInterviewCoachContext(careerState, {
      selectedResumeVersion: resumeStudio.selectedResumeVersion,
      lastJobDescription: resumeStudio.lastJobDescription,
      mode,
      companyName,
      roleTitle,
    }),
    [careerState, resumeStudio.lastJobDescription, resumeStudio.selectedResumeVersion, mode, companyName, roleTitle]
  );

  const storedQuestion = activeSession?.questions?.[activeSession.questions.length - 1] || null;
  const displayedQuestion = currentQuestion || storedQuestion;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionCtor = (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition
      || (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    setSpeechSupported(Boolean(SpeechRecognitionCtor) && Boolean(window.speechSynthesis));
  }, []);

  useEffect(() => {
    if (!currentQuestion && activeSession?.questions?.length) {
      const index = activeSession.questions.length - 1;
      setCurrentQuestion(activeSession.questions[index]);
      setActiveQuestionIndex(index);
    }
  }, [activeSession, currentQuestion, setActiveQuestionIndex]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel?.();
      }
    };
  }, []);

  useEffect(() => {
    updateVoiceStats({ confidenceRating });
  }, [confidenceRating, updateVoiceStats]);

  const sessionHistory = useMemo(() => {
    const scoreMap = new Map(scores.map((score) => [score.questionId, score]));
    return answers.map((answer) => ({
      answer,
      score: scoreMap.get(answer.questionId) || null,
    }));
  }, [answers, scores]);

  const sessionSummary = useMemo(() => {
    if (!activeSession) return null;
    const totalScore = scores.length ? Math.round(scores.reduce((sum, item) => sum + item.overallScore, 0) / scores.length) : 0;
    return {
      totalScore,
      answered: answers.length,
      questions: activeSession.questions.length,
      favorites: favoriteQuestions.length,
    };
  }, [activeSession, answers.length, scores, favoriteQuestions.length]);

  const startNewSession = async () => {
    if (loading) return;
    setError(null);
    setStatusText('Starting interview session...');
    setFinalReview(null);
    setCurrentAnswer('');
    setCurrentQuestion(null);
    resetSession();
    setLoading(true);

    try {
      const response = await startInterviewSession({
        mode,
        difficulty,
        durationMinutes,
        companyName,
        roleTitle,
        language,
        questionCount: 1,
        context: interviewContext,
        resumeState: {
          selectedResumeVersion: resumeStudio.selectedResumeVersion,
          lastJobDescription: resumeStudio.lastJobDescription,
          atsScore: careerState.resume.atsScore,
          targetRole: careerState.resume.targetRole,
        },
      });

      const firstQuestion = toQuestion(response.question, 0, response);
      startSession({
        mode,
        difficulty,
        durationMinutes,
        companyName,
        roleTitle,
        language,
        questions: [firstQuestion],
        providerUsed: response.providerUsed,
        modelUsed: response.modelUsed,
      });
      appendQuestion(firstQuestion);
      setCurrentQuestion(firstQuestion);
      setActiveQuestionIndex(0);
      setStatusText(`Session ready using ${response.providerUsed || 'local'}${response.modelUsed ? ` / ${response.modelUsed}` : ''}.`);
    } catch (sessionError: any) {
      setError(sessionError?.message || 'Unable to start the interview session.');
      setStatusText('Session start failed. Try again or switch provider.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!displayedQuestion || loading) return;
    const trimmedAnswer = currentAnswer.trim();
    if (!trimmedAnswer) {
      setStatusText('Type or dictate an answer first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const questionId = displayedQuestion.id || buildInterviewSessionId();
      answerQuestion({
        questionId,
        question: displayedQuestion.question,
        answer: trimmedAnswer,
      });

      const scoreResult = await scoreInterviewAnswer({
        mode,
        difficulty,
        companyName,
        roleTitle,
        language,
        question: displayedQuestion.question,
        answer: trimmedAnswer,
        context: interviewContext,
        history: sessionHistory.map((item) => ({
          question: item.answer.question,
          answer: item.answer.answer,
          score: item.score?.overallScore,
        })).concat({ question: displayedQuestion.question, answer: trimmedAnswer, score: undefined }),
        voiceStats,
      });

      scoreAnswer({
        questionId,
        question: displayedQuestion.question,
        overallScore: scoreResult.overallScore,
        categoryScores: scoreResult.categoryScores,
        strengths: scoreResult.strengths,
        improvements: scoreResult.improvements,
        followUpQuestions: scoreResult.followUpQuestions,
        answerSummary: scoreResult.answerSummary,
        createdAt: new Date().toISOString(),
      });

      setStatusText(`Scored ${scoreResult.overallScore}/100. Generate the next question when you are ready.`);
    } catch (scoreError: any) {
      setError(scoreError?.message || 'Unable to score this answer right now.');
      setStatusText('Answer kept. You can retry scoring or edit the response.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!displayedQuestion || loading) return;
    if (!currentAnswer.trim()) {
      setStatusText('Answer the current question before asking for a follow-up.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetchNextInterviewQuestion({
        mode,
        difficulty,
        companyName,
        roleTitle,
        language,
        question: displayedQuestion.question,
        answer: currentAnswer.trim(),
        context: interviewContext,
        history: sessionHistory.map((item) => ({
          question: item.answer.question,
          answer: item.answer.answer,
          score: item.score?.overallScore,
        })),
      });

      const nextQuestion = toQuestion(response.question, activeSession?.questions.length || 1, response);
      appendQuestion(nextQuestion);
      setCurrentQuestion(nextQuestion);
      setCurrentAnswer('');
      setActiveQuestionIndex(activeSession?.questions.length || 1);
      setStatusText(`Follow-up ready from ${response.providerUsed || 'local'}${response.modelUsed ? ` / ${response.modelUsed}` : ''}.`);
    } catch (followError: any) {
      setError(followError?.message || 'Unable to fetch the next question right now.');
      setStatusText('Follow-up failed. Your current answer is still saved.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalReview = async () => {
    if (!displayedQuestion || loading) return;
    setLoading(true);
    setError(null);
    try {
      const review = await finalReviewInterviewSession({
        mode,
        difficulty,
        companyName,
        roleTitle,
        language,
        context: interviewContext,
        history: sessionHistory.map((item) => ({
          question: item.answer.question,
          answer: item.answer.answer,
          score: item.score?.overallScore,
        })),
        scores: scores.map((item) => ({
          question: item.question,
          score: item.overallScore,
        })),
        voiceStats,
      });

      setFinalReview(review);
      endSession(review);
      setStatusText(`Final review ready. Overall score ${review.overallScore}/100.`);
    } catch (reviewError: any) {
      setError(reviewError?.message || 'Unable to build the final review right now.');
      setStatusText('Final review failed. The session is still saved locally.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCurrentQuestion = () => {
    if (!displayedQuestion) return;
    markQuestionForRevision(displayedQuestion.question);
    setStatusText('Saved this question for later revision.');
  };

  const handleSave = () => {
    saveSession();
    setStatusText('Session saved.');
  };

  const handleNewSession = () => {
    resetSession();
    setCurrentQuestion(null);
    setCurrentAnswer('');
    setFinalReview(null);
    setStatusText('Ready for a fresh session.');
  };

  const startVoiceCapture = () => {
    if (!speechSupported || loading) return;
    const SpeechRecognitionCtor = (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition
      || (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = language === 'de' ? 'de-DE' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;
    speechStartedAtRef.current = Date.now();
    speechTranscriptRef.current = '';
    setListening(true);
    setStatusText('Listening... speak your answer and stop when finished.');

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((result: any) => result[0]?.transcript || '').join(' ');
      speechTranscriptRef.current = transcript;
      setCurrentAnswer(transcript);
      if (speechStartedAtRef.current) {
        updateVoiceStats(deriveVoiceStats(transcript, speechStartedAtRef.current, confidenceRating));
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setStatusText('Voice recognition stopped with an error.');
    };

    recognition.onend = () => {
      setListening(false);
      if (speechStartedAtRef.current) {
        updateVoiceStats(deriveVoiceStats(speechTranscriptRef.current, speechStartedAtRef.current, confidenceRating));
      }
    };

    recognition.start();
  };

  const stopVoiceCapture = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    setListening(false);
    if (speechStartedAtRef.current) {
      updateVoiceStats(deriveVoiceStats(speechTranscriptRef.current, speechStartedAtRef.current, confidenceRating));
    }
  };

  const speakQuestion = () => {
    if (typeof window === 'undefined' || !displayedQuestion) return;
    const utterance = new SpeechSynthesisUtterance(displayedQuestion.question);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.lang = language === 'de' ? 'de-DE' : 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
  };

  const quickStartButtons = [
    { label: 'HR', prompt: 'Ask Shayla to start HR interview' },
    { label: 'Java DSA', prompt: 'Ask Shayla to ask Java DSA questions' },
    { label: 'CareSync AI', prompt: 'Ask Shayla to interview me on CareSync AI' },
    { label: 'German', prompt: 'Ask Shayla to practice German intro' },
    { label: 'Improve', prompt: 'Ask Shayla to improve my answer' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10 fade-in select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader
          title="🦇 Batman Gotham AI Interrogation Matrix // Interview Telemetry"
          subtitle="Practice HR, technical, behavioral, German, and resume-based interrogation protocols with scoring, follow-ups, and voice telemetry."
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewSession} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              New Session
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Session
            </Button>
          </div>
        )}
      />

      <Card className="flex flex-col gap-4 border-accentBlue/20 bg-accentBlue/5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Session Flow</Badge>
          <Badge variant="primary">Scored Answers</Badge>
          <Badge variant="warning">Voice Optional</Badge>
          <Badge variant="neutral">Browser-only speech</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickStartButtons.map((item) => (
            <ShaylaPromptButton key={item.label} prompt={`${item.prompt}. Use the current placement context and keep it concise.`} variant="outline" className="justify-start">
              {item.label}
            </ShaylaPromptButton>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <Card className="grid gap-4 xl:grid-cols-4">
            <Select label="Mode" value={mode} onChange={(e) => setMode(e.target.value as InterviewMode)} options={modeOptions} />
            <Select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)} options={difficultyOptions} />
            <Input label="Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Target company" />
            <Input label="Role" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Target role" />
            <Input label="Duration (min)" type="number" min={5} max={120} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value) || 20)} />
            <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'de')} options={languageOptions} />
            <div className="xl:col-span-2 flex items-end gap-2">
              <Button onClick={startNewSession} disabled={loading} className="gap-2">
                <Play className="h-4 w-4" />
                Start Session
              </Button>
              <Button variant="outline" onClick={handleFinalReview} disabled={loading || !currentQuestion} className="gap-2">
                <Trophy className="h-4 w-4" />
                Final Review
              </Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Current question</p>
                <h3 className="mt-1 text-lg font-semibold text-textPrimary">
                  {displayedQuestion?.question || 'No active question yet'}
                </h3>
                {displayedQuestion?.followUpHint && (
                  <p className="mt-2 text-sm text-textSecondary">{displayedQuestion.followUpHint}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">{mode}</Badge>
                <Badge variant="neutral">{difficulty}</Badge>
                <Badge variant="neutral">{companyName}</Badge>
              </div>
            </div>

            {displayedQuestion?.focusAreas?.length ? (
              <div className="flex flex-wrap gap-2">
                {displayedQuestion.focusAreas.map((focus) => (
                  <Badge key={focus} variant="neutral">{focus}</Badge>
                ))}
              </div>
            ) : null}

            {displayedQuestion?.scoringRubric?.length ? (
              <div className="flex flex-wrap gap-2">
                {displayedQuestion.scoringRubric.map((rubric) => (
                  <span key={rubric} className="rounded-full border border-border-subtle bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-textSecondary">
                    {rubric}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={speakQuestion} disabled={!displayedQuestion} className="gap-2">
                <Volume2 className="h-4 w-4" />
                Speak question
              </Button>
              <Button variant="outline" size="sm" onClick={handleMarkCurrentQuestion} disabled={!displayedQuestion} className="gap-2">
                <BookmarkPlus className="h-4 w-4" />
                Save for revision
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextQuestion} disabled={!displayedQuestion || !currentAnswer.trim()} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Follow-up
              </Button>
            </div>

            <div className="grid gap-3">
              <label className="text-xs font-semibold uppercase tracking-[0.22em] text-textMuted" htmlFor="interview-answer">
                Your answer
              </label>
              <textarea
                id="interview-answer"
                rows={7}
                value={currentAnswer}
                onChange={(event) => setCurrentAnswer(event.target.value)}
                placeholder="Type your answer here, or use voice mode to dictate it."
                className="resize-none rounded-2xl border border-border-subtle bg-white/[0.03] px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted/70 focus:border-accentBlue focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={handleSubmitAnswer} disabled={!displayedQuestion || loading} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Score Answer
                </Button>
                <Button variant="outline" onClick={() => setCurrentAnswer('')} disabled={loading} className="gap-2">
                  <TimerReset className="h-4 w-4" />
                  Clear answer
                </Button>
                <span className="text-xs text-textMuted">Keep answers tight and honest. Shayla will handle the rest.</span>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Voice mode</p>
                <h3 className="mt-1 text-lg font-semibold text-textPrimary">Browser speech practice</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={speechSupported ? 'success' : 'danger'}>{speechSupported ? 'Supported' : 'Not supported'}</Badge>
                <Badge variant={listening ? 'warning' : 'neutral'}>{listening ? 'Listening' : 'Idle'}</Badge>
                <Badge variant={speaking ? 'primary' : 'neutral'}>{speaking ? 'Speaking' : 'Muted'}</Badge>
              </div>
            </div>

            {!speechSupported ? (
              <div className="flex items-center gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Speech recognition and synthesis are not available in this browser. You can still type answers normally.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant={listening ? 'danger' : 'primary'} onClick={listening ? stopVoiceCapture : startVoiceCapture} className="gap-2">
                      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {listening ? 'Stop voice' : 'Start voice'}
                    </Button>
                    <Button variant="outline" onClick={() => window.speechSynthesis?.cancel?.()} className="gap-2">
                      <Square className="h-4 w-4" />
                      Stop speaking
                    </Button>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-textMuted">Confidence self-rating</span>
                      <span className="text-sm font-semibold text-textPrimary">{confidenceLabel(confidenceRating)}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={confidenceRating}
                      onChange={(e) => setConfidenceRating(Number(e.target.value))}
                      className="w-full accent-[#8B5CF6]"
                    />
                    <p className="mt-2 text-xs text-textSecondary">
                      Speaking duration, WPM, and filler-word count are tracked locally in the browser only.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textMuted">Speaking duration</p>
                    <p className="mt-1 text-xl font-semibold text-textPrimary">{Math.round(voiceStats.speakingDurationMs / 1000)}s</p>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textMuted">Words per minute</p>
                    <p className="mt-1 text-xl font-semibold text-textPrimary">{voiceStats.wordsPerMinute || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textMuted">Filler words</p>
                    <p className="mt-1 text-xl font-semibold text-textPrimary">{voiceStats.fillerWordCount || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Session summary</p>
                <h3 className="mt-1 text-lg font-semibold text-textPrimary">{statusText}</h3>
              </div>
              <Badge variant={loading ? 'warning' : 'neutral'}>{loading ? 'Working' : 'Ready'}</Badge>
            </div>
            {error && (
              <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}
            {sessionSummary ? (
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textMuted">Average score</p>
                    <p className="mt-1 text-2xl font-semibold text-textPrimary">{sessionSummary.totalScore}</p>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textMuted">Questions</p>
                    <p className="mt-1 text-2xl font-semibold text-textPrimary">{sessionSummary.questions}</p>
                  </div>
                </div>
                <ProgressBar value={sessionSummary.totalScore} color="#8B5CF6" />
                <div className="flex flex-wrap gap-2 text-xs text-textSecondary">
                  <span>{sessionSummary.answered} answered</span>
                  <span>{sessionSummary.favorites} saved for revision</span>
                  <span>{aiSettings.activeProvider.toUpperCase()} / {aiSettings.activeModel}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4 text-sm text-textSecondary">
                {formatInterviewContextForPrompt(interviewContext)}
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Session review</p>
                <h3 className="mt-1 text-lg font-semibold text-textPrimary">Scoring and follow-ups</h3>
              </div>
              <Badge variant="primary">{scores.length} scored</Badge>
            </div>

            <div className="flex flex-col gap-3">
              {scores.length === 0 ? (
                <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4 text-sm text-textSecondary">
                  No scored answers yet. Submit an answer to see the rubric and follow-ups.
                </div>
              ) : (
                scores.map((scoreItem) => (
                  <div key={scoreItem.questionId} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-textPrimary">{scoreItem.question}</p>
                        <p className="mt-1 text-xs text-textSecondary">{scoreItem.answerSummary}</p>
                      </div>
                      <Badge variant={scoreItem.overallScore >= 75 ? 'success' : scoreItem.overallScore >= 55 ? 'warning' : 'danger'}>
                        {scoreItem.overallScore}/100
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {scoreItem.categoryScores.map((category) => (
                        <div key={category.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-textSecondary">{category.label}</span>
                            <span className="font-semibold text-textPrimary">{category.score}</span>
                          </div>
                          <ProgressBar value={category.score} color="#60A5FA" />
                          <p className="text-[11px] text-textMuted">{category.note}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {scoreItem.strengths.slice(0, 2).map((strength) => (
                        <Badge key={strength} variant="success">{strength}</Badge>
                      ))}
                      {scoreItem.improvements.slice(0, 2).map((improvement) => (
                        <Badge key={improvement} variant="warning">{improvement}</Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Final review</p>
                <h3 className="mt-1 text-lg font-semibold text-textPrimary">Session close-out</h3>
              </div>
              <Badge variant={finalReview ? 'success' : 'neutral'}>{finalReview ? `${finalReview.overallScore}/100` : 'Pending'}</Badge>
            </div>

            {finalReview ? (
              <div className="grid gap-3">
                <p className="text-sm leading-6 text-textSecondary">{finalReview.summary}</p>
                <div className="grid gap-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-textMuted">Strengths</p>
                    <div className="flex flex-wrap gap-2">
                      {finalReview.strengths.map((item) => <Badge key={item} variant="success">{item}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-textMuted">Gaps</p>
                    <div className="flex flex-wrap gap-2">
                      {finalReview.gaps.map((item) => <Badge key={item} variant="warning">{item}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-textMuted">Next actions</p>
                    <ul className="grid gap-2 text-sm text-textSecondary">
                      {finalReview.actionPlan.map((item) => (
                        <li key={item} className="rounded-xl border border-border-subtle bg-white/[0.03] p-3">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">Next mode: {finalReview.recommendedNextMode}</Badge>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4 text-sm text-textSecondary">
                Finish one or more answers, then press Final Review to get a clean wrap-up.
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Revision queue</p>
                <h3 className="mt-1 text-lg font-semibold text-textPrimary">Saved questions</h3>
              </div>
              <Badge variant="neutral">{favoriteQuestions.length}</Badge>
            </div>
            {favoriteQuestions.length ? (
              <div className="grid gap-2">
                {favoriteQuestions.map((question) => (
                  <div key={question} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3 text-sm text-textSecondary">
                    {question}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4 text-sm text-textSecondary">
                Save questions here when you want to revisit them later.
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">History</p>
                <h3 className="mt-1 text-lg font-semibold text-textPrimary">All answers in this session</h3>
              </div>
              <Badge variant="neutral">{sessionHistory.length}</Badge>
            </div>
            {sessionHistory.length ? (
              <div className="grid gap-3">
                {sessionHistory.map((item) => (
                  <div key={item.answer.questionId} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
                    <p className="text-sm font-semibold text-textPrimary">{item.answer.question}</p>
                    <p className="mt-1 text-xs text-textSecondary">{item.answer.answer}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-textMuted">{new Date(item.answer.answeredAt).toLocaleTimeString()}</span>
                      {item.score ? <Badge variant={item.score.overallScore >= 70 ? 'success' : 'warning'}>{item.score.overallScore}/100</Badge> : <Badge variant="neutral">Pending</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4 text-sm text-textSecondary">
                Answer a question to build session history.
              </div>
            )}
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};
