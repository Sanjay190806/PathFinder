import { RankDetail, XPEvent } from '../types/progression';

const STORAGE_KEY = 'sanzz_os_xp_events_v1';

export const RANK_TIERS: RankDetail[] = [
  { tier: 'Rookie', levelMin: 1, xpNeeded: 0, colorClass: 'text-slate-400 border-slate-500/20 bg-slate-500/5', badgeGlow: 'none', description: 'Beginning SWE & Analyst preparation.' },
  { tier: 'Trainee', levelMin: 2, xpNeeded: 500, colorClass: 'text-slate-300 border-slate-400/20 bg-slate-400/5', badgeGlow: 'none', description: 'Gaining comfort with standard queries and scripts.' },
  { tier: 'Consistent', levelMin: 4, xpNeeded: 1500, colorClass: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', badgeGlow: 'shadow-glow-emerald', description: 'Maintains planner streak consistency.' },
  { tier: 'Builder', levelMin: 6, xpNeeded: 3000, colorClass: 'text-blue-400 border-blue-500/20 bg-blue-500/5', badgeGlow: 'shadow-glow-blue', description: 'Active project code releases.' },
  { tier: 'Analyst', levelMin: 9, xpNeeded: 5000, colorClass: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5', badgeGlow: 'shadow-glow-cyan', description: 'Comfortable with SQL joins and analytics charts.' },
  { tier: 'Strategist', levelMin: 12, xpNeeded: 7500, colorClass: 'text-purple-400 border-purple-500/20 bg-purple-500/5', badgeGlow: 'shadow-glow-purple', description: 'Solves complex algorithm challenges.' },
  { tier: 'Operator', levelMin: 15, xpNeeded: 10000, colorClass: 'text-pink-400 border-pink-500/20 bg-pink-500/5', badgeGlow: 'shadow-glow-pink', description: 'Technical resume ready with STAR bullets.' },
  { tier: 'Elite', levelMin: 18, xpNeeded: 13000, colorClass: 'text-rose-400 border-rose-500/20 bg-rose-500/5', badgeGlow: 'shadow-glow-rose', description: 'Strong mock interview score results.' },
  { tier: 'Placement Ready', levelMin: 22, xpNeeded: 17000, colorClass: 'text-amber-400 border-amber-500/30 bg-amber-950/10 font-bold', badgeGlow: 'shadow-glow-gold', description: 'Ready to clear major corporate criteria.' },
  { tier: 'Offer Ready', levelMin: 26, xpNeeded: 22000, colorClass: 'text-amber-400 border-amber-500/30 bg-amber-950/10 font-black animate-pulse-glow', badgeGlow: 'shadow-glow-gold', description: 'Prime SWE / Analyst target applicant.' }
];

export const progressionService = {
  getRankForLevel(level: number): RankDetail {
    let active = RANK_TIERS[0];
    for (const r of RANK_TIERS) {
      if (level >= r.levelMin) {
        active = r;
      }
    }
    return active;
  },

  getXPEvents(): XPEvent[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as XPEvent[];
    } catch (e) {
      console.warn('Failed parsing XP event log:', e);
    }
    return [];
  },

  logXPEvent(source: string, amount: number): void {
    try {
      const current = this.getXPEvents();
      const newEvent: XPEvent = {
        id: `xp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        source,
        amount,
        timestamp: new Date().toISOString()
      };
      
      const nextList = [newEvent, ...current].slice(0, 50); // limit to 50 items
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      
      // Dispatch a custom event so progression widgets update reactively
      window.dispatchEvent(new CustomEvent('xp_logged', { detail: newEvent }));
    } catch (e) {
      console.error('Failed logging XP event:', e);
    }
  }
};
export default progressionService;
