import { Request, Response } from 'express';
import { providerRouter } from '../ai/router/providerRouter.js';
import {
  interviewFinalReviewRequestSchema,
  interviewNextQuestionRequestSchema,
  interviewScoreRequestSchema,
  interviewStartRequestSchema,
} from '../validators/interview.schema.js';

type InterviewMode = 'HR' | 'Technical' | 'Behavioral' | 'Product/Analyst' | 'German' | 'Company-Specific' | 'Resume-Based' | 'Rapid Fire';
type InterviewDifficulty = 'easy' | 'medium' | 'hard';

type InterviewCategoryScore = { label: string; score: number; note: string };

const trim = (value: string, limit = 240) => (value.length <= limit ? value : `${value.slice(0, Math.max(0, limit - 12)).trimEnd()}...[trimmed]`);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

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

function isLikelyGermanMode(language: string | undefined, mode: InterviewMode) {
  return mode === 'German' || language === 'de';
}

function summarizeContext(context: Record<string, any>) {
  return {
    targetRole: trim(String(context.currentTargetRole || context.targetRole || 'SWE'), 80),
    companyName: trim(String(context.companyName || context.currentTargetCompany || 'General placement target'), 120),
    resumeSummary: trim(String(context.resumeSummary || context.resumeScoreSummary || 'Resume summary unavailable.'), 320),
    projectSummary: trim(String(context.projectSummary || context.projectHighlights?.join(' | ') || 'Project summary unavailable.'), 420),
    dsaSummary: trim(String(context.dsaSummary || context.dsaTopPatterns?.join(' | ') || 'DSA summary unavailable.'), 320),
    csCoreSummary: trim(String(context.csCoreSummary || context.csCoreTopTopics?.join(' | ') || 'CS Core summary unavailable.'), 320),
    germanSummary: trim(String(context.germanSummary || context.germanLevel || 'German summary unavailable.'), 320),
    placementSummary: trim(String(context.placementSummary || context.applicationSummary || 'Placement summary unavailable.'), 320),
    sessionNotes: trim(String(context.sessionNotes || context.note || 'No extra session notes.'), 280),
  };
}

function promptForMode(mode: InterviewMode, difficulty: InterviewDifficulty, companyName: string, roleTitle: string, ctx: ReturnType<typeof summarizeContext>, language?: 'en' | 'de') {
  const germanSuffix = isLikelyGermanMode(language, mode) ? ' Keep the question A1/A2 friendly and allow a short German answer.' : '';
  const roleHint = roleTitle ? ` for a ${roleTitle} role` : '';
  const companyHint = companyName ? ` at ${companyName}` : '';

  switch (mode) {
    case 'HR':
      return `Ask one ${difficulty} HR interview question${roleHint}${companyHint}. Focus on motivation, communication, teamwork, and placement readiness.${germanSuffix}`;
    case 'Technical':
      return `Ask one ${difficulty} technical interview question${roleHint}${companyHint}. Focus on Java, DSA, CS Core, or system reasoning depending on context.${germanSuffix}`;
    case 'Behavioral':
      return `Ask one ${difficulty} behavioral interview question${roleHint}${companyHint}. Use STAR structure and probe ownership, conflict, or learning.${germanSuffix}`;
    case 'Product/Analyst':
      return `Ask one ${difficulty} product/analyst interview question${roleHint}${companyHint}. Focus on user impact, tradeoffs, metrics, or prioritization.${germanSuffix}`;
    case 'German':
      return `Ask one ${difficulty} German interview practice question${roleHint}${companyHint}. Keep it A1/A2 and useful for introductions, study, or work life.${germanSuffix}`;
    case 'Company-Specific':
      return `Ask one ${difficulty} company-specific interview question${roleHint}${companyHint}. Use the context to make it feel tailored and realistic.${germanSuffix}`;
    case 'Resume-Based':
      return `Ask one ${difficulty} resume-based interview question${roleHint}${companyHint}. Focus on projects, achievements, missing keywords, and honest proof points.${germanSuffix}`;
    case 'Rapid Fire':
    default:
      return `Ask one short ${difficulty} rapid-fire interview question${roleHint}${companyHint}. Keep it punchy and easy to answer in under a minute.${germanSuffix}`;
  }
}

function localStartQuestion(mode: InterviewMode, difficulty: InterviewDifficulty, companyName: string, roleTitle: string, ctx: ReturnType<typeof summarizeContext>) {
  const companyHint = companyName && companyName !== 'General placement target' ? ` at ${companyName}` : '';
  const roleHint = roleTitle ? ` for ${roleTitle}` : '';

  const questionMap: Record<InterviewMode, string[]> = {
    HR: [
      `Walk me through your background and why you are preparing${roleHint}${companyHint}.`,
      `Why should we consider you for this role${roleHint}${companyHint}?`,
      `Tell me about yourself in a way that shows placement readiness${companyHint}.`,
    ],
    Technical: [
      `Explain a core Java or DSA concept you expect to face${roleHint}${companyHint}.`,
      `How would you approach a coding problem when the optimal pattern is not obvious?`,
      `What tradeoff would you make when optimizing for time versus space in a practical system${companyHint}?`,
    ],
    Behavioral: [
      `Tell me about a time you solved a difficult problem with limited guidance${companyHint}.`,
      `Describe a time you received criticism and how you responded${companyHint}.`,
      `Tell me about a conflict or disagreement and how you handled it${companyHint}.`,
    ],
    'Product/Analyst': [
      `How would you decide which feature to build first for a user-facing product${companyHint}?`,
      `Tell me how you would measure success for a project like CareSync AI${companyHint}.`,
      `How do you balance user impact, engineering effort, and delivery risk${companyHint}?`,
    ],
    German: [
      `Introduce yourself in simple German, then translate it into English.${companyHint}`,
      `Give a short A1/A2 German introduction for a job interview.${companyHint}`,
      `Answer this in German: why are you learning the language?${companyHint}`,
    ],
    'Company-Specific': [
      `Why do you want to join ${companyName || 'this company'}${roleHint}?`,
      `What would you like to build or improve first if you joined ${companyName || 'this team'}${companyHint}?`,
      `How does your background fit the mission of ${companyName || 'the company'}${companyHint}?`,
    ],
    'Resume-Based': [
      `Walk me through your strongest project and why it matters${companyHint}.`,
      `What is the biggest gap or risk on your resume and how are you fixing it${companyHint}?`,
      `Which project bullet best proves you are ready for this role${roleHint}?`,
    ],
    'Rapid Fire': [
      `What is one thing you want interviewers to remember about you${companyHint}?`,
      `What is your strongest technical topic right now${companyHint}?`,
      `What is one weakness you are actively improving${companyHint}?`,
    ],
  };

  const bank = questionMap[mode];
  const question = bank[mode === 'Rapid Fire' ? (difficulty === 'hard' ? 1 : 0) : 0];

  return {
    question: trim(question, 220),
    followUpHint: mode === 'German'
      ? 'Keep the answer short, then expand only if asked.'
      : `Use the ${difficulty} level to stay specific and honest.`,
    focusAreas: pickFocusAreas(mode, ctx),
    scoringRubric: scoringRubricForMode(mode, difficulty),
  };
}

function localFollowUp(mode: InterviewMode, difficulty: InterviewDifficulty, question: string, answer: string, ctx: ReturnType<typeof summarizeContext>) {
  const answerLength = answer.trim().split(/\s+/).filter(Boolean).length;
  const weakHint = answerLength < 40 ? 'Add one concrete example, then close with the result.' : 'Trim fluff and keep the strongest example first.';

  const followUps: Record<InterviewMode, string[]> = {
    HR: [
      'What specific part of your experience makes you confident about this role?',
      'What is one thing you are still improving before interviews start?',
      'How do you stay consistent when preparation gets repetitive?',
    ],
    Technical: [
      'What edge case would you test first?',
      'Can you give the Java approach in one compact example?',
      'What is the time and space complexity?',
    ],
    Behavioral: [
      'What did you personally change after that experience?',
      'How would you handle the same situation differently now?',
      'What did you learn that changed your behavior going forward?',
    ],
    'Product/Analyst': [
      'What metric would prove that your decision was correct?',
      'What tradeoff did you make and why was it reasonable?',
      'How would you explain the impact to a non-technical stakeholder?',
    ],
    German: [
      'Can you repeat that more simply in German?',
      'Now add one short sentence about your current goal.',
      'Use a different verb and try again.',
    ],
    'Company-Specific': [
      'Which part of the company mission resonated most with you?',
      'What would you learn in the first 30 days?',
      'What makes this company a good next step for your growth?',
    ],
    'Resume-Based': [
      'Which numbers or proof points can make this answer stronger?',
      'What part of the project did you own personally?',
      'How would you tighten this into a 45-second answer?',
    ],
    'Rapid Fire': [
      'What is the shortest honest answer you can give?',
      'Say that in one line without losing the point.',
      'What is the most important keyword here?',
    ],
  };

  const bank = followUps[mode];
  return {
    question: trim(bank[(answerLength + question.length) % bank.length], 240),
    followUpHint: weakHint,
    focusAreas: pickFocusAreas(mode, ctx),
  };
}

function scoringRubricForMode(mode: InterviewMode, difficulty: InterviewDifficulty): string[] {
  const rubrics: Record<InterviewMode, string[]> = {
    HR: ['Clarity', 'Motivation', 'Confidence', 'Fit'],
    Technical: ['Correctness', 'Approach', 'Complexity', 'Pitfalls'],
    Behavioral: ['STAR structure', 'Ownership', 'Reflection', 'Outcome'],
    'Product/Analyst': ['User impact', 'Tradeoffs', 'Metrics', 'Prioritization'],
    German: ['Vocabulary', 'Grammar', 'Pronunciation', 'Fluency'],
    'Company-Specific': ['Research', 'Fit', 'Specificity', 'Interest'],
    'Resume-Based': ['Proof', 'Ownership', 'Metrics', 'Honesty'],
    'Rapid Fire': ['Speed', 'Concision', 'Accuracy', 'Confidence'],
  };

  const base = rubrics[mode];
  return difficulty === 'hard' ? [...base, 'Depth'] : base;
}

function pickFocusAreas(mode: InterviewMode, ctx: ReturnType<typeof summarizeContext>) {
  const byMode: Record<InterviewMode, string[]> = {
    HR: [ctx.targetRole, ctx.placementSummary, 'confidence'],
    Technical: [ctx.dsaSummary, ctx.csCoreSummary, ctx.projectSummary],
    Behavioral: [ctx.projectSummary, 'ownership', 'learning'],
    'Product/Analyst': [ctx.projectSummary, 'user impact', 'metrics'],
    German: [ctx.germanSummary, 'A1/A2 basics', 'simple answers'],
    'Company-Specific': [ctx.companyName, ctx.resumeSummary, ctx.placementSummary],
    'Resume-Based': [ctx.resumeSummary, ctx.projectSummary, ctx.dsaSummary],
    'Rapid Fire': [ctx.targetRole, 'concision', 'confidence'],
  };

  return unique(byMode[mode]).slice(0, 3);
}

function localScoreAnswer(mode: InterviewMode, difficulty: InterviewDifficulty, answer: string, question: string, ctx: ReturnType<typeof summarizeContext>, voiceStats?: any): {
  overallScore: number;
  categoryScores: InterviewCategoryScore[];
  strengths: string[];
  improvements: string[];
  followUpQuestions: string[];
  answerSummary: string;
} {
  const lower = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const lengthScore = clamp(Math.round((Math.min(words.length, 160) / 160) * 25), 0, 25);
  const detailScore = clamp(answer.includes(':') || answer.includes('-') || /\b(first|then|finally|because|result)\b/i.test(answer) ? 20 : 12, 8, 20);
  const fillerCount = (answer.match(/\b(um+|uh+|like|you know|basically|actually)\b/gi) || []).length;
  const fillerPenalty = clamp(fillerCount * 2, 0, 12);
  const voiceBonus = voiceStats?.confidenceRating ? clamp((voiceStats.confidenceRating - 3) * 3, -6, 6) : 0;

  const modeKeywords: Record<InterviewMode, string[]> = {
    HR: ['motivation', 'team', 'learn', 'placement', 'role', 'growth'],
    Technical: ['java', 'algorithm', 'array', 'complexity', 'time', 'space', 'pattern', 'edge'],
    Behavioral: ['situation', 'action', 'result', 'learned', 'owned', 'conflict'],
    'Product/Analyst': ['user', 'metric', 'impact', 'tradeoff', 'priority', 'data'],
    German: ['ich', 'bin', 'habe', 'lerne', 'danke', 'bitte', 'weil'],
    'Company-Specific': [ctx.companyName.toLowerCase(), 'mission', 'product', 'team', 'value'],
    'Resume-Based': ['project', 'built', 'owned', 'result', 'resume', 'metric'],
    'Rapid Fire': ['quick', 'short', 'fast', 'simple', 'clear'],
  };

  const keywordHits = modeKeywords[mode].filter((keyword) => lower.includes(keyword)).length;
  const keywordScore = clamp(keywordHits * 8, 0, 24);
  const structureScore = clamp(/(?:^|\n|\.)\s*(?:first|second|third|finally|result|because)/i.test(answer) ? 15 : 10, 8, 15);
  const questionFit = clamp(question.length > 0 && answer.length > 0 ? 10 : 0, 0, 10);
  const difficultyBonus = difficulty === 'hard' ? 5 : difficulty === 'medium' ? 3 : 0;
  const overallScore = clamp(Math.round(lengthScore + detailScore + keywordScore + structureScore + questionFit + difficultyBonus - fillerPenalty + voiceBonus), 0, 100);

  const categoryScores: InterviewCategoryScore[] = scoringRubricForMode(mode, difficulty).slice(0, 4).map((label, index) => {
    const raw = [keywordScore, structureScore, detailScore, lengthScore, questionFit][index] || 0;
    return {
      label,
      score: clamp(Math.round(overallScore * 0.55 + raw * 1.8), 0, 100),
      note: noteForCategory(mode, label, answer, ctx),
    };
  });

  const strengths = [
    overallScore >= 70 ? 'Your answer has enough substance to work with.' : 'You are on the right track, but the answer needs more structure.',
    keywordHits > 0 ? 'You used some mode-specific language.' : 'You can add more role-specific keywords.',
    words.length > 40 ? 'You gave enough detail to support a follow-up.' : 'A little more depth would help here.',
  ].filter(Boolean);

  const improvements = [
    fillerCount > 0 ? 'Remove filler words and pause instead of padding the answer.' : 'Keep the answer clean and deliberate.',
    words.length < 40 ? 'Add one example and one result statement.' : 'Trim any repetitive phrasing.',
    mode === 'Technical' && !/complexity|time|space|java|pattern|edge/i.test(answer) ? 'Mention the approach and complexity explicitly.' : 'Close with a crisp takeaway.',
  ];

  const followUpQuestions = localFollowUp(mode, difficulty, question, answer, ctx).question
    ? [
        localFollowUp(mode, difficulty, question, answer, ctx).question,
        ...buildExtraFollowUps(mode, ctx).slice(0, 2),
      ].slice(0, 3)
    : buildExtraFollowUps(mode, ctx).slice(0, 3);

  return {
    overallScore,
    categoryScores,
    strengths: unique(strengths).slice(0, 3),
    improvements: unique(improvements).slice(0, 3),
    followUpQuestions,
    answerSummary: trim(answer, 360),
  };
}

function buildExtraFollowUps(mode: InterviewMode, ctx: ReturnType<typeof summarizeContext>) {
  const extra: Record<InterviewMode, string[]> = {
    HR: ['What makes your current preparation better than six months ago?', 'Which habit is helping your consistency most?'],
    Technical: ['Which data structure would you pick first and why?', 'What would you test for immediately?'],
    Behavioral: ['How did you change after that experience?', 'What feedback did you receive afterward?'],
    'Product/Analyst': ['What metric would you watch after launch?', 'What would you deprioritize and why?'],
    German: ['Can you make that shorter in German?', 'Now add one sentence about your studies or work.'],
    'Company-Specific': [`What do you know about ${ctx.companyName} that makes you want the role?`, 'What would your first contribution be?'],
    'Resume-Based': ['Which part of your project is hardest to explain?', 'How would you defend your strongest bullet?'],
    'Rapid Fire': ['What is the shortest strong answer?', 'What one fact should the interviewer remember?'],
  };

  return extra[mode];
}

function noteForCategory(mode: InterviewMode, label: string, answer: string, ctx: ReturnType<typeof summarizeContext>) {
  const lower = answer.toLowerCase();
  switch (label.toLowerCase()) {
    case 'clarity':
    case 'speed':
      return answer.length > 120 ? 'The answer is clear but a little long.' : 'The answer is concise enough.';
    case 'motivation':
    case 'fit':
      return lower.includes('company') || lower.includes('role') ? 'You connected the answer to the role.' : `Tie the answer more directly to ${ctx.targetRole}.`;
    case 'correctness':
      return /complexity|java|array|pattern|algorithm/.test(lower) ? 'You hit the core technical idea.' : 'Name the technical idea more directly.';
    case 'approach':
      return /first|then|finally|step/.test(lower) ? 'The approach is visible.' : 'Walk through the approach step by step.';
    case 'ownership':
      return /i | my | myself /.test(` ${lower} `) ? 'You showed personal ownership.' : 'Use more first-person ownership language.';
    case 'user impact':
      return /user|customer|impact|metric/.test(lower) ? 'You tied the work to impact.' : 'Mention user or business impact.';
    case 'grammar':
      return isLikelyGermanMode(undefined, mode) ? 'The German answer is readable.' : 'Watch sentence polish and grammar.';
    case 'proof':
      return /\d/.test(answer) ? 'You used a proof point or metric.' : 'Add a truthful metric or result if possible.';
    default:
      return ctx.sessionNotes || 'Stay direct and specific.';
  }
}

function localFinalReview(mode: InterviewMode, difficulty: InterviewDifficulty, history: Array<{ question: string; answer?: string; score?: number }>, scores: Array<{ question: string; score: number }>, ctx: ReturnType<typeof summarizeContext>, voiceStats?: any) {
  const scored = scores.length ? scores.map((item) => item.score) : history.map((item) => item.score || 0).filter(Boolean);
  const average = scored.length ? scored.reduce((sum, score) => sum + score, 0) / scored.length : 0;
  const overallScore = clamp(Math.round(average || 60), 0, 100);
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0]?.question || history[0]?.question || 'No question recorded yet.';
  const voiceNote = voiceStats?.confidenceRating ? `Voice confidence was ${voiceStats.confidenceRating}/5.` : 'Voice practice was not used.';

  return {
    overallScore,
    summary: trim(`You are building a solid ${mode.toLowerCase()} interview base. ${voiceNote} Keep answers tighter and add one concrete proof point each time.` , 420),
    strengths: unique([
      overallScore >= 70 ? 'You have a good baseline answer style.' : 'You are showing up and practicing consistently.',
      ctx.projectSummary ? 'Your projects give you real material to discuss.' : '',
      ctx.resumeSummary ? 'Your resume context is available for tailored answers.' : '',
    ]).slice(0, 3),
    gaps: unique([
      overallScore < 70 ? 'You need a stronger structure and more concise delivery.' : 'Keep refining polish and precision.',
      weakest ? `The weakest area is around: ${trim(weakest, 100)}` : '',
      mode === 'Technical' ? 'Mention approach, complexity, and pitfalls more explicitly.' : '',
    ]).slice(0, 3),
    actionPlan: [
      'Do one more round with the same mode and a lighter difficulty.',
      mode === 'Technical' ? 'Practice answering in Pattern -> Intuition -> Java -> Complexity format.' : 'Practice answering in STAR format with one result.',
      mode === 'German' ? 'Repeat your answer in A1/A2 German twice out loud.' : 'Rewrite one answer into a 45-second version.',
    ],
    recommendedNextMode: mode === 'Rapid Fire' ? 'HR' : mode === 'HR' ? 'Behavioral' : mode === 'German' ? 'German' : 'Rapid Fire',
  };
}

async function askAI(systemPrompt: string, userPrompt: string, aiSettings?: { provider?: string; model?: string }) {
  const result = await providerRouter.chat({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    preferredProvider: aiSettings?.provider as any,
    model: aiSettings?.model,
    temperature: 0.45,
    maxTokens: 900,
  } as any);

  return result;
}

function withMeta(payload: Record<string, any>, result?: { metadata?: { provider?: string; model?: string } }, fallbackProvider = 'local', fallbackModel = 'rule-based') {
  return {
    ...payload,
    providerUsed: result?.metadata?.provider || fallbackProvider,
    modelUsed: result?.metadata?.model || fallbackModel,
  };
}

export async function handleInterviewStart(req: Request, res: Response): Promise<void> {
  const parsed = interviewStartRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid interview start request.' });
    return;
  }

  const { mode, difficulty, companyName, roleTitle, language, context, aiSettings } = parsed.data;
  const compactContext = summarizeContext(context || {});

  const fallback = {
    sessionId: `interview-${Date.now()}`,
    mode,
    difficulty,
    companyName,
    roleTitle,
    question: localStartQuestion(mode, difficulty, companyName, roleTitle, compactContext).question,
    followUpHint: localStartQuestion(mode, difficulty, companyName, roleTitle, compactContext).followUpHint,
    focusAreas: localStartQuestion(mode, difficulty, companyName, roleTitle, compactContext).focusAreas,
    scoringRubric: localStartQuestion(mode, difficulty, companyName, roleTitle, compactContext).scoringRubric,
  };

  try {
    const prompt = promptForMode(mode, difficulty, companyName, roleTitle, compactContext, language);
    const reply = await askAI(
      'You are Shayla, a calm but sharp interview coach. Return only JSON with keys: question, followUpHint, focusAreas, scoringRubric. Keep the question short, realistic, and mode-appropriate.',
      `Mode: ${mode}\nDifficulty: ${difficulty}\nRole: ${roleTitle}\nCompany: ${companyName}\nContext: ${JSON.stringify(compactContext)}\nInstruction: ${prompt}`,
      aiSettings
    );
    const parsedReply = extractJson<Partial<typeof fallback>>(reply.reply || '');
    if (!parsedReply?.question) throw new Error('Invalid JSON response from AI.');
    res.json(withMeta({
      ...fallback,
      ...parsedReply,
      sessionId: fallback.sessionId,
    }, reply.metadata as any, aiSettings?.provider || 'ai', aiSettings?.model || 'router'));
  } catch {
    res.json(withMeta(fallback));
  }
}

export async function handleInterviewNextQuestion(req: Request, res: Response): Promise<void> {
  const parsed = interviewNextQuestionRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid interview follow-up request.' });
    return;
  }

  const { mode, difficulty, companyName, roleTitle, language, question, answer, context, history, aiSettings } = parsed.data;
  const compactContext = summarizeContext(context || {});
  const fallback = localFollowUp(mode, difficulty, question, answer, compactContext);

  try {
    const reply = await askAI(
      'You are Shayla, an interview coach. Return only JSON with keys: question, followUpHint, focusAreas. Ask one follow-up question that is based on the answer and remains concise.',
      `Mode: ${mode}\nDifficulty: ${difficulty}\nRole: ${roleTitle}\nCompany: ${companyName}\nQuestion: ${question}\nAnswer: ${answer}\nHistory: ${JSON.stringify(history)}\nContext: ${JSON.stringify(compactContext)}\nLanguage: ${language}\nNeed: follow-up question.`,
      aiSettings
    );
    const parsedReply = extractJson<Partial<typeof fallback>>(reply.reply || '');
    if (!parsedReply?.question) throw new Error('Invalid JSON response from AI.');
    res.json(withMeta({
      ...fallback,
      ...parsedReply,
    }, reply.metadata as any, aiSettings?.provider || 'ai', aiSettings?.model || 'router'));
  } catch {
    res.json(withMeta(fallback));
  }
}

export async function handleInterviewScoreAnswer(req: Request, res: Response): Promise<void> {
  const parsed = interviewScoreRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid interview scoring request.' });
    return;
  }

  const { mode, difficulty, companyName, roleTitle, language, question, answer, context, history, voiceStats, aiSettings } = parsed.data;
  const compactContext = summarizeContext(context || {});
  const fallback = localScoreAnswer(mode, difficulty, answer, question, compactContext, voiceStats);

  try {
    const reply = await askAI(
      'You are Shayla, scoring an interview answer. Return only JSON with keys: overallScore, categoryScores, strengths, improvements, followUpQuestions, answerSummary. Keep scores 0-100 and feedback actionable.',
      `Mode: ${mode}\nDifficulty: ${difficulty}\nRole: ${roleTitle}\nCompany: ${companyName}\nLanguage: ${language}\nQuestion: ${question}\nAnswer: ${answer}\nVoiceStats: ${JSON.stringify(voiceStats || {})}\nHistory: ${JSON.stringify(history)}\nContext: ${JSON.stringify(compactContext)}\nRubric: ${JSON.stringify(scoringRubricForMode(mode, difficulty))}`,
      aiSettings
    );
    const parsedReply = extractJson<Partial<typeof fallback>>(reply.reply || '');
    if (typeof parsedReply?.overallScore !== 'number') throw new Error('Invalid JSON response from AI.');
    res.json(withMeta({
      ...fallback,
      ...parsedReply,
    }, reply.metadata as any, aiSettings?.provider || 'ai', aiSettings?.model || 'router'));
  } catch {
    res.json(withMeta(fallback));
  }
}

export async function handleInterviewFinalReview(req: Request, res: Response): Promise<void> {
  const parsed = interviewFinalReviewRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid interview final review request.' });
    return;
  }

  const { mode, difficulty, companyName, roleTitle, language, context, history, scores, voiceStats, aiSettings } = parsed.data;
  const compactContext = summarizeContext(context || {});
  const fallback = localFinalReview(mode, difficulty, history, scores, compactContext, voiceStats);

  try {
    const reply = await askAI(
      'You are Shayla, reviewing an interview session. Return only JSON with keys: overallScore, summary, strengths, gaps, actionPlan, recommendedNextMode. Be honest, concise, and practical.',
      `Mode: ${mode}\nDifficulty: ${difficulty}\nRole: ${roleTitle}\nCompany: ${companyName}\nLanguage: ${language}\nHistory: ${JSON.stringify(history)}\nScores: ${JSON.stringify(scores)}\nVoiceStats: ${JSON.stringify(voiceStats || {})}\nContext: ${JSON.stringify(compactContext)}`,
      aiSettings
    );
    const parsedReply = extractJson<Partial<typeof fallback>>(reply.reply || '');
    if (typeof parsedReply?.overallScore !== 'number') throw new Error('Invalid JSON response from AI.');
    res.json(withMeta({
      ...fallback,
      ...parsedReply,
    }, reply.metadata as any, aiSettings?.provider || 'ai', aiSettings?.model || 'router'));
  } catch {
    res.json(withMeta(fallback));
  }
}

