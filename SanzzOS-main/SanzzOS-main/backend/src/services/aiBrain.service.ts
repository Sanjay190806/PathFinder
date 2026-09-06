import { DEFAULT_PLACEMENT_COMPANIES } from './placement.service.js';

export const defaultAIBrainProfile = {
  name: 'Sanju / Sanjay',
  degree: 'B.E. ECE',
  year: '3rd year',
  batch: '2024-2028',
  currentDirection: ['AI Product', 'Product Analytics', 'Data Analyst', 'Product Analyst', 'SWE backup'],
  corePlacementSkills: ['Java DSA', 'SQL', 'Aptitude', 'Python basics', 'Power BI / Excel', 'Communication', 'Project explanation'],
  projects: ['CareSync AI', 'SmartEdu AI', 'Sanju Career OS'],
  targetCompanies: DEFAULT_PLACEMENT_COMPANIES.map((company) => company.name),
  updatedAt: new Date().toISOString()
};

export function getAIBrainSummary() {
  const generatedAt = new Date().toISOString();
  return {
    profile: { ...defaultAIBrainProfile, updatedAt: generatedAt },
    strongestSkills: [
      { id: 'projects', name: 'Projects', score: 74, evidence: 'Three AI/product projects tracked', trend: 'up' },
      { id: 'resume', name: 'Resume', score: 70, evidence: 'Resume studio baseline score', trend: 'flat' },
      { id: 'communication', name: 'Communication', score: 62, evidence: 'Interview practice baseline', trend: 'flat' }
    ],
    weakestSkills: [
      { id: 'java-dsa', name: 'Java DSA', score: 42, evidence: 'Needs consistent placement practice', trend: 'flat' },
      { id: 'sql', name: 'SQL', score: 45, evidence: 'Needs analytics query repetition', trend: 'flat' },
      { id: 'aptitude', name: 'Aptitude', score: 48, evidence: 'Needs timed consistency', trend: 'flat' }
    ],
    currentStreak: 0,
    weeklyConsistency: { consistencyScore: 45, activeDays: 3, totalFocusMinutes: 300, message: 'Frontend local data gives the live value.' },
    placementReadinessScore: 58,
    burnoutRisk: 'low',
    projectPortfolioStrength: 72,
    resumeReadiness: 70,
    interviewReadiness: 58,
    recommendedNextAction: 'Do one Java DSA task, one SQL block, and update one project proof point.',
    recommendations: [
      { id: 'dsa', title: 'Solve one Java DSA problem', detail: 'Protect SWE backup and Zoho readiness.', priority: 'high', category: 'Java DSA' },
      { id: 'sql', title: 'Practice SQL joins', detail: 'SQL is a core analytics screen.', priority: 'high', category: 'SQL' }
    ],
    riskFlags: [],
    projects: defaultAIBrainProfile.projects.map((name, index) => ({ id: `project-${index}`, name, score: 70, status: 'building', nextAction: 'Add one proof point.' })),
    placementGoals: [
      { id: 'analytics', label: 'AI Product / Analytics', readiness: 60, priority: 'high' },
      { id: 'swe', label: 'SWE placement backup', readiness: 52, priority: 'medium' }
    ],
    snapshot: { date: generatedAt.split('T')[0], focusMinutes: 0, tasksCompleted: 0, xpEarned: 0, mood: 3, energy: 3 },
    generatedAt
  };
}
