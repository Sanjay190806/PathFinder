import { AIBrainSummary } from '../types/aiBrain';
import { PlannerMode, SmartPlan, SmartTask } from '../types/smartPlanner';
import { getDueRevisionItems, loadLearningState } from './learningService';

export const SMART_PLANNER_STORAGE_KEY = 'sanzz_os_smart_planner_v1';

const today = () => new Date().toISOString().split('T')[0];

const modeMinutes: Record<PlannerMode, number> = {
  normal: 150,
  busy: 70,
  low_energy: 55,
  placement_sprint: 210,
  project_build: 180,
  revision: 100
};

function task(seed: Omit<SmartTask, 'id' | 'status'>, index: number): SmartTask {
  return { ...seed, id: `smart-task-${today()}-${index}`, status: 'todo' };
}

export function generateSmartPlan(summary: AIBrainSummary, mode: PlannerMode = 'normal'): SmartPlan {
  const weakest = summary.weakestSkills.map((skill) => skill.name);
  const learning = loadLearningState();
  const dueRevision = getDueRevisionItems(learning.revisionItems);
  const weakestLearning = [...learning.paths].sort((a, b) => a.masteryPercentage - b.masteryPercentage)[0];
  const tasks: Omit<SmartTask, 'id' | 'status'>[] = [];
  const cap = modeMinutes[mode];

  if (dueRevision.length) {
    tasks.push({
      title: `Review ${dueRevision[0].topic}`,
      category: 'revision',
      description: 'Clear the highest-priority Learning OS revision item before adding new study load.',
      estimatedMinutes: 20,
      difficulty: dueRevision[0].difficulty,
      priority: 'high',
      reason: `${dueRevision.length} Learning OS revision item(s) are due today.`,
      successCriteria: 'Review the concept, fix the mistake, and mark the revision item complete.',
      xpReward: 25
    });
  }

  if (weakestLearning && weakestLearning.masteryPercentage < 50) {
    tasks.push({
      title: `${weakestLearning.title} mastery block`,
      category: weakestLearning.category === 'data' ? 'sql' : weakestLearning.category === 'product' ? 'product' : weakestLearning.category === 'language' ? 'german' : 'revision',
      description: `Log one focused Learning OS session for ${weakestLearning.title}.`,
      estimatedMinutes: mode === 'busy' ? 20 : 35,
      difficulty: 'medium',
      priority: weakestLearning.priority,
      reason: `${weakestLearning.title} has only ${weakestLearning.masteryPercentage}% mastery and ${weakestLearning.weeklyHours.toFixed(1)}h this week.`,
      successCriteria: 'One session logged with confidence and next action.',
      xpReward: 35
    });
  }

  if (weakest.includes('Java DSA') || mode === 'placement_sprint' || mode === 'normal') {
    tasks.push({
      title: 'Solve one Java DSA placement problem',
      category: 'coding',
      description: 'Pick one array/string problem and write the final approach in 5 bullet points.',
      estimatedMinutes: mode === 'busy' ? 25 : 45,
      difficulty: 'medium',
      priority: 'high',
      reason: 'Java DSA remains the SWE backup and Zoho-style preparation base.',
      successCriteria: 'Accepted solution plus short explanation note.',
      xpReward: 45
    });
  }

  if (weakest.includes('SQL') || mode === 'placement_sprint') {
    tasks.push({
      title: 'Practice 5-10 SQL questions',
      category: 'sql',
      description: 'Focus on joins, grouping, and one subquery/window question.',
      estimatedMinutes: 35,
      difficulty: 'medium',
      priority: 'high',
      reason: 'SQL is a core analytics and product analyst filter.',
      successCriteria: 'At least five queries solved and one mistake logged.',
      xpReward: 35
    });
  }

  if (weakest.includes('Aptitude') || mode === 'placement_sprint') {
    tasks.push({
      title: 'Aptitude accuracy block',
      category: 'aptitude',
      description: 'Complete a timed quant or reasoning set with mistake review.',
      estimatedMinutes: mode === 'busy' ? 20 : 40,
      difficulty: 'medium',
      priority: 'high',
      reason: 'Aptitude consistency keeps service and analytics companies open.',
      successCriteria: '20 questions attempted or 30 minutes reviewed.',
      xpReward: 35
    });
  }

  if (summary.projects.length > 0 && (mode === 'project_build' || summary.projectPortfolioStrength < 70)) {
    tasks.push({
      title: 'Ship one project portfolio improvement',
      category: 'project',
      description: 'Improve one real tracked project with a visible proof point.',
      estimatedMinutes: mode === 'project_build' ? 75 : 40,
      difficulty: 'medium',
      priority: 'high',
      reason: 'Project proof increases AI/Product and analyst positioning.',
      successCriteria: 'One commit, screenshot, README bullet, or demo note completed.',
      xpReward: 55
    });
  }

  if (summary.resumeReadiness < 75 || mode === 'placement_sprint') {
    tasks.push({
      title: 'Sharpen one resume bullet',
      category: 'resume',
      description: 'Rewrite one project bullet with action, metric, and tech/result.',
      estimatedMinutes: 25,
      difficulty: 'easy',
      priority: 'medium',
      reason: 'Resume readiness is a multiplier for every placement track.',
      successCriteria: 'One bullet rewritten and saved.',
      xpReward: 25
    });
  }

  tasks.push({
    title: mode === 'low_energy' ? 'Minimum viable revision' : 'Interview communication drill',
    category: mode === 'low_energy' ? 'revision' : 'communication',
    description: mode === 'low_energy' ? 'Review notes lightly and protect the streak.' : 'Speak a 90-second explanation of one project and record friction points.',
    estimatedMinutes: mode === 'low_energy' ? 15 : 20,
    difficulty: 'easy',
    priority: mode === 'low_energy' ? 'high' : 'medium',
    reason: mode === 'low_energy' ? 'Consistency beats intensity on low-energy days.' : 'Communication converts preparation into interview performance.',
    successCriteria: mode === 'low_energy' ? 'One revision note completed.' : 'One project explanation practiced out loud.',
    xpReward: mode === 'low_energy' ? 15 : 20
  });

  if (summary.burnoutRisk !== 'low' || mode === 'low_energy') {
    tasks.push({
      title: 'Recovery buffer',
      category: 'rest',
      description: 'Take a real break and stop after the minimum plan if energy stays low.',
      estimatedMinutes: 15,
      difficulty: 'easy',
      priority: 'medium',
      reason: 'Burnout risk is visible in recent energy/workload signals.',
      successCriteria: 'Break taken without adding extra tasks.',
      xpReward: 10
    });
  }

  let selected = tasks;
  while (selected.reduce((sum, item) => sum + item.estimatedMinutes, 0) > cap && selected.length > 2) {
    selected = selected.slice(0, -1);
  }

  const planTasks = selected.map(task);
  return {
    id: `smart-plan-${today()}`,
    date: today(),
    mode,
    tasks: planTasks,
    totalMinutes: planTasks.reduce((sum, item) => sum + item.estimatedMinutes, 0),
    completedTaskIds: [],
    insight: summary.recommendedNextAction
  };
}

export function saveSmartPlan(plan: SmartPlan): void {
  try {
    localStorage.setItem(SMART_PLANNER_STORAGE_KEY, JSON.stringify({ ...plan, savedAt: new Date().toISOString() }));
  } catch (error) {
    console.warn('Unable to persist smart plan', error);
  }
}

export function loadSmartPlan(): SmartPlan | null {
  try {
    const raw = localStorage.getItem(SMART_PLANNER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SmartPlan;
    const hasSeededProjectTask = parsed.tasks?.some((item) => /CareSync AI|SmartEdu AI/i.test(`${item.title} ${item.description}`));
    if (hasSeededProjectTask) {
      localStorage.removeItem(SMART_PLANNER_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function completeSmartTask(plan: SmartPlan, taskId: string): SmartPlan {
  const completedTaskIds = Array.from(new Set([...plan.completedTaskIds, taskId]));
  return {
    ...plan,
    completedTaskIds,
    tasks: plan.tasks.map((item) => item.id === taskId ? { ...item, status: 'completed' } : item)
  };
}
