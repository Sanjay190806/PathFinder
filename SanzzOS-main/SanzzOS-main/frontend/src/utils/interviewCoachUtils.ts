import { CareerState } from '../app/store/useCareerStore';
import { ResumeStudioContext } from '../types/resumeStudio';
import { Project, GermanLessonProgress } from '../types';
import {
  InterviewCoachContext,
  InterviewDifficulty,
  InterviewFinalReview,
  InterviewMode,
  InterviewVoiceStats,
} from '../types/interview';
import { buildResumeStudioContext } from './resumeStudioUtils';

const trim = (value: string, limit = 240): string => (value.length <= limit ? value : `${value.slice(0, Math.max(0, limit - 12)).trimEnd()}...[trimmed]`);
const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

function summarizeProjects(state: CareerState) {
  return (Object.values(state.projects || {}) as Project[])
    .slice(0, 4)
    .map((project) => `${project.name}: ${trim(project.description || '', 120)} | ${trim((project.bullets || []).slice(0, 2).join(' / '), 180)}`)
    .join(' || ');
}

function summarizeDSA(state: CareerState) {
  const patterns = Object.entries(state.dsaPatternMastery || {})
    .map(([pattern, data]) => `${pattern} (${data.mastery}, ${data.solvedCount || 0}/${data.totalCount || 0})`)
    .slice(0, 6);
  return patterns.length ? patterns.join(' || ') : 'No DSA patterns tracked yet.';
}

function summarizeCSCore(state: CareerState) {
  const topics = Object.entries(state.csCoreProgress || {})
    .flatMap(([subject, subjectTopics]) =>
      Object.entries(subjectTopics || {})
        .filter(([, topic]) => topic?.interviewReady || topic?.completed)
        .slice(0, 2)
        .map(([topicName, topic]) => `${subject} / ${topicName}: ${topic?.sampleQuestion || 'ready'}`))
    .slice(0, 6);
  return topics.length ? topics.join(' || ') : 'No CS Core topics marked interview-ready yet.';
}

function summarizeGerman(state: CareerState) {
  const completed = (Object.values(state.completedLessons || {}) as GermanLessonProgress[]).filter((lesson) => lesson.completed).length;
  const current = state.currentLessonId || 'german-1';
  const weakWords = (state.weakWords || []).slice(0, 6);
  return `Level ${state.germanLevel || 'A1 Beginner'} | completed lessons ${completed} | current lesson ${current} | weak words ${weakWords.join(', ') || 'none'}`;
}

function summarizePlacement(state: CareerState, studio: ResumeStudioContext) {
  const apps = (state.applications || []).slice(0, 5);
  const interviewCount = apps.filter((app) => app.status === 'Interview' || app.status === 'OA').length;
  const offerCount = apps.filter((app) => app.status === 'Offer').length;
  return `Applications ${apps.length} | interviews ${interviewCount} | offers ${offerCount} | ATS ${studio.atsScore}% | target role ${studio.currentTargetRole}`;
}

export function buildInterviewCoachContext(
  careerState: CareerState,
  options?: {
    selectedResumeVersion?: string;
    lastJobDescription?: string;
    mode?: InterviewMode;
    companyName?: string;
    roleTitle?: string;
  }
): InterviewCoachContext {
  const resumeStudio = buildResumeStudioContext(
    careerState,
    options?.selectedResumeVersion || careerState.resume.version || '1.0',
    options?.lastJobDescription || ''
  );

  const mode = options?.mode || 'HR';
  const companyName = options?.companyName || resumeStudio.currentTargetCompany || 'General placement target';
  const roleTitle = options?.roleTitle || resumeStudio.currentTargetRole || 'SWE';

  return {
    targetRole: trim(roleTitle, 80),
    companyName: trim(companyName, 120),
    selectedResumeVersion: trim(options?.selectedResumeVersion || careerState.resume.version || '1.0', 40),
    resumeSummary: trim(
      `ATS ${resumeStudio.atsScore}% | reason: ${resumeStudio.scoreReason} | missing: ${resumeStudio.missingKeywords.slice(0, 5).join(', ') || 'none'} | highlights: ${resumeStudio.projectHighlights.slice(0, 4).join(' / ') || 'none'}`,
      420
    ),
    projectSummary: trim(summarizeProjects(careerState), 520),
    dsaSummary: trim(summarizeDSA(careerState), 420),
    csCoreSummary: trim(summarizeCSCore(careerState), 420),
    germanSummary: trim(summarizeGerman(careerState), 360),
    placementSummary: trim(summarizePlacement(careerState, resumeStudio), 420),
    sessionNotes: trim(
      mode === 'German'
        ? 'Keep the session A1/A2 friendly and let the user answer in short bursts.'
        : mode === 'Technical'
          ? 'Prioritize Java, DSA patterns, CS Core, and honest depth.'
          : 'Keep the session practical, placement-focused, and concise.',
      260
    ),
  };
}

export function formatInterviewContextForPrompt(context: InterviewCoachContext): string {
  return [
    `Target role: ${context.targetRole}`,
    `Company: ${context.companyName}`,
    `Resume: ${context.resumeSummary}`,
    `Projects: ${context.projectSummary}`,
    `DSA: ${context.dsaSummary}`,
    `CS Core: ${context.csCoreSummary}`,
    `German: ${context.germanSummary}`,
    `Placement: ${context.placementSummary}`,
    `Notes: ${context.sessionNotes}`,
  ].join('\n');
}

export function buildInterviewSessionId(): string {
  return `interview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function countFillerWords(text: string): number {
  return (text.match(/\b(um+|uh+|like|you know|basically|actually)\b/gi) || []).length;
}

export function deriveVoiceStats(transcript: string, startTime: number, confidenceRating = 3): InterviewVoiceStats {
  const durationMs = Math.max(0, Date.now() - startTime);
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = durationMs > 0 ? Math.round((wordCount / durationMs) * 60000) : 0;
  return {
    speakingDurationMs: durationMs,
    wordCount,
    wordsPerMinute,
    fillerWordCount: countFillerWords(transcript),
    confidenceRating,
    transcriptPreview: trim(transcript, 180),
  };
}

export function buildLocalInterviewStarter(
  mode: InterviewMode,
  difficulty: InterviewDifficulty,
  companyName: string,
  roleTitle: string,
  context: InterviewCoachContext
) {
  const baseQuestion = {
    HR: `Walk me through your background and why you are preparing for ${roleTitle} roles${companyName ? ` at ${companyName}` : ''}.`,
    Technical: `Explain a Java or DSA concept you expect to face${roleTitle ? ` for ${roleTitle}` : ''}${companyName ? ` at ${companyName}` : ''}.`,
    Behavioral: `Tell me about a time you solved a difficult problem with limited guidance${companyName ? ` in a placement-style setting at ${companyName}` : ''}.`,
    'Product/Analyst': `How would you decide what feature or improvement to prioritize first${companyName ? ` for ${companyName}` : ''}?`,
    German: `Introduce yourself in simple German, then translate it into English.`,
    'Company-Specific': `Why do you want to join ${companyName || 'this company'} as a ${roleTitle}?`,
    'Resume-Based': `Walk me through your strongest project and why it matters for ${roleTitle} roles.`,
    'Rapid Fire': `What is one thing you want the interviewer to remember about you${companyName ? ` at ${companyName}` : ''}?`,
  }[mode];

  return {
    question: trim(baseQuestion, 220),
    followUpHint: difficulty === 'hard' ? 'Answer directly, then add one supporting proof point.' : 'Keep it short and honest.',
    focusAreas: [context.targetRole, context.projectSummary, context.dsaSummary].filter(Boolean).slice(0, 3),
    scoringRubric: mode === 'German'
      ? ['Vocabulary', 'Grammar', 'Pronunciation', 'Fluency']
      : mode === 'Technical'
        ? ['Correctness', 'Approach', 'Complexity', 'Pitfalls']
        : ['Clarity', 'Structure', 'Relevance', 'Confidence'],
  };
}

export function buildLocalInterviewFollowUp(
  mode: InterviewMode,
  difficulty: InterviewDifficulty,
  question: string,
  answer: string,
  context: InterviewCoachContext
) {
  const banks: Record<InterviewMode, string[]> = {
    HR: ['What makes you the right fit right now?', 'What are you improving before the next interview?', 'How do you stay consistent when preparation gets boring?'],
    Technical: ['What edge case would you test first?', 'What is the time and space complexity?', 'Can you explain the Java approach more cleanly?'],
    Behavioral: ['What did you personally change after that experience?', 'How would you handle it differently now?', 'What did you learn that changed your behavior?'],
    'Product/Analyst': ['What metric would prove success?', 'What tradeoff did you make and why?', 'How would you explain the decision to a non-technical stakeholder?'],
    German: ['Can you say that more simply in German?', 'Add one sentence about your studies or work.', 'Try the answer again with one new verb.'],
    'Company-Specific': [`What do you know about ${context.companyName} that makes you want this role?`, 'What would your first 30-day contribution look like?', 'Which company value fits you best?'],
    'Resume-Based': ['Which project detail can you prove most strongly?', 'How would you tighten this to 45 seconds?', 'Which metric or outcome would strengthen this?'],
    'Rapid Fire': ['What is the shortest honest answer?', 'What is the most important keyword here?', 'Give the answer in one line.'],
  };

  const bank = banks[mode];
  const answerLength = answer.trim().split(/\s+/).filter(Boolean).length;
  return {
    question: trim(bank[(answerLength + question.length) % bank.length], 220),
    followUpHint: difficulty === 'hard' ? 'Stay specific and direct.' : 'Add one example, then stop.',
    focusAreas: [context.targetRole, context.companyName, context.sessionNotes].filter(Boolean).slice(0, 3),
  };
}

export function buildLocalInterviewScore(
  mode: InterviewMode,
  difficulty: InterviewDifficulty,
  question: string,
  answer: string,
  context: InterviewCoachContext,
  voiceStats?: Partial<InterviewVoiceStats>
) {
  const lower = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const fillerCount = countFillerWords(answer);
  const keywordBank: Record<InterviewMode, string[]> = {
    HR: ['role', 'team', 'placement', 'growth', 'motivation'],
    Technical: ['java', 'complexity', 'pattern', 'algorithm', 'array', 'tree', 'hash'],
    Behavioral: ['situation', 'action', 'result', 'learned', 'owned'],
    'Product/Analyst': ['user', 'metric', 'impact', 'tradeoff', 'prioritize'],
    German: ['ich', 'bin', 'habe', 'lerne', 'bitte', 'danke'],
    'Company-Specific': [context.companyName.toLowerCase(), 'mission', 'product', 'team'],
    'Resume-Based': ['project', 'built', 'owned', 'result', 'metric'],
    'Rapid Fire': ['short', 'quick', 'clear', 'simple'],
  };

  const keywordHits = keywordBank[mode].filter((keyword) => lower.includes(keyword)).length;
  const structure = /(?:\bfirst\b|\bthen\b|\bfinally\b|\bbecause\b|\bresult\b)/i.test(answer) ? 18 : 12;
  const detail = Math.min(24, Math.round((Math.min(words.length, 140) / 140) * 24));
  const keywordScore = Math.min(24, keywordHits * 8);
  const confidence = voiceStats?.confidenceRating ? Math.max(-6, Math.min(6, (voiceStats.confidenceRating - 3) * 3)) : 0;
  const penalty = Math.min(12, fillerCount * 2);
  const difficultyBonus = difficulty === 'hard' ? 5 : difficulty === 'medium' ? 3 : 1;
  const overallScore = Math.max(0, Math.min(100, Math.round(detail + structure + keywordScore + difficultyBonus + confidence - penalty + 18)));

  return {
    overallScore,
    categoryScores: [
      { label: mode === 'German' ? 'Vocabulary' : 'Clarity', score: Math.max(0, Math.min(100, overallScore - 5)), note: words.length > 25 ? 'The answer has enough length to work with.' : 'You can add one more concrete detail.' },
      { label: mode === 'Technical' ? 'Approach' : mode === 'Behavioral' ? 'Structure' : 'Relevance', score: Math.max(0, Math.min(100, overallScore - 2)), note: keywordHits > 0 ? 'You used mode-specific language.' : 'Add more role-specific language.' },
      { label: mode === 'Technical' ? 'Complexity' : mode === 'Product/Analyst' ? 'Impact' : 'Confidence', score: Math.max(0, Math.min(100, overallScore + (voiceStats?.confidenceRating || 3) - 3)), note: fillerCount > 0 ? 'Reduce filler words.' : 'Delivery is reasonably clean.' },
      { label: mode === 'Technical' ? 'Pitfalls' : mode === 'Resume-Based' ? 'Proof' : 'Fit', score: Math.max(0, Math.min(100, overallScore - 8)), note: mode === 'Technical' ? 'Mention edge cases explicitly.' : 'Tie the answer more tightly to the role.' },
    ],
    strengths: [
      overallScore >= 70 ? 'Your answer is solid enough to refine.' : 'You are practicing with real interview intent.',
      keywordHits > 0 ? 'You touched on the right topic language.' : 'The core idea is there even if the wording is generic.',
      words.length > 40 ? 'You gave enough detail to support a follow-up.' : 'The answer is short enough to tighten quickly.',
    ].filter(Boolean).slice(0, 3),
    improvements: [
      fillerCount > 0 ? 'Cut filler words and pause instead of padding.' : 'Keep the delivery clean and deliberate.',
      words.length < 40 ? 'Add one example and one result.' : 'Trim repeated phrasing and get to the point faster.',
      mode === 'Technical' && !/complexity|java|pattern|edge|time|space/i.test(lower) ? 'Mention approach and complexity explicitly.' : 'Close with a crisp takeaway.',
    ].slice(0, 3),
    followUpQuestions: [
      buildLocalInterviewFollowUp(mode, difficulty, question, answer, context).question,
      ...buildLocalInterviewFollowUp(mode, difficulty, question, answer, context).focusAreas.slice(0, 2).map((focus) => `What part of ${focus} matters most here?`),
    ].slice(0, 3),
    answerSummary: trim(answer, 320),
  };
}

export function buildLocalInterviewFinalReview(
  mode: InterviewMode,
  difficulty: InterviewDifficulty,
  history: Array<{ question: string; answer?: string; score?: number }>,
  scores: Array<{ question: string; score: number }>,
  context: InterviewCoachContext,
  voiceStats?: Partial<InterviewVoiceStats>
): InterviewFinalReview {
  const numericScores = scores.length ? scores.map((item) => item.score) : history.map((item) => item.score || 0).filter(Boolean);
  const average = numericScores.length ? numericScores.reduce((sum, value) => sum + value, 0) / numericScores.length : 60;
  const overallScore = Math.max(0, Math.min(100, Math.round(average)));
  const lowQuestion = [...scores].sort((a, b) => a.score - b.score)[0]?.question || history[0]?.question || 'No question recorded yet.';

  return {
    overallScore,
    summary: trim(
      `You have a usable ${difficulty} ${mode.toLowerCase()} interview base. ${voiceStats?.confidenceRating ? `Voice confidence was ${voiceStats.confidenceRating}/5.` : 'Voice practice was not used.'} Keep the next round tighter, with one proof point per answer.`,
      380
    ),
    strengths: unique([
      overallScore >= 70 ? 'You already have a solid baseline.' : 'You are showing up and practicing seriously.',
      context.projectSummary ? 'Your projects provide real material.' : '',
      context.resumeSummary ? 'Your resume context can guide tailored responses.' : '',
    ]).slice(0, 3),
    gaps: unique([
      overallScore < 70 ? 'Structure and concision need one more pass.' : 'You can still sharpen delivery and specificity.',
      `Weakest question: ${trim(lowQuestion, 90)}`,
      mode === 'Technical' ? 'Mention complexity and pitfalls more explicitly.' : '',
    ]).slice(0, 3),
    actionPlan: [
      'Do one more round with the same mode at a lighter difficulty.',
      mode === 'Technical' ? 'Use Pattern -> Intuition -> Java -> Complexity in every answer.' : 'Use STAR or a crisp problem-solution-result flow.',
      `Try the ${difficulty} difficulty again and tighten one answer at a time.`,
      mode === 'German' ? 'Repeat the answer once in simpler German.' : 'Rewrite one answer into a 45-second version.',
    ],
    recommendedNextMode: mode === 'Rapid Fire' ? 'HR' : mode === 'HR' ? 'Behavioral' : mode === 'German' ? 'German' : 'Rapid Fire',
  };
}
