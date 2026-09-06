import { LearningPath } from '../types/learning';

const now = new Date().toISOString();

function path(input: Omit<LearningPath, 'totalHoursSpent' | 'weeklyHours' | 'streak' | 'xp' | 'lastStudiedAt' | 'nextReviewAt' | 'notes'>): LearningPath {
  return {
    ...input,
    totalHoursSpent: 0,
    weeklyHours: 0,
    streak: 0,
    xp: 0,
    lastStudiedAt: null,
    nextReviewAt: null,
    notes: '',
  };
}

export const DEFAULT_LEARNING_PATHS: LearningPath[] = [
  path({
    id: 'java-dsa',
    title: 'Java DSA',
    category: 'coding',
    description: 'Placement coding foundation for Zoho, service companies, and SWE backup.',
    targetRoleRelevance: 'Critical for SWE backup and coding rounds.',
    currentLevel: 'foundation',
    targetLevel: 'placement_ready',
    masteryPercentage: 35,
    status: 'active',
    priority: 'high',
    topics: ['Arrays', 'Strings', 'Recursion', 'Sorting', 'Linked List'].map((title, index) => ({ id: `java-${index}`, title, masteryPercentage: 30, confidence: 'medium', lastPracticedAt: null })),
    milestones: ['Solve 50 easy/medium problems', 'Master 10 common patterns', 'Explain 5 solutions aloud'].map((title, index) => ({ id: `java-m${index}`, title, completed: false, dueHint: 'Placement sprint' })),
    resources: [{ id: 'java-r1', title: 'NeetCode/LeetCode pattern practice', type: 'practice' }],
    weakAreas: ['Consistency', 'Pattern recall'],
    strongAreas: ['Problem-solving mindset']
  }),
  path({
    id: 'sql',
    title: 'SQL',
    category: 'data',
    description: 'Analytics query skill for Data Analyst, Product Analyst, and AI Product tracks.',
    targetRoleRelevance: 'Critical for analytics screens and dashboards.',
    currentLevel: 'foundation',
    targetLevel: 'placement_ready',
    masteryPercentage: 40,
    status: 'active',
    priority: 'high',
    topics: ['Joins', 'Grouping', 'Subqueries', 'Window functions', 'Case statements'].map((title, index) => ({ id: `sql-${index}`, title, masteryPercentage: 38, confidence: 'medium', lastPracticedAt: null })),
    milestones: ['Solve 100 SQL questions', 'Build one analytics case', 'Explain joins clearly'].map((title, index) => ({ id: `sql-m${index}`, title, completed: false, dueHint: 'Analytics readiness' })),
    resources: [{ id: 'sql-r1', title: 'Mode SQL tutorial and practice sets', type: 'practice' }],
    weakAreas: ['Window functions'],
    strongAreas: ['Basic SELECT logic']
  }),
  ...[
    ['aptitude', 'Aptitude', 'aptitude', 'Quant, reasoning, verbal and speed accuracy for campus screens.', 'Keeps service and analytics company filters open.'],
    ['python-basics', 'Python Basics', 'coding', 'Python syntax, data structures, scripts and notebooks.', 'Useful for analytics, AI projects, and automation.'],
    ['pandas', 'Pandas / Data Analysis', 'data', 'Data cleaning, grouping, joining, EDA and basic analytics workflows.', 'Core for analyst and AI Product portfolio.'],
    ['excel', 'Excel', 'analytics', 'Formulas, pivots, charts, lookup functions and analysis hygiene.', 'Important for product/data analyst roles.'],
    ['power-bi', 'Power BI', 'analytics', 'Dashboards, DAX basics, data modeling and storytelling.', 'Portfolio signal for analytics roles.'],
    ['statistics', 'Statistics', 'analytics', 'Probability, distributions, hypothesis testing and business metrics.', 'Critical for analytics interviews.'],
    ['ml-basics', 'Machine Learning Basics', 'ai_ml', 'Supervised learning, evaluation, leakage, feature thinking and model explanation.', 'Supports AI Product and AI engineer story.'],
    ['product-thinking', 'Product Thinking', 'product', 'Problem framing, metrics, user journeys, prioritization and experiments.', 'Differentiates AI Product/Product Analyst path.'],
    ['communication', 'Communication', 'communication', 'Project explanations, HR answers, English clarity and confidence.', 'Converts preparation into interview performance.'],
    ['interview-prep', 'Interview Preparation', 'interview', 'Mock rounds, resume stories, STAR answers and technical recall.', 'Directly improves placement conversion.'],
    ['german', 'German', 'language', 'A1-B1 vocabulary, listening, speaking and grammar rhythm.', 'Optional long-term Germany pathway.'],
    ['cs-core', 'CS Core Basics', 'cs_core', 'OOP, DBMS, OS, CN and software fundamentals.', 'Needed for technical interview credibility.']
  ].map(([id, title, category, description, relevance]) => path({
    id,
    title,
    category: category as LearningPath['category'],
    description,
    targetRoleRelevance: relevance,
    currentLevel: 'beginner',
    targetLevel: id === 'german' ? 'intermediate' : 'placement_ready',
    masteryPercentage: id === 'communication' ? 45 : 30,
    status: id === 'german' ? 'revision' : 'active',
    priority: ['aptitude', 'python-basics', 'pandas', 'power-bi', 'communication', 'interview-prep'].includes(id) ? 'high' : 'medium',
    topics: ['Foundation', 'Practice', 'Revision'].map((topic, index) => ({ id: `${id}-${index}`, title: topic, masteryPercentage: 25, confidence: 'medium', lastPracticedAt: null })),
    milestones: ['Complete foundation module', 'Log five focused sessions', 'Create one interview-ready proof point'].map((milestone, index) => ({ id: `${id}-m${index}`, title: milestone, completed: false, dueHint: 'This month' })),
    resources: [{ id: `${id}-r1`, title: `${title} focused notes`, type: 'notes' }],
    weakAreas: ['Needs recent practice'],
    strongAreas: []
  }))
].map((item) => ({ ...item, updatedAt: now } as LearningPath));
