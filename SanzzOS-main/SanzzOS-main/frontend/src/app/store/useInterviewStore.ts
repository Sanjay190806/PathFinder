import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  InterviewFinalReview,
  InterviewSession,
  InterviewSessionAnswer,
  InterviewSessionQuestion,
  InterviewSessionScore,
  InterviewVoiceStats,
} from '../../types/interview';
import { buildInterviewSessionId } from '../../utils/interviewCoachUtils';

interface InterviewState {
  sessions: InterviewSession[];
  activeSession: InterviewSession | null;
  answers: InterviewSessionAnswer[];
  feedback: InterviewSessionScore[];
  scores: InterviewSessionScore[];
  voiceStats: InterviewVoiceStats;
  favoriteQuestions: string[];
  activeQuestionIndex: number;
  loading: boolean;
  error: string | null;
  startSession: (session: Omit<InterviewSession, 'id' | 'createdAt' | 'updatedAt' | 'answers' | 'scores' | 'favoriteQuestions' | 'status'> & { questions: InterviewSessionQuestion[] }) => string;
  appendQuestion: (question: InterviewSessionQuestion) => void;
  answerQuestion: (payload: { questionId: string; question: string; answer: string }) => void;
  scoreAnswer: (score: InterviewSessionScore) => void;
  endSession: (review?: InterviewFinalReview | null) => void;
  saveSession: () => void;
  resetSession: () => void;
  markQuestionForRevision: (question: string) => void;
  updateVoiceStats: (patch: Partial<InterviewVoiceStats>) => void;
  setActiveQuestionIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const emptyVoiceStats: InterviewVoiceStats = {
  speakingDurationMs: 0,
  wordCount: 0,
  wordsPerMinute: 0,
  fillerWordCount: 0,
  confidenceRating: 3,
  transcriptPreview: '',
};

function upsertSessionSnapshot(session: InterviewSession, sessions: InterviewSession[]) {
  const next = sessions.filter((item) => item.id !== session.id);
  return [session, ...next].slice(0, 30);
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      sessions: [],
      activeSession: null,
      answers: [],
      feedback: [],
      scores: [],
      voiceStats: emptyVoiceStats,
      favoriteQuestions: [],
      activeQuestionIndex: 0,
      loading: false,
      error: null,
      startSession: (session) => {
        const id = buildInterviewSessionId();
        const now = new Date().toISOString();
        const nextSession: InterviewSession = {
          ...session,
          id,
          status: 'active',
          answers: [],
          scores: [],
          favoriteQuestions: [],
          createdAt: now,
          updatedAt: now,
          endedAt: null,
          finalReview: null,
        };
        set((state) => ({
          activeSession: nextSession,
          answers: [],
          feedback: [],
          scores: [],
          activeQuestionIndex: 0,
          error: null,
          sessions: upsertSessionSnapshot(nextSession, state.sessions),
        }));
        return id;
      },
      appendQuestion: (question) => set((state) => {
        if (!state.activeSession) return state;
        const nextQuestions = [...state.activeSession.questions.filter((item) => item.id !== question.id), question];
        const nextSession = {
          ...state.activeSession,
          questions: nextQuestions,
          updatedAt: new Date().toISOString(),
        };
        return {
          activeSession: nextSession,
          sessions: upsertSessionSnapshot(nextSession, state.sessions),
        };
      }),
      answerQuestion: ({ questionId, question, answer }) => set((state) => {
        const entry: InterviewSessionAnswer = {
          questionId,
          question,
          answer,
          askedAt: state.answers.find((item) => item.questionId === questionId)?.askedAt || new Date().toISOString(),
          answeredAt: new Date().toISOString(),
        };
        const nextAnswers = [...state.answers.filter((item) => item.questionId !== questionId), entry];
        const nextSession = state.activeSession
          ? { ...state.activeSession, answers: nextAnswers, updatedAt: new Date().toISOString() }
          : null;
        return {
          answers: nextAnswers,
          activeSession: nextSession,
          sessions: nextSession ? upsertSessionSnapshot(nextSession, state.sessions) : state.sessions,
        };
      }),
      scoreAnswer: (score) => set((state) => {
        const nextScores = [...state.scores.filter((item) => item.questionId !== score.questionId), score];
        const nextFeedback = [...state.feedback.filter((item) => item.questionId !== score.questionId), score];
        const nextSession = state.activeSession
          ? { ...state.activeSession, scores: nextScores, updatedAt: new Date().toISOString() }
          : null;
        return {
          scores: nextScores,
          feedback: nextFeedback,
          activeSession: nextSession,
          sessions: nextSession ? upsertSessionSnapshot(nextSession, state.sessions) : state.sessions,
        };
      }),
      endSession: (review) => set((state) => {
        if (!state.activeSession) return state;
        const endedSession: InterviewSession = {
          ...state.activeSession,
          status: 'completed',
          endedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          finalReview: review || state.activeSession.finalReview || null,
        };
        return {
          activeSession: endedSession,
          sessions: upsertSessionSnapshot(endedSession, state.sessions),
        };
      }),
      saveSession: () => set((state) => {
        if (!state.activeSession) return state;
        const savedSession: InterviewSession = {
          ...state.activeSession,
          updatedAt: new Date().toISOString(),
        };
        return {
          sessions: upsertSessionSnapshot(savedSession, state.sessions),
          activeSession: savedSession,
        };
      }),
      resetSession: () => set({
        activeSession: null,
        answers: [],
        feedback: [],
        scores: [],
        activeQuestionIndex: 0,
        loading: false,
        error: null,
        voiceStats: emptyVoiceStats,
      }),
      markQuestionForRevision: (question) => set((state) => ({
        favoriteQuestions: Array.from(new Set([question, ...state.favoriteQuestions])).slice(0, 20),
        activeSession: state.activeSession
          ? {
              ...state.activeSession,
              favoriteQuestions: Array.from(new Set([question, ...state.activeSession.favoriteQuestions])).slice(0, 20),
              updatedAt: new Date().toISOString(),
            }
          : state.activeSession,
      })),
      updateVoiceStats: (patch) => set((state) => ({
        voiceStats: { ...state.voiceStats, ...patch },
      })),
      setActiveQuestionIndex: (activeQuestionIndex) => set({ activeQuestionIndex }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'sanju-interview-coach-v1',
      partialize: (state) => ({
        sessions: state.sessions,
        favoriteQuestions: state.favoriteQuestions,
      }),
    }
  )
);
