import { request } from './apiClient';
import { CategoryScore, ATSIssue, ResumeAnalysis } from '../app/store/useResumeAnalysisStore';

export const TARGET_ROLES = ['Software Engineer', 'Java Developer', 'Data Analyst', 'Business Analyst', 'Product Analyst', 'AI Product Builder', 'Full-Stack Developer', 'Backend Developer'];
export const TARGET_COMPANIES = ['Zoho', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'Capgemini', 'HCLTech', 'Freshworks', 'PayPal', 'Amazon', 'Microsoft', 'Fractal Analytics', 'Tiger Analytics', 'Quantiphi'];

export type ParsedResumeResponse = {
  ok: boolean;
  fileType: string;
  extractedText: string;
  warnings: string[];
  metadata: { fileName: string; fileSize: number; mimeType: string; parser: string };
};

export type ATSScoreResponse = Omit<ResumeAnalysis, 'id' | 'createdAt' | 'fileName' | 'fileType' | 'fileSize' | 'extractedTextPreview' | 'fullExtractedText'>;

const keywordMap: Record<string, string[]> = {
  'Software Engineer': ['java', 'dsa', 'api', 'system design', 'git', 'testing', 'database'],
  'Java Developer': ['java', 'spring', 'oop', 'sql', 'rest', 'microservices', 'junit'],
  'Data Analyst': ['sql', 'python', 'excel', 'dashboard', 'statistics', 'power bi', 'tableau'],
  'Business Analyst': ['requirements', 'stakeholder', 'process', 'excel', 'sql', 'documentation'],
  'Product Analyst': ['metrics', 'experiments', 'funnel', 'sql', 'dashboard', 'insights'],
  'AI Product Builder': ['ai', 'llm', 'prompt', 'prototype', 'evaluation', 'api'],
  'Full-Stack Developer': ['react', 'node', 'api', 'database', 'typescript', 'deployment'],
  'Backend Developer': ['api', 'database', 'node', 'java', 'auth', 'scalability'],
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function localATSScore(extractedText: string, targetRole: string, targetCompany: string): ATSScoreResponse {
  const text = extractedText.toLowerCase();
  const has = (terms: string[]) => terms.some((term) => text.includes(term));
  const count = (terms: string[]) => terms.filter((term) => text.includes(term)).length;
  const roleKeywords = keywordMap[targetRole] || keywordMap['Software Engineer'];
  const keywordGaps = roleKeywords.filter((keyword) => !text.includes(keyword));
  const projects = (text.match(/project/g) || []).length;
  const categoryScores: CategoryScore[] = [
    { label: 'Contact & Links', max: 10, score: count(['@', 'linkedin', 'github', 'portfolio', '+91']) * 2, note: 'Email, phone, LinkedIn, GitHub, and portfolio improve recruiter reach.' },
    { label: 'Education', max: 10, score: has(['education', 'degree', 'college', 'cgpa', 'university']) ? 8 : 3, note: 'Education section should be easy to scan.' },
    { label: 'Skills', max: 15, score: Math.min(15, count(roleKeywords) * 3), note: `Role keyword coverage for ${targetRole}.` },
    { label: 'Projects', max: 20, score: Math.min(20, 6 + projects * 5 + count(['github', 'demo', 'impact']) * 2), note: 'Projects need stack, problem, implementation, and proof.' },
    { label: 'Experience / Achievements', max: 10, score: has(['intern', 'hackathon', 'certification', 'award', 'lead']) ? 8 : 4, note: 'Achievements add credibility even without internships.' },
    { label: 'Formatting / ATS readability', max: 15, score: text.length > 600 ? 12 : 8, note: 'Estimated from text extraction quality and section clarity.' },
    { label: 'Role Match', max: 10, score: Math.min(10, count(roleKeywords) * 2), note: `${targetCompany} match is estimated from role keywords only.` },
    { label: 'Grammar & Clarity', max: 10, score: text.split(/\s+/).length > 120 ? 8 : 5, note: 'Concise action verbs and specific bullets score higher.' },
  ];
  const totalScore = clamp(categoryScores.reduce((sum, item) => sum + item.score, 0));
  const issues: ATSIssue[] = [
    ...(keywordGaps.length ? [{ severity: 'high' as const, title: 'Role keyword gaps', detail: keywordGaps.slice(0, 5).join(', '), fix: 'Add only the skills you can defend in projects or coursework.' }] : []),
    ...(projects < 2 ? [{ severity: 'critical' as const, title: 'Project depth is thin', detail: 'At least two project mentions were not detected.', fix: 'Add two placement-ready projects with stack, implementation, GitHub/demo, and outcome.' }] : []),
    ...(!has(['linkedin', 'github']) ? [{ severity: 'medium' as const, title: 'Missing profile links', detail: 'LinkedIn or GitHub was not detected.', fix: 'Add public links in the contact section.' }] : []),
  ];
  return {
    targetRole,
    targetCompany,
    atsScore: totalScore,
    categoryScores,
    issues,
    strengths: ['Readable text was extracted', keywordGaps.length < roleKeywords.length ? 'Some role keywords are present' : 'Resume has a clear base to improve'],
    missingSections: ['education', 'skills', 'projects', 'experience'].filter((section) => !text.includes(section)),
    keywordGaps,
    priorityFixes: issues.map((issue) => issue.fix).slice(0, 4),
    rewrittenBullets: ['Built [project] using [stack] to solve [problem], improving [truthful metric/result].', 'Implemented [feature] with [technology], reducing [manual step/latency/error] by [verified metric].'],
    atsWarnings: ['Estimated ATS readiness score, not an official ATS result.', 'Do not add fake experience or fake metrics.'],
  };
}

export async function parseResumeFile(file: File, manualText = ''): Promise<ParsedResumeResponse> {
  const textContent = manualText || (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt') ? await file.text() : '');
  return request<ParsedResumeResponse>('/resume/upload-parse', {
    method: 'POST',
    body: { fileName: file.name, fileSize: file.size, mimeType: file.type, textContent },
  });
}

export async function scoreResume(extractedText: string, targetRole: string, targetCompany: string): Promise<ATSScoreResponse> {
  try {
    return await request<ATSScoreResponse>('/resume/score', { method: 'POST', body: { extractedText, targetRole, targetCompany } });
  } catch {
    return localATSScore(extractedText, targetRole, targetCompany);
  }
}

export async function askResumeAIReview(payload: unknown): Promise<{ ok: boolean; review: string; providerUsed: string; modelUsed: string }> {
  return request('/resume/ai-review', { method: 'POST', body: payload });
}

export async function analyzeLinkedInProfile(payload: unknown): Promise<{ score: number; suggestions: string[]; headlineVersions: string[]; improvedAbout: string }> {
  return request('/linkedin/analyze-profile-text', { method: 'POST', body: payload });
}
