export type RankTier =
  | 'Rookie'
  | 'Trainee'
  | 'Consistent'
  | 'Builder'
  | 'Analyst'
  | 'Strategist'
  | 'Operator'
  | 'Elite'
  | 'Placement Ready'
  | 'Offer Ready';

export interface RankDetail {
  tier: RankTier;
  levelMin: number;
  xpNeeded: number;
  colorClass: string;
  badgeGlow: string;
  description: string;
}

export interface XPEvent {
  id: string;
  source: string; // e.g. LeetCode Solve, German speaking
  amount: number;
  timestamp: string;
}
