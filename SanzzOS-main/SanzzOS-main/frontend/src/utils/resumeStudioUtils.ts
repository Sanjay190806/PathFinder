import { CareerState } from '../app/store/useCareerStore';
import { Project } from '../types';
import { calcResumeScore } from './xpUtils';
import {
  ResumeBulletGeneration,
  ResumeBulletRequest,
  ResumeInterviewQuestionGroup,
  ResumeJobAnalysis,
  ResumeRecruiterReview,
  ResumeScoreHistoryItem,
  ResumeStudioContext,
  TailoredResumeVersion,
} from '../types/resumeStudio';

const KEYWORD_BANK = [
  'Java',
  'TypeScript',
  'React',
  'SQL',
  'DSA',
  'Algorithms',
  'Data Structures',
  'Spring Boot',
  'REST',
  'Git',
  'GitHub',
  'Docker',
  'CI/CD',
  'Redux',
  'Node.js',
  'MongoDB',
  'PostgreSQL',
  'Testing',
  'JWT',
  'Microservices',
  'System Design',
  'Communication',
  'Leadership',
  'Problem Solving',
  'Analytics',
  'Python',
  'OOP',
  'HTML',
  'CSS',
  'Tailwind',
  'Vite',
];

const trim = (text: string, limit = 180) => (text.length <= limit ? text : `${text.slice(0, Math.max(0, limit - 12)).trimEnd()}...[trimmed]`);

const titleCase = (text: string) => text.split(/\s+/).map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part).join(' ');

const extractKeywordMatches = (text: string) => {
  const lower = text.toLowerCase();
  return KEYWORD_BANK.filter((keyword) => lower.includes(keyword.toLowerCase()));
};

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

export function buildResumeStudioContext(state: CareerState, selectedVersion = 'v1.0', lastJobDescription = ''): ResumeStudioContext {
  const resume = state.resume;
  const projects = (Object.values(state.projects || {}) as Project[]).slice(0, 6).map((project) => ({
    name: project.name,
    status: project.status,
    stack: (project.stack || []).slice(0, 6),
    bullets: (project.bullets || []).slice(0, 3).map((bullet) => trim(bullet, 140)),
  }));

  const applications = (state.applications || []).slice(0, 6).map((app) => ({
    company: app.company,
    role: app.role,
    status: app.status,
  }));

  const projectHighlights = unique(
    projects.flatMap((project) => [
      `${project.name}: ${project.status}`,
      ...project.bullets.slice(0, 2),
    ])
  ).slice(0, 8);

  const lastJobMatches = extractKeywordMatches(lastJobDescription);
  const skills = unique([
    ...projects.flatMap((project) => project.stack),
    'Java',
    'SQL',
    'React',
    'TypeScript',
    'DSA',
    'Git',
  ]);

  const matchingKeywords = unique(lastJobMatches.filter((keyword) => skills.some((skill) => skill.toLowerCase().includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(skill.toLowerCase()))));
  const missingKeywords = unique(lastJobMatches.filter((keyword) => !matchingKeywords.includes(keyword)));

  return {
    resume,
    selectedResumeVersion: selectedVersion,
    lastJobDescription: trim(lastJobDescription, 900),
    currentTargetCompany: applications[0]?.company || 'General placement target',
    currentTargetRole: resume.targetRole || 'SWE',
    atsScore: calcResumeScore(state),
    scoreReason: resume.sections.projects < 70 ? 'Projects need stronger proof points.' : 'Resume is structurally solid with room for targeting.',
    projects,
    applications,
    skills,
    missingKeywords,
    matchingKeywords,
    projectHighlights,
    versionNotes: [
      `Version ${selectedVersion} kept placement-first.`,
      `Target role: ${resume.targetRole || 'SWE'}.`,
      lastJobDescription ? `Job description length: ${lastJobDescription.length} chars.` : 'No target job pasted yet.',
    ],
  };
}

export function buildLocalJobAnalysis(jobDescription: string, resumeState: ResumeStudioContext): ResumeJobAnalysis {
  const jdKeywords = extractKeywordMatches(jobDescription);
  const matchingKeywords = jdKeywords.filter((kw) => resumeState.skills.some((skill) => skill.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(skill.toLowerCase())));
  const missingKeywords = jdKeywords.filter((kw) => !matchingKeywords.includes(kw));
  const estimatedMatchScore = Math.max(20, Math.min(95, Math.round(45 + matchingKeywords.length * 7 - missingKeywords.length * 4 + (resumeState.atsScore - 60) * 0.4)));

  const roleTitle = /(?:for|role|position)\s+([A-Za-z0-9 /-]{3,40})/i.exec(jobDescription)?.[1] || resumeState.currentTargetRole;

  return {
    roleTitle: trim(titleCase(roleTitle), 60),
    requiredSkills: unique(jdKeywords.slice(0, 8)),
    preferredSkills: unique(jdKeywords.slice(8, 14)),
    matchingKeywords,
    missingKeywords,
    estimatedMatchScore,
    recommendations: [
      missingKeywords[0] ? `Add or emphasize ${missingKeywords[0]} where truthful.` : 'Your resume already covers the core keywords well.',
      resumeState.projectHighlights[0] ? `Strengthen project proof using ${resumeState.projectHighlights[0]}.` : 'Add a project bullet with a measurable outcome.',
      'Keep the top third of the resume tightly matched to the target role.',
    ],
  };
}

export function buildLocalBulletGeneration(input: ResumeBulletRequest): ResumeBulletGeneration {
  const base = `${input.actionVerb} ${input.problemSolved}${input.techStack ? ` using ${input.techStack}` : ''}`;
  const company = input.targetCompany || 'target company';
  const role = input.roleType || 'SWE';
  const quantified = input.measurableImpact
    ? `${base}, resulting in ${input.measurableImpact}.`
    : `${base}; add a truthful metric placeholder if available.`;

  const variations = [
    `${input.projectName}: ${base}.`,
    `${input.projectName}: focused on ${input.techStack || 'relevant tech'} to support ${role} work at ${company}.`,
    `${input.projectName}: delivered a cleaner ${input.tone} story for placement reviews.`,
  ];

  return {
    input,
    variations,
    starVersion: `Situation: ${input.problemSolved}. Task: Improve ${input.projectName}. Action: ${input.actionVerb} the solution using ${input.techStack || 'the chosen stack'}. Result: ${input.measurableImpact || 'add a truthful result metric.'}`,
    atsVersion: `${input.actionVerb} ${input.projectName} using ${input.techStack || 'core stack'} to solve ${input.problemSolved}; aligned with ${role} expectations at ${company}.`,
    honestVersion: `${input.actionVerb} ${input.projectName} to address ${input.problemSolved}. Add a real metric if you have one; otherwise keep the impact concrete.`,
    quantifiedVersion: quantified,
  };
}

export function buildLocalRecruiterReview(resumeState: ResumeStudioContext, jobDescription: string): ResumeRecruiterReview {
  const missingCount = resumeState.missingKeywords.length + (jobDescription ? 0 : 2);
  const score = Math.max(35, Math.min(95, Math.round(resumeState.atsScore - missingCount * 2 + 8)));

  return {
    score,
    categories: [
      { label: 'First impression', score: Math.min(100, resumeState.resume.sections.formatting + 5), note: 'Formatting is readable and placement-friendly.' },
      { label: 'Technical credibility', score: Math.min(100, resumeState.resume.sections.skills + 5), note: 'Technical stack is present; tighten role-targeted wording.' },
      { label: 'Project depth', score: Math.min(100, resumeState.resume.sections.projects + 3), note: 'Projects are strong enough to expand with outcome detail.' },
      { label: 'Keyword match', score: Math.max(35, 100 - resumeState.missingKeywords.length * 5), note: resumeState.missingKeywords[0] ? `Missing keyword: ${resumeState.missingKeywords[0]}` : 'Keyword coverage is healthy.' },
      { label: 'Clarity', score: Math.min(100, resumeState.resume.sections.contact + resumeState.resume.sections.education) / 2, note: 'Keep sections compact and easy to scan.' },
    ],
    topFixes: [
      resumeState.missingKeywords[0] ? `Add ${resumeState.missingKeywords[0]} only if it is truthful.` : 'No obvious keyword gaps remain.',
      'Rewrite one project bullet with a stronger action verb and outcome.',
      'Keep the headline tightly aligned to the target role.',
      'Trim anything that does not support placement goals.',
      jobDescription ? 'Mirror the job description language in the top summary section.' : 'Paste a job description to tailor the top third of the resume.',
    ].slice(0, 5),
    recruiterQuestions: [
      `Why is ${resumeState.projects[0]?.name || 'your latest project'} the strongest proof of impact?`,
      'What tradeoff did you make while building your portfolio projects?',
      `Which tools from your resume did you actually use deeply rather than casually?`,
      'What makes you a fit for a SWE placement track right now?',
    ],
    suggestedPositioning: `Position yourself as a placement-ready ${resumeState.currentTargetRole || 'SWE'} candidate with strong project ownership, Java/DSA discipline, and practical product thinking.`,
  };
}

export function buildLocalInterviewQuestions(resumeState: ResumeStudioContext): ResumeInterviewQuestionGroup[] {
  const projectName = resumeState.projects[0]?.name || 'your top project';
  return [
    {
      category: 'Project Questions',
      questions: [
        {
          question: `Walk me through ${projectName} end to end.`,
          difficulty: 'medium',
          whyAsked: 'Interviewers want to hear ownership and decision making.',
          answerOutline: 'Start with problem, then architecture, tech stack, challenges, and measurable outcome.',
        },
        {
          question: 'What was the hardest bug or tradeoff in that project?',
          difficulty: 'medium',
          whyAsked: 'They want evidence of debugging maturity.',
          answerOutline: 'State the issue, what you tried, what failed, and the final fix.',
        },
      ],
    },
    {
      category: 'Java / DSA',
      questions: [
        {
          question: 'Explain the pattern behind your most recent LeetCode improvement.',
          difficulty: 'medium',
          whyAsked: 'They want to check algorithmic reasoning.',
          answerOutline: 'Name the pattern, intuition, complexity, and one pitfall.',
        },
        {
          question: 'How do arrays differ from ArrayList in Java?',
          difficulty: 'easy',
          whyAsked: 'This checks fundamentals and language fluency.',
          answerOutline: 'Mention fixed size, memory, and common operations.',
        },
      ],
    },
    {
      category: 'HR / Fit',
      questions: [
        {
          question: 'Why do you want this role and this company?',
          difficulty: 'easy',
          whyAsked: 'They want target-role clarity and motivation.',
          answerOutline: 'Connect placement goals, role type, and a genuine interest in the company.',
        },
        {
          question: 'What is one weakness you are actively improving?',
          difficulty: 'medium',
          whyAsked: 'They want self-awareness.',
          answerOutline: 'Be honest, show active improvement, and close with current progress.',
        },
      ],
    },
  ];
}

export function createScoreSnapshot(version: string, score: number, reason: string): ResumeScoreHistoryItem {
  return {
    id: `score-${Date.now()}`,
    date: new Date().toISOString(),
    score,
    reason,
    version,
  };
}

export function createTailoredVersionFromAnalysis(context: ResumeStudioContext, analysis: ResumeJobAnalysis): TailoredResumeVersion {
  return {
    id: `tailored-${Date.now()}`,
    name: `${analysis.roleTitle} Tailored`,
    targetCompany: analysis.recommendations[0] ? analysis.recommendations[0].slice(0, 28) : 'Target Company',
    targetRole: analysis.roleTitle || context.currentTargetRole,
    sourceVersion: context.selectedResumeVersion,
    summary: `Targeted for ${analysis.roleTitle}; match score ${analysis.estimatedMatchScore}%.`,
    createdAt: new Date().toISOString(),
    notes: analysis.recommendations.slice(0, 5),
  };
}
