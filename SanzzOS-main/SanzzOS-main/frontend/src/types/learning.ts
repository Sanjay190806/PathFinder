export type LearningCategory =
  | 'coding'
  | 'data'
  | 'analytics'
  | 'product'
  | 'communication'
  | 'aptitude'
  | 'language'
  | 'interview'
  | 'cs_core'
  | 'ai_ml';

export type LearningStatus = 'not_started' | 'active' | 'paused' | 'revision' | 'completed';
export type LearningLevel = 'beginner' | 'foundation' | 'intermediate' | 'advanced' | 'placement_ready';
export type LearningPriority = 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface LearningTopic {
  id: string;
  title: string;
  masteryPercentage: number;
  confidence: ConfidenceLevel;
  lastPracticedAt: string | null;
}

export interface LearningMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueHint: string;
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'course' | 'docs' | 'practice' | 'video' | 'project' | 'notes';
  url?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  category: LearningCategory;
  description: string;
  targetRoleRelevance: string;
  currentLevel: LearningLevel;
  targetLevel: LearningLevel;
  masteryPercentage: number;
  totalHoursSpent: number;
  weeklyHours: number;
  streak: number;
  xp: number;
  status: LearningStatus;
  priority: LearningPriority;
  lastStudiedAt: string | null;
  nextReviewAt: string | null;
  topics: LearningTopic[];
  milestones: LearningMilestone[];
  resources: LearningResource[];
  notes: string;
  weakAreas: string[];
  strongAreas: string[];
}

export interface LearningSession {
  id: string;
  pathId: string;
  topic: string;
  minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  confidence: ConfidenceLevel;
  notes: string;
  completed: boolean;
  mistakes: string;
  nextAction: string;
  createdAt: string;
}

export interface RevisionItem {
  id: string;
  learningPathId: string;
  topic: string;
  reason: string;
  difficulty: 'easy' | 'medium' | 'hard';
  confidence: ConfidenceLevel;
  dueDate: string;
  status: 'due' | 'upcoming' | 'completed' | 'skipped';
  attempts: number;
  lastReviewedAt: string | null;
}

export interface SkillMasterySnapshot {
  pathId: string;
  title: string;
  category: LearningCategory;
  masteryPercentage: number;
  weeklyHours: number;
  priority: LearningPriority;
}

export interface LearningRecommendation {
  id: string;
  title: string;
  detail: string;
  pathId: string;
  priority: LearningPriority;
}

export interface LearningOSState {
  paths: LearningPath[];
  sessions: LearningSession[];
  revisionItems: RevisionItem[];
  recommendations: LearningRecommendation[];
  updatedAt: string;
}
