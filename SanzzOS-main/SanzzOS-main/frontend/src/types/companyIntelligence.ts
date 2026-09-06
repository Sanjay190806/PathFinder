export type CompanyCategory =
  | 'Product-based'
  | 'Service-based'
  | 'Analytics'
  | 'Consulting'
  | 'AI/Data'
  | 'Startup';

export interface CompanyRound {
  name: string;
  focus: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CompanyPrepPlan {
  companyName: string;
  durationDays: number;
  startDate: string;
  dailyTasks: {
    dayNum: number;
    codingTask: string;
    aptitudeTask: string;
    sqlTask: string;
    theoryTask: string;
    completed: boolean;
  }[];
}

export interface CompanyProfile {
  id: string;
  name: string;
  category: CompanyCategory;
  targetRoles: string[];
  preparationPriority: 'high' | 'medium' | 'low';
  generalHiringFocus: string;
  rounds: CompanyRound[];
  oaFocus: string[];
  interviewFocus: string[];
  skillsToPrepare: string[];
  resumeEmphasis: string;
  projectEmphasis: string;
  readinessScore: number; // 0-100
  notes?: string;
  lastUpdated: string;
}

export interface OAAttempt {
  id: string;
  companyName: string;
  date: string;
  platform: 'HackerRank' | 'CodeChef' | 'LeetCode' | 'Mettl' | 'Custom';
  sections: string[];
  qCount: number;
  solvedCount: number;
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  mistakeLog?: string;
  result: 'passed' | 'failed' | 'pending';
}

export interface PlacementStrategy {
  priorityCompanies: string[];
  readySoon: string[];
  longTermTargets: string[];
  activePipelines: Record<string, 'applied' | 'oa_pending' | 'interview_upcoming' | 'offered' | 'rejected'>;
}
