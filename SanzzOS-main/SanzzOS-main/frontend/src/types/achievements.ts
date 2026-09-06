export type AchievementCategory =
  | 'daily'
  | 'dsa'
  | 'skillrack'
  | 'sql'
  | 'aptitude'
  | 'learning'
  | 'german'
  | 'projects'
  | 'resume'
  | 'placement'
  | 'interview'
  | 'comeback'
  | 'ai_planner';

export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type AchievementStatus = 'locked' | 'in_progress' | 'unlocked' | 'claimed';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  progressCurrent: number;
  progressTarget: number;
  xpReward: number;
  unlockedAt?: string;
  claimedAt?: string;
  hidden?: boolean;
  nextHint?: string;
}

export interface AchievementState {
  unlockedIds: string[];
  claimedIds: string[];
  progress: Record<string, number>;
}

export interface XPThreshold {
  level: number;
  name: string;
  minXp: number;
  color: string;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  check: (s: any) => boolean;
}
