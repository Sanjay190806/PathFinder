import { getStreak, getTotalLCSolved, calcResumeScore, calcPlacementScore, getLevel } from './xpUtils';

export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  check: (state: any) => boolean;
}

export const BADGES: BadgeDefinition[] = [
  { id: 'first_blood', name: 'First Blood', emoji: '🩸', desc: 'Save your first study day logs', check: s => Object.keys(s.dailyLogs || {}).length > 0 },
  { id: 'fire_7', name: '7-Day Fire', emoji: '🔥', desc: 'Reach a 7-day study streak', check: s => getStreak(s) >= 7 },
  { id: 'beast_30', name: '30-Day Beast', emoji: '🦁', desc: 'Complete 30 study days logs', check: s => Object.values(s.dailyLogs || {}).filter((l: any) => l.status === 'completed').length >= 30 },
  { id: 'lc_100', name: '100 LC Club', emoji: '💯', desc: 'Solve 100 LeetCode problems', check: s => getTotalLCSolved(s) >= 100 },
  { id: 'sql_starter', name: 'SQL Starter', emoji: '🗄️', desc: 'Log your first SQL query session', check: s => Object.values(s.dailyLogs || {}).some((l: any) => (l.counts?.sql || 0) > 0) },
  { id: 'sql_builder', name: 'SQL Builder', emoji: '🛠️', desc: 'Log 100 queries in SQL logs', check: s => Object.values(s.dailyLogs || {}).reduce((sum: number, l: any) => sum + (l.counts?.sql || 0), 0) >= 100 },
  { id: 'sql_interview_ready', name: 'SQL Interview Ready', emoji: '🎓', desc: 'Complete 15+ SQL syllabus topics', check: s => Object.values(s.sqlProgress || {}).filter((t: any) => t.completed).length >= 15 },
  { id: 'apt_warrior', name: 'Aptitude Warrior', emoji: '🧮', desc: 'Solve 1000 aptitude questions', check: s => Object.values(s.dailyLogs || {}).reduce((sum: number, l: any) => sum + (l.counts?.aptitude || 0), 0) >= 1000 },
  { id: 'apt_accuracy_beast', name: 'Accuracy Beast', emoji: '🎯', desc: 'Achieve >90% accuracy on 5+ Aptitude categories', check: s => Object.values(s.aptitudeProgress || {}).filter((c: any) => (c.accuracy || 0) >= 90).length >= 5 },
  { id: 'skillrack_starter', name: 'SkillRack Starter', emoji: '⚡', desc: 'Solve your first SkillRack problem', check: s => (s.skillRackStats?.totalSolved || 0) > 0 },
  { id: 'skillrack_machine', name: 'SkillRack Machine', emoji: '🤖', desc: 'Solve 100+ SkillRack problems', check: s => (s.skillRackStats?.totalSolved || 0) >= 100 },
  { id: 'skillrack_1200_target', name: 'SkillRack Elite', emoji: '💎', desc: 'Solve 1200 SkillRack problems', check: s => (s.skillRackStats?.totalSolved || 0) >= 1200 },
  { id: 'german_starter', name: 'German Starter', emoji: '🇩🇪', desc: 'Complete your first German lesson', check: s => Object.values(s.completedLessons || {}).filter((lesson: any) => lesson.completed).length >= 1 },
  { id: 'german_7_day_streak', name: '7-Day Deutsch Streak', emoji: '🔥', desc: 'Practice German for 7 days', check: s => (s.germanStreak || 0) >= 7 },
  { id: 'german_100_words', name: '100 German Words', emoji: '📚', desc: 'Mark 100 German words as known', check: s => Object.values(s.vocabulary || {}).filter((word: any) => word.status === 'known').length >= 100 },
  { id: 'german_a1_foundation', name: 'A1 Foundation Complete', emoji: '🧱', desc: 'Finish the first 10 German lessons', check: s => Object.values(s.completedLessons || {}).filter((lesson: any) => lesson.completed).length >= 10 },
  { id: 'german_perfect_quiz', name: 'Perfect German Quiz', emoji: '🎯', desc: 'Score perfectly on a German quiz', check: s => Object.values(s.quizHistory || {}).some((quiz: any) => quiz.perfect) },
  { id: 'german_ready_basics', name: 'Germany Ready Basics', emoji: '⭐', desc: 'Combine lessons, streak, and vocab progress', check: s => (Object.values(s.completedLessons || {}).filter((lesson: any) => lesson.completed).length >= 15) && (s.germanStreak || 0) >= 7 && Object.values(s.vocabulary || {}).filter((word: any) => word.status === 'known').length >= 25 },
  { id: 'resume_ready', name: 'Resume Ready', emoji: '📄', desc: 'Resume score reaches 80% or more', check: s => calcResumeScore(s) >= 80 },
  { id: 'project_builder', name: 'Project Builder', emoji: '🚀', desc: 'One showcase project crosses 70% progress', check: s => Object.values(s.projects || {}).some((p: any) => {
      const g = p.progress || { backend: 0, frontend: 0, ai: 0, testing: 0, docs: 0, deploy: 0 };
      const avg = (g.backend + g.frontend + g.ai + g.testing + g.docs + g.deploy) / 6;
      return avg >= 70;
    })
  },
  { id: 'app_started', name: 'Application Started', emoji: '💼', desc: 'Track your first job application', check: s => (s.applications || []).length > 0 },
  { id: 'offer_ready', name: 'Offer Ready', emoji: '🏆', desc: 'Placement score crosses 80%', check: s => calcPlacementScore(s) >= 80 }
];

export function runAchievementEngine(state: any, updateState: any, triggerToast: (badge: any) => void) {
  const unlocked = { ...(state.unlockedBadges || {}) };
  let xpEarned = 0;
  let changed = false;

  for (const badge of BADGES) {
    if (!unlocked[badge.id]) {
      if (badge.check(state)) {
        unlocked[badge.id] = new Date().toISOString();
        xpEarned += 200; // Reward 200 XP per badge
        changed = true;
        triggerToast({ id: badge.id, name: badge.name, emoji: badge.emoji });
      }
    }
  }

  if (changed) {
    const nextXP = (state.xp || 0) + xpEarned;
    updateState({
      unlockedBadges: unlocked,
      xp: nextXP,
      level: getLevel(nextXP).level
    });
  }
}
