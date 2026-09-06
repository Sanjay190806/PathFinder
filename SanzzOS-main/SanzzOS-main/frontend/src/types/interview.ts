export type InterviewMode =
  | 'HR'
  | 'Technical'
  | 'Behavioral'
  | 'Product/Analyst'
  | 'German'
  | 'Company-Specific'
  | 'Resume-Based'
  | 'Rapid Fire';

export type InterviewDifficulty = 'easy' | 'medium' | 'hard';

export interface InterviewCategoryScore {
  label: string;
  score: number;
  note: string;
}

export interface InterviewVoiceStats {
  speakingDurationMs: number;
  wordCount: number;
  wordsPerMinute: number;
  fillerWordCount: number;
  confidenceRating: number;
  transcriptPreview: string;
}

export interface InterviewSessionQuestion {
  id?: string;
  question: string;
  followUpHint?: string;
  focusAreas?: string[];
  scoringRubric?: string[];
}

export interface InterviewSessionAnswer {
  questionId: string;
  question: string;
  answer: string;
  askedAt: string;
  answeredAt: string;
}

export interface InterviewSessionScore {
  questionId: string;
  question: string;
  overallScore: number;
  categoryScores: InterviewCategoryScore[];
  strengths: string[];
  improvements: string[];
  followUpQuestions: string[];
  answerSummary: string;
  createdAt: string;
}

export interface InterviewFinalReview {
  overallScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  actionPlan: string[];
  recommendedNextMode: InterviewMode;
  providerUsed?: string;
  modelUsed?: string;
}

export interface InterviewSession {
  id: string;
  mode: InterviewMode;
  difficulty: InterviewDifficulty;
  durationMinutes: number;
  companyName: string;
  roleTitle: string;
  language: 'en' | 'de';
  status: 'draft' | 'active' | 'completed';
  questions: InterviewSessionQuestion[];
  answers: InterviewSessionAnswer[];
  scores: InterviewSessionScore[];
  favoriteQuestions: string[];
  createdAt: string;
  updatedAt: string;
  endedAt?: string | null;
  providerUsed?: string;
  modelUsed?: string;
  finalReview?: InterviewFinalReview | null;
}

export interface InterviewCoachContext {
  targetRole: string;
  companyName: string;
  selectedResumeVersion: string;
  resumeSummary: string;
  projectSummary: string;
  dsaSummary: string;
  csCoreSummary: string;
  germanSummary: string;
  placementSummary: string;
  sessionNotes: string;
}

export interface InterviewStartRequest {
  mode: InterviewMode;
  difficulty: InterviewDifficulty;
  durationMinutes: number;
  companyName: string;
  roleTitle: string;
  language: 'en' | 'de';
  questionCount: number;
  context: InterviewCoachContext;
  resumeState?: Record<string, unknown>;
}

export interface InterviewFollowUpRequest {
  mode: InterviewMode;
  difficulty: InterviewDifficulty;
  companyName: string;
  roleTitle: string;
  language: 'en' | 'de';
  question: string;
  answer: string;
  context: InterviewCoachContext;
  history: Array<{ question: string; answer?: string; score?: number }>;
}

export interface InterviewScoreRequest extends InterviewFollowUpRequest {
  voiceStats?: Partial<InterviewVoiceStats>;
}

export interface InterviewFinalReviewRequest {
  mode: InterviewMode;
  difficulty: InterviewDifficulty;
  companyName: string;
  roleTitle: string;
  language: 'en' | 'de';
  context: InterviewCoachContext;
  history: Array<{ question: string; answer?: string; score?: number }>;
  scores: Array<{ question: string; score: number }>;
  voiceStats?: Partial<InterviewVoiceStats>;
}
