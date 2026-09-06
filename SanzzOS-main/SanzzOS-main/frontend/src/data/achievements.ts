import { XPThreshold, Badge } from '../types/achievements';
import { calcPlacementScore, calcResumeScore, getStreak, getTotalLCSolved, getActivityTotal } from '../utils/xpUtils';

export const LEVELS: readonly XPThreshold[] = [
  {level:1, name:'Beginner', minXp:0, color:'#64748B'},
  {level:2, name:'Apprentice', minXp:500, color:'#3B82F6'},
  {level:3, name:'Coder', minXp:1500, color:'#8B5CF6'},
  {level:4, name:'Builder', minXp:3500, color:'#10B981'},
  {level:5, name:'Solver', minXp:7000, color:'#F97316'},
  {level:6, name:'Competitor', minXp:12000, color:'#EC4899'},
  {level:7, name:'Expert', minXp:20000, color:'#06B6D4'},
  {level:8, name:'Elite', minXp:30000, color:'#EAB308'},
  {level:9, name:'Warrior', minXp:45000, color:'#E11D48'},
  {level:10, name:'Offer Ready', minXp:65000, color:'#DC2626'}
];

export const BADGES: readonly Badge[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    emoji: '🩸',
    desc: 'Complete your first day',
    check: (s) => Object.values(s.dailyLogs || {}).some((l: any) => l.status === 'completed')
  },
  {
    id: 'fire_7',
    name: '7-Day Fire',
    emoji: '🔥',
    desc: '7-day consistency streak',
    check: (s) => getStreak(s) >= 7
  },
  {
    id: 'beast_30',
    name: '30-Day Beast',
    emoji: '🦁',
    desc: '30-day consistency streak',
    check: (s) => getStreak(s) >= 30
  },
  {
    id: 'lc_100',
    name: '100 LC Club',
    emoji: '💯',
    desc: 'Solve 100 LeetCode problems',
    check: (s) => getTotalLCSolved(s) >= 100
  },
  {
    id: 'sql_starter',
    name: 'SQL Starter',
    emoji: '🗄️',
    desc: 'Log 50 SQL query practices',
    check: (s) => getActivityTotal(s, 'sql') >= 50
  },
  {
    id: 'apt_machine',
    name: 'Aptitude Machine',
    emoji: '🧮',
    desc: 'Solve 1000 aptitude questions',
    check: (s) => getActivityTotal(s, 'aptitude') >= 1000
  },
  {
    id: 'bs_unlocked',
    name: 'Binary Search Unlocked',
    emoji: '🔍',
    desc: 'Complete Binary Search week',
    check: (s) => Object.keys(s.dailyLogs || {}).some(d => parseInt(d) >= 81 && parseInt(d) <= 89 && s.dailyLogs?.[d]?.status === 'completed')
  },
  {
    id: 'graph_warrior',
    name: 'Graph Warrior',
    emoji: '🕸️',
    desc: 'Complete Graphs week',
    check: (s) => Object.keys(s.dailyLogs || {}).some(d => parseInt(d) >= 110 && parseInt(d) <= 120 && s.dailyLogs?.[d]?.status === 'completed')
  },
  {
    id: 'dp_survivor',
    name: 'DP Survivor',
    emoji: '🧩',
    desc: 'Complete DP week',
    check: (s) => Object.keys(s.dailyLogs || {}).some(d => parseInt(d) >= 128 && parseInt(d) <= 142 && s.dailyLogs?.[d]?.status === 'completed')
  },
  {
    id: 'resume_ready',
    name: 'Resume Ready',
    emoji: '📄',
    desc: 'Resume readiness > 80%',
    check: (s) => calcResumeScore(s) >= 80
  },
  {
    id: 'project_builder',
    name: 'Project Builder',
    emoji: '🚀',
    desc: 'Log 300 minutes on project sessions',
    check: (s) => getActivityTotal(s, 'project') >= 300
  },
  {
    id: 'interview_ready',
    name: 'Interview Ready',
    emoji: '🎯',
    desc: 'Placement readiness score > 75%',
    check: (s) => calcPlacementScore(s) >= 75
  },
  {
    id: 'diamond_coder',
    name: 'Diamond Coder',
    emoji: '💎',
    desc: 'Reach Level 8',
    check: (s) => (s.level || 1) >= 8
  }
];
