import { keywordGapsForRole, roleKeywords } from './resumeKeyword.service.js';

const clamp = (value: number, max = 100) => Math.max(0, Math.min(max, Math.round(value)));
const count = (text: string, terms: string[]) => terms.filter((term) => text.includes(term)).length;
const has = (text: string, terms: string[]) => count(text, terms) > 0;

export function scoreResumeATS(extractedText: string, targetRole = 'Software Engineer', targetCompany = 'Zoho') {
  const text = extractedText.toLowerCase();
  const roleTerms = roleKeywords[targetRole] || roleKeywords['Software Engineer'];
  const keywordGaps = keywordGapsForRole(extractedText, targetRole);
  const projectMentions = (text.match(/project/g) || []).length;
  const categoryScores = [
    { label: 'Contact & Links', max: 10, score: clamp(count(text, ['@', 'linkedin', 'github', 'portfolio', '+91']) * 2, 10), note: 'Email, phone, LinkedIn, GitHub, and portfolio are checked.' },
    { label: 'Education', max: 10, score: has(text, ['education', 'degree', 'college', 'cgpa', 'university']) ? 8 : 3, note: 'Education needs degree, college, batch, and optional CGPA.' },
    { label: 'Skills', max: 15, score: clamp(count(text, roleTerms) * 3, 15), note: `Placement-relevant skills for ${targetRole}.` },
    { label: 'Projects', max: 20, score: clamp(6 + projectMentions * 5 + count(text, ['github', 'demo', 'impact']) * 2, 20), note: 'Projects should show stack, implementation, impact, and links.' },
    { label: 'Experience / Achievements', max: 10, score: has(text, ['intern', 'hackathon', 'certification', 'award', 'lead']) ? 8 : 4, note: 'Internships, hackathons, certifications, and awards improve signal.' },
    { label: 'Formatting / ATS readability', max: 15, score: extractedText.length > 600 ? 12 : 8, note: 'Estimated from text extraction quality and simple headings.' },
    { label: 'Role Match', max: 10, score: clamp(count(text, roleTerms) * 2, 10), note: `${targetCompany} match is estimated, not official.` },
    { label: 'Grammar & Clarity', max: 10, score: extractedText.split(/\s+/).length > 120 ? 8 : 5, note: 'Concise bullets and action verbs improve this score.' },
  ];
  const atsScore = clamp(categoryScores.reduce((sum, category) => sum + category.score, 0));
  const missingSections = ['education', 'skills', 'projects', 'experience'].filter((section) => !text.includes(section));
  const issues = [
    ...(keywordGaps.length ? [{ severity: 'high', title: 'Role keyword gaps', detail: keywordGaps.slice(0, 5).join(', '), fix: 'Add only keywords you can defend with coursework or projects.' }] : []),
    ...(projectMentions < 2 ? [{ severity: 'critical', title: 'Project depth is thin', detail: 'At least two project mentions were not detected.', fix: 'Add two projects with stack, implementation, GitHub/demo, and measurable result.' }] : []),
    ...(!has(text, ['linkedin', 'github']) ? [{ severity: 'medium', title: 'Missing public profile links', detail: 'LinkedIn or GitHub was not detected.', fix: 'Add public profile links near contact details.' }] : []),
  ];

  return {
    targetRole,
    targetCompany,
    atsScore,
    categoryScores,
    issues,
    strengths: ['Estimated ATS-readable text is available', keywordGaps.length < roleTerms.length ? 'Some role keywords are present' : 'The resume has a clear improvement baseline'],
    missingSections,
    keywordGaps,
    priorityFixes: issues.map((issue) => issue.fix).slice(0, 5),
    rewrittenBullets: [
      'Built [project] using [stack] to solve [problem], improving [truthful metric/result].',
      'Implemented [feature] with [technology], reducing [manual step/latency/error] by [verified metric].',
    ],
    atsWarnings: ['Estimated ATS readiness score only. This is not an official ATS score.', 'Do not invent fake experience, fake certifications, or fake metrics.'],
  };
}
