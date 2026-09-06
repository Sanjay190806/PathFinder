import { Request, Response } from 'express';
import { providerRouter } from '../ai/router/providerRouter.js';
import {
  analyzeJobRequestSchema,
  bulletGenerationRequestSchema,
  interviewQuestionsRequestSchema,
  recruiterReviewRequestSchema,
} from '../validators/resume.schema.js';

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
  'Docker',
  'CI/CD',
  'Node.js',
  'MongoDB',
  'PostgreSQL',
  'Testing',
  'Leadership',
  'Problem Solving',
  'Analytics',
  'Python',
  'OOP',
];

const trim = (value: string, limit = 180) => (value.length <= limit ? value : `${value.slice(0, Math.max(0, limit - 12)).trimEnd()}...[trimmed]`);

const extractKeywords = (text: string) => KEYWORD_BANK.filter((keyword) => text.toLowerCase().includes(keyword.toLowerCase()));

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function extractJson<T>(text: string): T | null {
  const fenced = /```json\s*([\s\S]*?)```/i.exec(text);
  const source = fenced?.[1] || text;
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(source.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

function localAnalyze(jobDescription: string, resumeState: any) {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = unique([
    ...(resumeState.skills || []),
    ...(resumeState.matchingKeywords || []),
    ...(resumeState.projects || []).flatMap((project: any) => [project.name, ...(project.stack || [])]),
  ]);
  const matchingKeywords = unique(jobKeywords.filter((keyword) => resumeKeywords.some((skill) => skill.toLowerCase().includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(skill.toLowerCase()))));
  const missingKeywords = unique(jobKeywords.filter((keyword) => !matchingKeywords.includes(keyword)));
  const hasResumeData = Boolean(
    Number(resumeState.atsScore || 0) > 0
    || resumeKeywords.length > 0
    || Object.values(resumeState.resume?.sections || {}).some((value: any) => Number(value || 0) > 0)
  );
  const estimatedMatchScore = hasResumeData
    ? clamp(matchingKeywords.length * 10 - missingKeywords.length * 4 + Math.round(Number(resumeState.atsScore || 0) * 0.2), 0, 98)
    : 0;

  return {
    roleTitle: trim(/(?:for|role|position|as a)\s+([A-Za-z0-9 /-]{3,40})/i.exec(jobDescription)?.[1] || resumeState.currentTargetRole || 'SWE'),
    requiredSkills: unique(jobKeywords.slice(0, 8)),
    preferredSkills: unique(jobKeywords.slice(8, 14)),
    matchingKeywords,
    missingKeywords,
    estimatedMatchScore,
    recommendations: [
      missingKeywords[0] ? `Include ${missingKeywords[0]} where truthful.` : 'Core keywords already overlap well.',
      'Keep the first third of the resume tightly aligned to the target role.',
      'Strengthen one project bullet with outcome and ownership.',
    ],
  };
}

function localBullets(input: any) {
  const base = `${input.actionVerb} ${input.problemSolved}${input.techStack ? ` using ${input.techStack}` : ''}`;
  return {
    input,
    variations: [
      `${input.projectName}: ${base}.`,
      `${input.projectName}: built to support ${input.roleType || 'SWE'} work at ${input.targetCompany || 'the target company'}.`,
      `${input.projectName}: framed in a concise recruiter-friendly way.`,
    ],
    starVersion: `Situation: ${input.problemSolved}. Task: improve ${input.projectName}. Action: ${input.actionVerb} the solution${input.techStack ? ` using ${input.techStack}` : ''}. Result: ${input.measurableImpact || 'add a truthful metric if available.'}`,
    atsVersion: `${input.actionVerb} ${input.projectName} to address ${input.problemSolved}; aligned with ${input.roleType || 'SWE'} expectations.`,
    honestVersion: `${input.actionVerb} ${input.projectName} to solve ${input.problemSolved}. Keep any measurable impact truthful.`,
    quantifiedVersion: input.measurableImpact
      ? `${base}, resulting in ${input.measurableImpact}.`
      : `${base}; add a truthful quantified result placeholder if you have one.`,
  };
}

function localRecruiterReview(resumeState: any, jobDescription: string) {
  const missingCount = (resumeState.missingKeywords || []).length + (jobDescription ? 0 : 2);
  const baseScore = Number(resumeState.atsScore || 0);
  const score = baseScore > 0 ? clamp(Math.round(baseScore - missingCount * 2 + 6), 0, 96) : 0;
  const hasKeywordData = (resumeState.missingKeywords || []).length > 0 || (resumeState.matchingKeywords || []).length > 0;

  return {
    score,
    categories: [
      { label: 'First impression', score: clamp(Number(resumeState.resume?.sections?.formatting || 0), 0, 100), note: 'Formatting score appears after real resume data is entered.' },
      { label: 'Technical credibility', score: clamp(Number(resumeState.resume?.sections?.skills || 0), 0, 100), note: 'Technical credibility appears after skills or analysis data is entered.' },
      { label: 'Project depth', score: clamp(Number(resumeState.resume?.sections?.projects || 0), 0, 100), note: 'Project depth appears after project resume data is entered.' },
      { label: 'Keyword match', score: hasKeywordData ? clamp(100 - (resumeState.missingKeywords || []).length * 5, 0, 100) : 0, note: resumeState.missingKeywords?.[0] ? `Missing keyword: ${resumeState.missingKeywords[0]}` : 'Keyword coverage appears after resume analysis.' },
      { label: 'Clarity', score: clamp((Number(resumeState.resume?.sections?.contact || 0) + Number(resumeState.resume?.sections?.education || 0)) / 2, 0, 100), note: 'Clarity appears after contact and education data is entered.' },
    ],
    topFixes: [
      resumeState.missingKeywords?.[0] ? `Add ${resumeState.missingKeywords[0]} only if it is truthful.` : 'No major keyword gap is visible.',
      'Rewrite one project bullet with more ownership and outcome.',
      'Keep the headline role-specific.',
      'Trim anything that does not support placements.',
      jobDescription ? 'Mirror the job description language in the top summary.' : 'Paste a job description to tailor the top third of the resume.',
    ].slice(0, 5),
    recruiterQuestions: [
      `Why is ${resumeState.projects?.[0]?.name || 'your latest project'} your strongest example?`,
      'What hard tradeoff did you make during a project build?',
      'Which tools from the resume did you use deeply, not casually?',
      'Why should this company pick you for a placement track role?',
    ],
    suggestedPositioning: `Position yourself as a placement-ready ${resumeState.currentTargetRole || 'SWE'} candidate with practical project ownership and solid Java/DSA discipline.`,
  };
}

function localInterviewQuestions(resumeState: any) {
  const projectName = resumeState.projects?.[0]?.name || 'your top project';
  return [
    {
      category: 'Project Questions',
      questions: [
        {
          question: `Walk me through ${projectName} end to end.`,
          difficulty: 'medium',
          whyAsked: 'They want ownership and architecture clarity.',
          answerOutline: 'Start with the problem, then tech stack, decisions, challenges, and result.',
        },
        {
          question: 'What was the hardest bug or tradeoff?',
          difficulty: 'medium',
          whyAsked: 'They want debugging maturity and practical judgment.',
          answerOutline: 'State the issue, what failed, what you changed, and what you learned.',
        },
      ],
    },
    {
      category: 'Java / DSA',
      questions: [
        {
          question: 'Explain the pattern behind your latest DSA improvement.',
          difficulty: 'medium',
          whyAsked: 'They want algorithmic reasoning, not memorized code.',
          answerOutline: 'Name the pattern, intuition, complexity, and one pitfall.',
        },
        {
          question: 'How do arrays differ from ArrayList in Java?',
          difficulty: 'easy',
          whyAsked: 'They want fundamentals and Java fluency.',
          answerOutline: 'Mention fixed size, random access, and usage tradeoffs.',
        },
      ],
    },
    {
      category: 'HR / Fit',
      questions: [
        {
          question: 'Why this role and why now?',
          difficulty: 'easy',
          whyAsked: 'They want motivation and role alignment.',
          answerOutline: 'Connect your placement goals with the company and role.',
        },
        {
          question: 'What is one weakness you are improving?',
          difficulty: 'medium',
          whyAsked: 'They want self-awareness and growth.',
          answerOutline: 'Be honest, describe the fix, and mention current progress.',
        },
      ],
    },
  ];
}

async function askAI(systemPrompt: string, userPrompt: string, preferredProvider?: string, model?: string) {
  const response = await providerRouter.chat({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    preferredProvider: preferredProvider as any,
    model,
    temperature: 0.5,
    maxTokens: 900,
    stream: false,
  } as any);

  return response.reply;
}

export async function handleAnalyzeJob(req: Request, res: Response) {
  const parsed = analyzeJobRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid resume analysis request.' });
  }

  const { jobDescription, resumeState, aiSettings } = parsed.data;
  const fallback = localAnalyze(jobDescription, resumeState);

  try {
    const reply = await askAI(
      'You are Shayla helping with resume tailoring. Return only JSON with keys: roleTitle, requiredSkills, preferredSkills, matchingKeywords, missingKeywords, estimatedMatchScore, recommendations.',
      `Resume snapshot: ${JSON.stringify(resumeState)}\n\nJob description: ${jobDescription}`,
      aiSettings?.provider,
      aiSettings?.model
    );
    const parsedReply = extractJson<Partial<typeof fallback>>(reply);
    if (!parsedReply) throw new Error('Invalid JSON response from AI.');

    return res.json({
      ...fallback,
      ...parsedReply,
      providerUsed: aiSettings?.provider || 'ai',
      modelUsed: aiSettings?.model || 'router',
    });
  } catch {
    return res.json({
      ...fallback,
      providerUsed: 'local',
      modelUsed: 'rule-based',
    });
  }
}

export async function handleGenerateBullets(req: Request, res: Response) {
  const parsed = bulletGenerationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid bullet generation request.' });
  }

  const { input, aiSettings } = parsed.data;
  const fallback = localBullets(input);

  try {
    const reply = await askAI(
      'You are Shayla helping rewrite resume bullets. Return only JSON with keys: variations, starVersion, atsVersion, honestVersion, quantifiedVersion. Never invent fake metrics.',
      `Bullet input: ${JSON.stringify(input)}`,
      aiSettings?.provider,
      aiSettings?.model
    );
    const parsedReply = extractJson<Partial<typeof fallback>>(reply);
    if (!parsedReply) throw new Error('Invalid JSON response from AI.');

    return res.json({
      ...fallback,
      ...parsedReply,
      providerUsed: aiSettings?.provider || 'ai',
      modelUsed: aiSettings?.model || 'router',
    });
  } catch {
    return res.json({
      ...fallback,
      providerUsed: 'local',
      modelUsed: 'rule-based',
    });
  }
}

export async function handleRecruiterReview(req: Request, res: Response) {
  const parsed = recruiterReviewRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid recruiter review request.' });
  }

  const { resumeState, jobDescription, aiSettings } = parsed.data;
  const fallback = localRecruiterReview(resumeState, jobDescription);

  try {
    const reply = await askAI(
      'You are Shayla acting like a strict but fair recruiter. Return only JSON with keys: score, categories, topFixes, recruiterQuestions, suggestedPositioning. Be honest and concise.',
      `Resume snapshot: ${JSON.stringify(resumeState)}\n\nJob description: ${jobDescription || 'none'}`,
      aiSettings?.provider,
      aiSettings?.model
    );
    const parsedReply = extractJson<Partial<typeof fallback>>(reply);
    if (!parsedReply) throw new Error('Invalid JSON response from AI.');

    return res.json({
      ...fallback,
      ...parsedReply,
      providerUsed: aiSettings?.provider || 'ai',
      modelUsed: aiSettings?.model || 'router',
    });
  } catch {
    return res.json({
      ...fallback,
      providerUsed: 'local',
      modelUsed: 'rule-based',
    });
  }
}

export async function handleInterviewQuestions(req: Request, res: Response) {
  const parsed = interviewQuestionsRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid interview questions request.' });
  }

  const { resumeState, aiSettings } = parsed.data;
  const fallback = localInterviewQuestions(resumeState);

  try {
    const reply = await askAI(
      'You are Shayla generating interview questions from a resume. Return only JSON with keys: groups or categories that contain question, difficulty, whyAsked, answerOutline. Use categories Project Questions, Java/DSA, SQL, CS Core, HR, Scenario, and Resume Gaps where relevant.',
      `Resume snapshot: ${JSON.stringify(resumeState)}`,
      aiSettings?.provider,
      aiSettings?.model
    );
    const parsedReply = extractJson<{ groups?: any[]; categories?: any[] }>(reply);
    if (!parsedReply) throw new Error('Invalid JSON response from AI.');

    const groups = parsedReply.groups || parsedReply.categories || fallback;
    return res.json({
      groups,
      providerUsed: aiSettings?.provider || 'ai',
      modelUsed: aiSettings?.model || 'router',
    });
  } catch {
    return res.json({
      groups: fallback,
      providerUsed: 'local',
      modelUsed: 'rule-based',
    });
  }
}
