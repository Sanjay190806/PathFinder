import { CareerState } from '../app/store/useCareerStore';
import { AIBrainSummary, AIRecommendation, CareerRiskFlag, SkillProgress, UserCareerProfile } from '../types/aiBrain';
import { getDueRevisionItems, loadLearningState } from './learningService';

export const AI_BRAIN_STORAGE_KEY = 'sanzz_os_ai_brain_v1';

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

export const defaultCareerProfile: UserCareerProfile = {
  name: 'Sanju / Sanjay',
  degree: 'B.E. ECE',
  year: '3rd year',
  batch: '2024-2028',
  currentDirection: ['AI Product', 'Product Analytics', 'Data Analyst', 'Product Analyst', 'SWE backup'],
  corePlacementSkills: ['Java DSA', 'SQL', 'Aptitude', 'Python', 'Power BI / Excel', 'Communication', 'Projects', 'Resume', 'Interview'],
  projects: [],
  targetCompanies: ['Zoho', 'HCLTech', 'Accenture', 'Wipro', 'Cognizant', 'Capgemini', 'Infosys', 'TCS', 'Fractal Analytics', 'Tiger Analytics', 'Quantiphi', 'Mu Sigma'],
  updatedAt: new Date().toISOString()
};

function average(values: number[], fallback = 0): number {
  const valid = values.filter(Number.isFinite);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : fallback;
}

function currentStreak(logs: CareerState['dailyLogs']): number {
  const days = Object.keys(logs).map(Number).filter(Number.isFinite).sort((a, b) => b - a);
  if (!days.length) return 0;
  let streak = 0;
  let expected = days[0];
  for (const day of days) {
    const log = logs[String(day)];
    const hasWork = log?.status === 'completed' || Object.values(log?.counts || {}).some((count) => count > 0) || (log?.focusMinutes || 0) > 0;
    if (day === expected && hasWork) {
      streak += 1;
      expected -= 1;
    } else if (day < expected) {
      break;
    }
  }
  return streak;
}

function scoreSkills(state: CareerState): SkillProgress[] {
  const dsaSolved = Object.values(state.dsaPatternMastery || {}).reduce((sum, item) => sum + (item.solvedCount || 0), 0);
  const dsaTotal = Object.values(state.dsaPatternMastery || {}).reduce((sum, item) => sum + (item.totalCount || 0), 0);
  const sqlScore = average(Object.values(state.sqlProgress || {}).map((item) => Math.min(100, (item.solvedCount || 0) * 10 + (item.confidence || 0) * 8)), 0);
  const aptitudeScore = average(Object.values(state.aptitudeProgress || {}).map((item) => Math.min(100, (item.questionsSolved || 0) * 2 + (item.accuracy || 0) * 0.5 + (item.confidence || 0) * 5)), 0);
  const projectScores = Object.values(state.projects || {}).map((project) => average(Object.values(project.progress || {}), 0));
  const resumeScore = average(Object.values(state.resume?.sections || {}), state.resume?.atsScore || 0);
  const communication = Math.min(92, (state.applications?.length || 0) * 4 + (state.germanSpeakingSessions || 0) * 2);
  const python = Math.min(85, projectScores.filter((score) => score >= 60).length * 10);
  const powerBi = Math.min(80, sqlScore * 0.25 + aptitudeScore * 0.15);

  return [
    { id: 'java-dsa', name: 'Java DSA', score: dsaTotal ? clamp((dsaSolved / dsaTotal) * 100) : 0, evidence: `${dsaSolved} DSA pattern problems logged`, trend: dsaSolved > 10 ? 'up' : 'flat' },
    { id: 'sql', name: 'SQL', score: clamp(sqlScore), evidence: `${Object.keys(state.sqlProgress || {}).length} SQL topics tracked`, trend: sqlScore > 55 ? 'up' : 'flat' },
    { id: 'aptitude', name: 'Aptitude', score: clamp(aptitudeScore), evidence: `${Object.keys(state.aptitudeProgress || {}).length} aptitude categories tracked`, trend: aptitudeScore > 55 ? 'up' : 'flat' },
    { id: 'python', name: 'Python', score: clamp(python), evidence: 'Python strength inferred from AI/data project portfolio', trend: 'flat' },
    { id: 'powerbi-excel', name: 'Power BI / Excel', score: clamp(powerBi), evidence: 'Analytics readiness inferred from SQL and aptitude signals', trend: 'flat' },
    { id: 'communication', name: 'Communication', score: clamp(communication), evidence: 'Communication readiness inferred from interview/application practice', trend: communication > 60 ? 'up' : 'flat' },
    { id: 'projects', name: 'Projects', score: clamp(average(projectScores, 0)), evidence: `${projectScores.length} projects in portfolio`, trend: average(projectScores, 0) > 60 ? 'up' : 'flat' },
    { id: 'resume', name: 'Resume', score: clamp(resumeScore), evidence: `ATS score ${state.resume?.atsScore || 0}`, trend: resumeScore > 70 ? 'up' : 'flat' },
    { id: 'interview', name: 'Interview', score: clamp((state.applications?.length || 0) * 3 + (resumeScore > 70 ? 10 : 0)), evidence: 'Interview readiness inferred from resume and applications', trend: 'flat' }
  ];
}

export function buildAIBrainSummary(state: CareerState): AIBrainSummary {
  const learning = loadLearningState();
  const dueRevision = getDueRevisionItems(learning.revisionItems);
  const weakestLearning = [...learning.paths].sort((a, b) => a.masteryPercentage - b.masteryPercentage)[0];
  const strongestLearning = [...learning.paths].sort((a, b) => b.masteryPercentage - a.masteryPercentage)[0];
  const skills = scoreSkills(state);
  const strongestSkills = [...skills].sort((a, b) => b.score - a.score).slice(0, 3);
  const weakestSkills = [...skills].sort((a, b) => a.score - b.score).slice(0, 3);
  const logs = Object.values(state.dailyLogs || {});
  const recentLogs = logs.slice(-7);
  const activeDays = recentLogs.filter((log) => log.status === 'completed' || (log.focusMinutes || 0) > 0 || Object.values(log.counts || {}).some((count) => count > 0)).length;
  const totalFocusMinutes = recentLogs.reduce((sum, log) => sum + (log.focusMinutes || 0), 0);
  const projectPortfolioStrength = clamp(average(Object.values(state.projects || {}).map((project) => average(Object.values(project.progress || {}), 0)), 0));
  const resumeReadiness = clamp(average(Object.values(state.resume?.sections || {}), state.resume?.atsScore || 0));
  const interviewReadiness = clamp(average([skills.find((skill) => skill.name === 'Communication')?.score || 0, resumeReadiness, projectPortfolioStrength], 0));
  const placementReadinessScore = clamp(average([average(skills.map((skill) => skill.score), 0), projectPortfolioStrength, resumeReadiness, interviewReadiness], 0));
  const lowEnergyDays = recentLogs.filter((log) => (log.energy || 3) <= 2).length;
  const latestLog = recentLogs.length ? recentLogs[recentLogs.length - 1] : undefined;
  const burnoutRisk = totalFocusMinutes > 900 || lowEnergyDays >= 3 ? 'high' : totalFocusMinutes > 600 || lowEnergyDays >= 2 ? 'medium' : 'low';
  const nextSkill = weakestSkills[0];

  const recommendations: AIRecommendation[] = [
    ...(weakestLearning ? [{ id: 'learning-weakness', title: `Learning priority: ${weakestLearning.title}`, detail: `${weakestLearning.title} is the weakest Learning OS path at ${weakestLearning.masteryPercentage}% mastery.`, priority: 'high' as const, category: 'Placement' as const }] : []),
    ...(dueRevision[0] ? [{ id: 'revision-backlog', title: `Review ${dueRevision[0].topic}`, detail: `${dueRevision.length} Learning OS revision item(s) are due.`, priority: 'high' as const, category: 'Recovery' as const }] : []),
    { id: 'next-skill', title: `Strengthen ${nextSkill.name}`, detail: `Spend one focused block on ${nextSkill.name}. Current signal is ${nextSkill.score}%.`, priority: 'high', category: nextSkill.name },
    ...(Object.keys(state.projects || {}).length ? [{ id: 'project-proof', title: 'Add one project proof point', detail: 'Update a README, demo note, metric, or architecture bullet for one portfolio project.', priority: 'medium' as const, category: 'Projects' as const }] : []),
    { id: 'placement-readiness', title: 'Prepare one company story', detail: 'Pick one target company and write a 90-second project explanation tailored to its role.', priority: 'medium', category: 'Placement' as const }
  ];

  const riskFlags: CareerRiskFlag[] = [];
  if (weakestSkills.some((skill) => skill.score < 40)) {
    riskFlags.push({ id: 'skill-gap', title: 'Core skill gap', detail: `${weakestSkills[0].name} is below the safe placement baseline.`, severity: 'high' });
  }
  if (burnoutRisk !== 'low') {
    riskFlags.push({ id: 'burnout', title: 'Burnout risk', detail: 'Recent workload or energy signals suggest a lighter plan may help consistency.', severity: burnoutRisk });
  }
  if (resumeReadiness < 65) {
    riskFlags.push({ id: 'resume', title: 'Resume readiness low', detail: 'Resume sections need sharper proof, quantified project bullets, or formatting review.', severity: 'medium' });
  }
  if (dueRevision.length >= 3) {
    riskFlags.push({ id: 'revision-backlog', title: 'Revision backlog', detail: `${dueRevision.length} learning revision items are waiting.`, severity: 'medium' });
  }

  return {
    profile: { ...defaultCareerProfile, name: state.userProfile?.name || defaultCareerProfile.name, updatedAt: new Date().toISOString() },
    strongestSkills,
    weakestSkills,
    currentStreak: currentStreak(state.dailyLogs || {}),
    placementReadinessScore,
    burnoutRisk,
    projectPortfolioStrength,
    resumeReadiness,
    interviewReadiness,
    recommendedNextAction: dueRevision[0]
      ? `Review ${dueRevision[0].topic}, then do one ${nextSkill.name} task.`
      : weakestLearning
        ? `Log one ${weakestLearning.title} session, then update your tracker with real progress.`
        : `Do one ${nextSkill.name} task, then update your tracker with real progress.`,
    recommendations,
    riskFlags,
    projects: Object.entries(state.projects || {}).map(([id, project]) => ({
      id,
      name: project.name,
      score: clamp(average(Object.values(project.progress || {}), 0)),
      status: project.status,
      nextAction: 'Add one measurable update or demo-ready bullet.'
    })),
    placementGoals: [
      { id: 'analytics', label: 'AI Product / Analytics', readiness: placementReadinessScore, priority: 'high' },
      { id: 'swe', label: 'SWE placement backup', readiness: clamp(average([skills[0].score, skills[1].score, interviewReadiness], 50)), priority: 'medium' }
    ],
    weeklyConsistency: {
      consistencyScore: clamp(((activeDays / 7) * 60) + Math.min(40, learning.paths.reduce((sum, path) => sum + path.weeklyHours, 0) * 5)),
      activeDays,
      totalFocusMinutes,
      message: strongestLearning ? `Learning strongest path: ${strongestLearning.title}. Weakest path: ${weakestLearning?.title || 'none'}.` : activeDays >= 5 ? 'Strong weekly rhythm.' : activeDays >= 3 ? 'Decent rhythm. Protect the next two days.' : 'Consistency is the main lever this week.'
    },
    snapshot: {
      date: new Date().toISOString().split('T')[0],
      focusMinutes: latestLog?.focusMinutes || 0,
      tasksCompleted: Object.values(latestLog?.counts || {}).reduce((sum: number, count) => sum + Number(count || 0), 0),
      xpEarned: latestLog?.xpEarned || 0,
      mood: latestLog?.mood || 3,
      energy: latestLog?.energy || 3
    },
    generatedAt: new Date().toISOString()
  };
}

export function saveAIBrainSummary(summary: AIBrainSummary): void {
  try {
    localStorage.setItem(AI_BRAIN_STORAGE_KEY, JSON.stringify(summary));
  } catch (error) {
    console.warn('Unable to persist AI Brain summary', error);
  }
}

export function loadAIBrainSummary(): AIBrainSummary | null {
  try {
    const raw = localStorage.getItem(AI_BRAIN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AIBrainSummary;
    const hasSeededProjects = parsed.profile?.projects?.some((project) => ['CareSync AI', 'SmartEdu AI', 'Sanju Career OS'].includes(project));
    if (hasSeededProjects && parsed.placementReadinessScore > 0 && parsed.projects.length === 0) {
      localStorage.removeItem(AI_BRAIN_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
