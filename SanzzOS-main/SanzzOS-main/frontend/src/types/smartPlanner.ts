export type SmartTaskCategory =
  | 'coding'
  | 'sql'
  | 'aptitude'
  | 'project'
  | 'resume'
  | 'interview'
  | 'communication'
  | 'revision'
  | 'product'
  | 'ai'
  | 'german'
  | 'rest';

export type PlannerMode =
  | 'normal'
  | 'busy'
  | 'low_energy'
  | 'placement_sprint'
  | 'project_build'
  | 'revision';

export type SmartTaskStatus = 'todo' | 'in_progress' | 'completed';

export interface SmartTask {
  id: string;
  title: string;
  category: SmartTaskCategory;
  description: string;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'high' | 'medium' | 'low';
  reason: string;
  successCriteria: string;
  xpReward: number;
  status: SmartTaskStatus;
}

export interface SmartPlan {
  id: string;
  date: string;
  mode: PlannerMode;
  tasks: SmartTask[];
  totalMinutes: number;
  completedTaskIds: string[];
  insight: string;
  savedAt?: string;
}
