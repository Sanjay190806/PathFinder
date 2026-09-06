export interface ActivityCounts {
  leetcode: number;
  skillrack: number;
  codechefJava?: number;
  aptitude: number;
  sql: number;
  cscore: number;
  german: number;
  ml?: number;
  project: number;
  resume: number;
  mockTechnical?: number;
  mockHR?: number;
  mockCoding?: number;
  mockProject?: number;
}

export interface CustomStudyMaterial {
  id: string;
  title: string;
  category: string;
  url?: string;
  notes?: string;
  completed: boolean;
}

export interface DailyLog {
  counts: ActivityCounts;
  lcStatus: number[];
  note: string;
  mood: number;
  energy: number;
  distractions: number;
  focusMinutes: number;
  status: 'not_started' | 'in_progress' | 'partial' | 'completed' | 'missed' | 'recovery';
  savedAt: string;
  xpEarned: number;
  freezeUsed?: boolean;
  freezeReason?: string;
  completionType?: 'missed' | 'partial' | 'minimum' | 'perfect' | 'freeze';
  rescueCompleted?: boolean;
  questsClaimed?: string[];
  customMaterials?: CustomStudyMaterial[];
}

export interface ProblemLog {
  solved: boolean;
  confidence: number;
  solveTime: number;
  attempts: number;
  notes: string;
  mistakeLog: string;
  revisitFlag: boolean;
}
