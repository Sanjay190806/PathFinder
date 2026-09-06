export interface PlacementReadiness {
  readonly dsaScore: number;
  readonly sqlScore: number;
  readonly aptitudeScore: number;
  readonly cscoreScore: number;
  readonly projectsScore: number;
  readonly resumeScore: number;
  readonly consistencyScore: number;
  readonly overallScore: number;
}

export interface StudyVelocity {
  readonly avgProblemsPerDay: number;
  readonly totalProblemsLastWeek: number;
  readonly focusMinutesAvg: number;
}

export interface BurnoutAssessment {
  readonly riskLevel: 'Low' | 'Moderate' | 'High';
  readonly energyTrend: number;
  readonly distractionRating: number;
}

export type AnalyticsTimeRange = '7d' | '30d' | '90d' | 'all';

export interface AnalyticsSnapshot {
  totalStudyHours: number;
  weeklyStudyHours: number;
  monthlyStudyHours: number;
  xpTotal: number;
  completionRate: number;
  learningConsistencyScore: number;
  placementReadinessScore: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  revisionBacklog: number;
  learningEfficiencyScore: number;
  focusBalanceScore: number;
}

export interface WeeklyAnalytics {
  weekLabel: string;
  studyHours: number;
  xp: number;
  completedTasks: number;
}

export interface MonthlyAnalytics {
  monthLabel: string;
  studyHours: number;
  sessions: number;
}

export interface SkillAnalytics {
  skillId: string;
  title: string;
  hours: number;
  mastery: number;
  weakAreas: number;
}

export interface CategoryAnalytics {
  category: string;
  hours: number;
  mastery: number;
}

export interface ProductivityTrend {
  label: string;
  completionRate: number;
  xp: number;
}

export interface ReadinessTrend {
  label: string;
  readiness: number;
}

export interface BurnoutTrend {
  label: string;
  riskScore: number;
}

export interface AnalyticsInsight {
  id: string;
  title: string;
  detail: string;
  severity: 'info' | 'warning' | 'success';
}

export interface AnalyticsDashboard {
  snapshot: AnalyticsSnapshot;
  weekly: WeeklyAnalytics[];
  monthly: MonthlyAnalytics[];
  skills: SkillAnalytics[];
  categories: CategoryAnalytics[];
  productivityTrend: ProductivityTrend[];
  readinessTrend: ReadinessTrend[];
  burnoutTrend: BurnoutTrend[];
  insights: AnalyticsInsight[];
}
