export const DEFAULT_LEARNING_PATHS = [
  'Java DSA',
  'SQL',
  'Aptitude',
  'Python Basics',
  'Pandas / Data Analysis',
  'Excel',
  'Power BI',
  'Statistics',
  'Machine Learning Basics',
  'Product Thinking',
  'Communication',
  'Interview Preparation',
  'German',
  'CS Core Basics'
].map((title, index) => ({
  id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  title,
  masteryPercentage: index < 2 ? 40 : 30,
  weeklyHours: 0,
  status: 'active',
  priority: index < 3 ? 'high' : 'medium'
}));

export function getLearningAnalytics() {
  return {
    totalPaths: DEFAULT_LEARNING_PATHS.length,
    averageMastery: 33,
    weeklyHours: 0,
    revisionBacklog: 0,
    note: 'Frontend localStorage provides live Learning OS data.'
  };
}
