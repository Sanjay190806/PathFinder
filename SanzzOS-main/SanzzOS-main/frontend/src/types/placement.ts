export interface CompanyTarget {
  id: string;
  name: string;
  category: string;
  targetRoles: string;
  whatTheyTest: string;
  prepDirection: string;
  readinessScore: number;
  priority: 'High' | 'Medium' | 'Low';
  notes: string;
  status: 'Target' | 'Applied' | 'Interviewing' | 'Rejected' | 'Offer';
}

export interface SkillNode {
  id: string;
  title: string;
  group: 'Java DSA' | 'SkillRack / Zoho Logic' | 'Aptitude' | 'SQL + DBMS' | 'CS Fundamentals' | 'Career System';
  goal: string;
  why: string;
  whatToDo: string[];
  practiceTarget: string;
  miniBoss: string;
  status: 'locked' | 'unlocked' | 'learning' | 'completed' | 'interview-ready';
}

export interface WeeklyReview {
  weekKey: string; // YYYY-WW
  wins: string;
  problems: string;
  recoveryPlan: string;
  nextWeekMission: string;
  weakDsaPatterns: string;
  weakAptitudeTopics: string;
  weakCsCoreTopics: string;
  resumeProjectProgress: string;
  germanProgress: string;
  moodEnergySummary: string;
  
  // Weekly Metrics actual vs target
  metrics: {
    skillrackActual: number;
    skillrackTarget: number;
    leetcodeActual: number;
    leetcodeTarget: number;
    aptitudeActual: number;
    aptitudeTarget: number;
    sqlActual: number;
    sqlTarget: number;
    cscoreActual: number;
    cscoreTarget: number;
    mocksActual: number;
    mocksTarget: number;
    perfectDays: number;
    freezesUsed: number;
    studyMinutes: number;
  };
  savedAt: string;
}

export type ApplicationStatus =
  | 'not_started'
  | 'preparing'
  | 'applied'
  | 'oa_scheduled'
  | 'oa_completed'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'selected'
  | 'rejected'
  | 'on_hold';

export interface PlacementCompany {
  id: string;
  name: string;
  type: string;
  targetRole: string;
  packageRange: string;
  eligibility: string;
  hiringProcess: string;
  rounds: string[];
  skillsRequired: string[];
  dsaFocus: string;
  sqlFocus: string;
  aptitudeFocus: string;
  csCoreFocus: string;
  resumeTips: string;
  notes: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PlacementApplication {
  id: string;
  companyId: string;
  status: ApplicationStatus;
  updatedAt: string;
  nextAction: string;
  deadline?: string;
  oaDate?: string;
  interviewDate?: string;
  followUpDate?: string;
  resumeVersion?: string;
  notes?: string;
}

export interface PlacementRound {
  id: string;
  companyId: string;
  roundName: string;
  roundType: string;
  date: string;
  topics: string[];
  result: 'scheduled' | 'cleared' | 'rejected' | 'pending';
  feedback: string;
  mistakes: string;
  nextAction: string;
}

export interface OARecord {
  id: string;
  companyId: string;
  date: string;
  platform: string;
  sections: string[];
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  mistakes: string;
  improvementPlan: string;
}

export interface PlacementOSReadiness {
  score: number;
  resumeScore: number;
  companyPrepScore: number;
  interviewScore: number;
  oaScore: number;
  dsaReadiness: number;
  csCoreReadiness: number;
  aptitudeReadiness: number;
  projectReadiness: number;
  communicationReadiness: number;
  applicationMomentum: number;
  nextAction: string;
}
