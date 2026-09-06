export type InterviewQuestionCategory =
  | 'HR'
  | 'Behavioral'
  | 'Technical'
  | 'Java DSA'
  | 'SQL'
  | 'Project Explanation'
  | 'Resume'
  | 'Product Thinking'
  | 'Analytics'
  | 'Company-Specific'
  | 'Communication'
  | 'Self Introduction';

export type MockSessionType =
  | 'HR mock'
  | 'Technical mock'
  | 'Project explanation'
  | 'Resume walkthrough'
  | 'SQL interview'
  | 'Java DSA interview'
  | 'Product analyst interview'
  | 'Data analyst interview'
  | 'Full placement mock';

export interface InterviewQuestion {
  id: string;
  category: InterviewQuestionCategory;
  question: string;
  isCustom?: boolean;
  notes?: string;
}

export interface InterviewAnswerDraft {
  questionId: string;
  answerText: string;
  starFormat?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  projectExplanation?: {
    problem: string;
    users: string;
    solution: string;
    techStack: string;
    aiDataPart: string;
    myContribution: string;
    impact: string;
    whatILearned: string;
    nextImprovement: string;
  };
  versions?: {
    v30s?: string;
    v60s?: string;
    v2m?: string;
    bullets?: string[];
  };
  confidenceRating: number; // 1-5
  mistakeNotes?: string;
  improvementNotes?: string;
  practicedCount: number;
  lastPracticedAt?: string;
  isPracticed?: boolean;
}

export interface MockInterviewSession {
  id: string;
  sessionType: MockSessionType;
  targetRole: string;
  targetCompany?: string;
  durationMins: number;
  selectedCategories: InterviewQuestionCategory[];
  questionsAttempted: {
    questionId: string;
    questionText: string;
    confidenceScore: number; // 1-5
    mistakeLog?: string;
    practiced: boolean;
  }[];
  avgConfidence: number;
  weakAreas: string[];
  commonMistakes: string[];
  recommendation: string;
  createdAt: string;
}

export interface SpeakingPracticeLog {
  id: string;
  topic: string;
  clarity: number; // 0-5
  confidence: number; // 0-5
  structure: number; // 0-5
  conciseness: number; // 0-5
  technicalExplanation: number; // 0-5
  storytelling: number; // 0-5
  fillerWordAwareness: number; // 0-5
  speakingPaceNotes?: string;
  nervousnessNotes?: string;
  overallScore: number; // conversion of average metric to percentage
  createdAt: string;
}

export interface InterviewMistake {
  id: string;
  category: string;
  description: string;
  occurrenceCount: number;
  resolved: boolean;
  resolutionPlan?: string;
  createdAt: string;
}
