export type SkillCategory =
  | 'Java DSA'
  | 'SQL'
  | 'Aptitude'
  | 'Python'
  | 'Power BI / Excel'
  | 'Communication'
  | 'Projects'
  | 'Resume'
  | 'Interview';

export interface UserCareerProfile {
  name: string;
  degree: string;
  year: string;
  batch: string;
  currentDirection: string[];
  corePlacementSkills: SkillCategory[];
  projects: string[];
  targetCompanies: string[];
  updatedAt: string;
}

export interface SkillProgress {
  id: string;
  name: SkillCategory;
  score: number;
  evidence: string;
  trend: 'up' | 'flat' | 'down';
}

export interface ProjectProgress {
  id: string;
  name: string;
  score: number;
  status: string;
  nextAction: string;
}

export interface PlacementGoal {
  id: string;
  label: string;
  readiness: number;
  priority: 'high' | 'medium' | 'low';
}

export interface DailyPerformanceSnapshot {
  date: string;
  focusMinutes: number;
  tasksCompleted: number;
  xpEarned: number;
  mood: number;
  energy: number;
}

export interface WeeklyInsight {
  consistencyScore: number;
  activeDays: number;
  totalFocusMinutes: number;
  message: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
  category: SkillCategory | 'Placement' | 'Recovery';
}

export interface CareerRiskFlag {
  id: string;
  title: string;
  detail: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AIBrainSummary {
  profile: UserCareerProfile;
  strongestSkills: SkillProgress[];
  weakestSkills: SkillProgress[];
  currentStreak: number;
  weeklyConsistency: WeeklyInsight;
  placementReadinessScore: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  projectPortfolioStrength: number;
  resumeReadiness: number;
  interviewReadiness: number;
  recommendedNextAction: string;
  recommendations: AIRecommendation[];
  riskFlags: CareerRiskFlag[];
  projects: ProjectProgress[];
  placementGoals: PlacementGoal[];
  snapshot: DailyPerformanceSnapshot;
  generatedAt: string;
}
