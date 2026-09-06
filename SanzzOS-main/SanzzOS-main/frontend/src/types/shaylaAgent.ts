export type ShaylaAgentBriefingKind = 'morning' | 'evening' | 'recovery';

export interface CompactAgentLesson {
  lessonId: string;
  title: string;
  level: string;
  objective: string;
  completed: boolean;
  locked: boolean;
}

export interface CompactAgentApplication {
  company: string;
  role: string;
  status: string;
  stage?: string;
}

export interface CompactAgentProject {
  name: string;
  progress: number;
}

export interface CompactAgentContext {
  day: number;
  streak: number;
  selectedDay: number;
  currentTopic: string;
  mood?: number;
  energy?: number;
  distractions?: number;
  completedTasks: string[];
  missedTasks: string[];
  weakDsaPatterns: string[];
  csCoreDue?: {
    subject: string;
    topic: string;
  } | null;
  germanLesson?: CompactAgentLesson | null;
  germanLevel?: string;
  germanStreak?: number;
  resumeScore: number;
  placementScore: number;
  consistencyScore: number;
  skillRackSolved: number;
  sqlSolved: number;
  aptitudeSolved: number;
  projectProgress: CompactAgentProject[];
  applications: CompactAgentApplication[];
  recentLogs: Array<{
    day: number;
    status: string;
    mood?: number;
    energy?: number;
    countsSummary: string;
  }>;
  todayProblems: Array<{
    title: string;
    difficulty: string;
    pattern: string;
  }>;
  recentMissedTasks: string[];
  activeMode?: string;
}

export interface ShaylaBriefingSection {
  title: string;
  items: string[];
}

export interface ShaylaBriefingResult {
  kind: ShaylaAgentBriefingKind;
  title: string;
  summary: string;
  focus: string;
  wins: string[];
  risks: string[];
  nextActions: string[];
  sections: ShaylaBriefingSection[];
  generatedAt: string;
  providerUsed?: string;
  modelUsed?: string;
  fallbackUsed: boolean;
}

export interface ShaylaSmartNotification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  message: string;
  actionLabel?: string;
  actionPrompt?: string;
  createdAt: string;
  severity: number;
  day: number;
}

export interface ShaylaAgentSettings {
  agentModeEnabled: boolean;
  dailyBriefingEnabled: boolean;
  eveningReviewEnabled: boolean;
  smartNotificationsEnabled: boolean;
  autoGenerateBriefingOnLaunch: boolean;
  notificationSensitivity: 'low' | 'medium' | 'high';
  enableRecoverySuggestions: boolean;
  enableGermanNudges: boolean;
  enableCsCoreNudges: boolean;
  enableResumeNudges: boolean;
}

export interface ShaylaAgentHistoryItem {
  id: string;
  kind: ShaylaAgentBriefingKind;
  title: string;
  summary: string;
  generatedAt: string;
  fallbackUsed: boolean;
}
