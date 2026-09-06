export interface MentorProfile {
  coachingTone: 'encouraging' | 'strict' | 'pragmatic';
  alertSensitivity: 'high' | 'normal' | 'low';
  nudgeFrequency: 'daily' | 'weekly' | 'never';
  weeklyReviewDay: number; // 0-6 (Sunday-Saturday)
  monthlyReviewDay: number; // 1-28
}

export interface MentorInsight {
  id: string;
  category: 'DSA' | 'SQL' | 'Aptitude' | 'Resume' | 'German' | 'Project' | 'Consistency';
  title: string;
  description: string;
  ratingScore: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
}

export interface MentorRiskFlag {
  id: string;
  title: string;
  reason: string;
  evidence: string;
  severity: 'critical' | 'moderate' | 'low';
  recommendation: string;
  linkedRoute: string;
  minutesToFix: number;
}

export interface MentorMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  deadline: string;
}

export interface MentorReview {
  id: string;
  type: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  xpGained: number;
  tasksCompleted: number;
  blockersDetected: string[];
  recommendation: string;
  savedAt: string;
}

export type TriggerType =
  | 'daily_time'
  | 'weekly_time'
  | 'progress_missing'
  | 'task_overdue'
  | 'revision_due'
  | 'streak_at_risk'
  | 'portfolio_gap'
  | 'backup_due'
  | 'resume_gap';

export type ActionType =
  | 'create_notification'
  | 'create_calendar_event'
  | 'create_smart_planner_task'
  | 'suggest_backup'
  | 'suggest_resume_task'
  | 'suggest_project_task';

export interface MentorAutomationRule {
  id: string;
  name: string;
  triggerType: TriggerType;
  condition: string;
  actionType: ActionType;
  enabled: boolean;
  requiresConfirmation: boolean;
  lastRunAt?: string;
  cooldownMinutes: number;
}

export interface MentorAutomationRun {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: string;
  status: 'triggered' | 'completed' | 'ignored';
  details: string;
}
