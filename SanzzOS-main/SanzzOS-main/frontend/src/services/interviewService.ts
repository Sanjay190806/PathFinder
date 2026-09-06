import { request } from './apiClient';
import { useAISettingsStore } from '../app/store/useAISettingsStore';
import {
  InterviewCoachContext,
  InterviewDifficulty,
  InterviewFinalReview,
  InterviewFinalReviewRequest,
  InterviewFollowUpRequest,
  InterviewMode,
  InterviewScoreRequest,
  InterviewSessionQuestion,
  InterviewStartRequest,
  InterviewVoiceStats,
} from '../types/interview';
import {
  buildLocalInterviewFinalReview,
  buildLocalInterviewFollowUp,
  buildLocalInterviewScore,
  buildLocalInterviewStarter,
  buildInterviewSessionId,
} from '../utils/interviewCoachUtils';

type AISettings = { provider?: string; model?: string };

export interface InterviewStartResponse extends InterviewSessionQuestion {
  sessionId: string;
  mode: InterviewMode;
  difficulty: InterviewDifficulty;
  companyName: string;
  roleTitle: string;
  providerUsed?: string;
  modelUsed?: string;
}

export interface InterviewFollowUpResponse extends InterviewSessionQuestion {
  providerUsed?: string;
  modelUsed?: string;
}

export interface InterviewScoreResponse {
  overallScore: number;
  categoryScores: Array<{ label: string; score: number; note: string }>;
  strengths: string[];
  improvements: string[];
  followUpQuestions: string[];
  answerSummary: string;
  providerUsed?: string;
  modelUsed?: string;
}

const getAISettings = (): AISettings => {
  const settings = useAISettingsStore.getState();
  return {
    provider: settings.activeProvider,
    model: settings.activeModel,
  };
};

export async function startInterviewSession(requestBody: Omit<InterviewStartRequest, 'context'> & { context: InterviewCoachContext }): Promise<InterviewStartResponse> {
  const aiSettings = getAISettings();
  try {
    const response = await request<InterviewStartResponse>('/interview/start', {
      method: 'POST',
      body: {
        ...requestBody,
        aiSettings,
      },
    });
    return response;
  } catch {
    const id = buildInterviewSessionId();
    const fallback = buildLocalInterviewStarter(
      requestBody.mode,
      requestBody.difficulty,
      requestBody.companyName,
      requestBody.roleTitle,
      requestBody.context
    );
    return {
      sessionId: id,
      id,
      mode: requestBody.mode,
      difficulty: requestBody.difficulty,
      companyName: requestBody.companyName,
      roleTitle: requestBody.roleTitle,
      ...fallback,
      providerUsed: 'local',
      modelUsed: 'rule-based',
    };
  }
}

export async function fetchNextInterviewQuestion(requestBody: InterviewFollowUpRequest): Promise<InterviewFollowUpResponse> {
  const aiSettings = getAISettings();
  try {
    const response = await request<InterviewFollowUpResponse>('/interview/next-question', {
      method: 'POST',
      body: {
        ...requestBody,
        aiSettings,
      },
    });
    return response;
  } catch {
    const fallback = buildLocalInterviewFollowUp(
      requestBody.mode,
      requestBody.difficulty,
      requestBody.question,
      requestBody.answer,
      requestBody.context
    );
    return {
      ...fallback,
      providerUsed: 'local',
      modelUsed: 'rule-based',
    };
  }
}

export async function scoreInterviewAnswer(requestBody: InterviewScoreRequest): Promise<InterviewScoreResponse> {
  const aiSettings = getAISettings();
  try {
    const response = await request<InterviewScoreResponse>('/interview/score-answer', {
      method: 'POST',
      body: {
        ...requestBody,
        aiSettings,
      },
    });
    return response;
  } catch {
    const fallback = buildLocalInterviewScore(
      requestBody.mode,
      requestBody.difficulty,
      requestBody.question,
      requestBody.answer,
      requestBody.context,
      requestBody.voiceStats as InterviewVoiceStats | undefined
    );
    return {
      ...fallback,
      providerUsed: 'local',
      modelUsed: 'rule-based',
    };
  }
}

export async function finalReviewInterviewSession(requestBody: InterviewFinalReviewRequest): Promise<InterviewFinalReview> {
  const aiSettings = getAISettings();
  try {
    const response = await request<InterviewFinalReview>('/interview/final-review', {
      method: 'POST',
      body: {
        ...requestBody,
        aiSettings,
      },
    });
    return response;
  } catch {
    const fallback = buildLocalInterviewFinalReview(
      requestBody.mode,
      requestBody.difficulty,
      requestBody.history,
      requestBody.scores,
      requestBody.context,
      requestBody.voiceStats
    );
    return {
      ...fallback,
      providerUsed: 'local',
      modelUsed: 'rule-based',
    };
  }
}
