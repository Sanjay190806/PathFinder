export const roleKeywords: Record<string, string[]> = {
  'Software Engineer': ['java', 'dsa', 'api', 'system design', 'git', 'testing', 'database'],
  'Java Developer': ['java', 'spring', 'oop', 'sql', 'rest', 'microservices', 'junit'],
  'Data Analyst': ['sql', 'python', 'excel', 'dashboard', 'statistics', 'power bi', 'tableau'],
  'Business Analyst': ['requirements', 'stakeholder', 'process', 'excel', 'sql', 'documentation'],
  'Product Analyst': ['metrics', 'experiments', 'funnel', 'sql', 'dashboard', 'insights'],
  'AI Product Builder': ['ai', 'llm', 'prompt', 'prototype', 'evaluation', 'api'],
  'Full-Stack Developer': ['react', 'node', 'api', 'database', 'typescript', 'deployment'],
  'Backend Developer': ['api', 'database', 'node', 'java', 'auth', 'scalability'],
};

export function keywordGapsForRole(text: string, role: string) {
  const lower = text.toLowerCase();
  const keywords = roleKeywords[role] || roleKeywords['Software Engineer'];
  return keywords.filter((keyword) => !lower.includes(keyword));
}
