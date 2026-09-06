import { Request, Response } from 'express';
import { providerRouter } from '../ai/router/providerRouter.js';

type AgentBriefingKind = 'morning' | 'evening' | 'recovery';

type CompactAgentContext = {
  day: number;
  streak: number;
  selectedDay: number;
  currentTopic: string;
  mood?: number;
  energy?: number;
  distractions?: number;
  completedTasks: string[];
  missedTasks: string[];
  weakDsaPatterns: string[];
  csCoreDue?: { subject: string; topic: string } | null;
  germanLesson?: { lessonId: string; title: string; level: string; objective: string; completed: boolean; locked: boolean } | null;
  germanLevel?: string;
  germanStreak?: number;
  resumeScore: number;
  placementScore: number;
  consistencyScore: number;
  skillRackSolved: number;
  sqlSolved: number;
  aptitudeSolved: number;
  projectProgress: Array<{ name: string; progress: number }>;
  applications: Array<{ company: string; role: string; status: string; stage?: string }>;
  recentLogs: Array<{ day: number; status: string; mood?: number; energy?: number; countsSummary: string }>;
  todayProblems: Array<{ title: string; difficulty: string; pattern: string }>;
  recentMissedTasks: string[];
  activeMode?: string;
};

type AgentRequestBody = {
  briefingType?: AgentBriefingKind;
  trackerContext?: CompactAgentContext;
  aiSettings?: {
    provider?: string;
    model?: string;
    mode?: string;
    streaming?: boolean;
  };
};

const trim = (value: string, limit = 240): string => {
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 12)).trimEnd()}...[trimmed]`;
};

const localBriefing = (kind: AgentBriefingKind, context: CompactAgentContext) => {
  const focus = context.todayProblems[0]?.title || context.currentTopic || 'Revision';
  const weakPattern = context.weakDsaPatterns[0] || 'None';
  const summaryByKind: Record<AgentBriefingKind, string> = {
    morning: `Morning briefing for Day ${context.day}: stay placement-first, keep the first block tiny, and finish one useful task.`,
    evening: `Evening review for Day ${context.day}: close the loop on what moved, then reduce tomorrow to one clean first step.`,
    recovery: `Recovery plan for Day ${context.day}: reduce friction, protect energy, and do one high-value task instead of forcing the whole day.`,
  };

  return {
    kind,
    title: kind === 'morning' ? 'Daily Briefing' : kind === 'evening' ? 'Evening Review' : 'Recovery Plan',
    summary: summaryByKind[kind],
    focus,
    wins: [
      `Streak: ${context.streak} days`,
      `Placement score: ${context.placementScore}%`,
      context.germanLesson ? `German lesson: ${context.germanLesson.title}` : 'German lesson not set',
    ].filter(Boolean),
    risks: [
      context.missedTasks[0] ? `Missed: ${context.missedTasks[0]}` : '',
      context.energy != null && context.energy <= 2 ? 'Energy is low' : '',
      weakPattern !== 'None' ? `Weak pattern: ${weakPattern}` : '',
    ].filter(Boolean),
    nextActions: [
      `Open ${focus} first`,
      context.csCoreDue ? `Review ${context.csCoreDue.subject} - ${context.csCoreDue.topic}` : 'Pick a CS Core topic',
      context.germanLesson ? `Touch German with ${context.germanLesson.title}` : 'Keep German as a short optional block',
    ].filter(Boolean),
    sections: [
      { title: 'Today', items: [`Mood ${context.mood ?? 'n/a'}/5`, `Energy ${context.energy ?? 'n/a'}/5`, `Distractions ${context.distractions ?? 0}`] },
      { title: 'Placement', items: [`DSA ${focus}`, context.csCoreDue ? `${context.csCoreDue.subject}: ${context.csCoreDue.topic}` : 'CS Core summary unavailable', `Resume ${context.resumeScore}%`] },
      { title: 'Language', items: [context.germanLesson ? context.germanLesson.title : 'No German lesson', `German level ${context.germanLevel || 'n/a'}`] },
    ],
  };
};

const makePrompt = (kind: AgentBriefingKind, context: CompactAgentContext) => {
  const focus = context.todayProblems[0]?.title || context.currentTopic || 'Revision';
  return `You are Shayla in agent mode. Be proactive, calm, and practical. Never overwhelm the user. Keep the output short, useful, and actionable.

Kind: ${kind}
Day: ${context.day}
Current topic: ${context.currentTopic}
Focus problem: ${focus}
Placement score: ${context.placementScore}
Resume score: ${context.resumeScore}
Consistency score: ${context.consistencyScore}
Mood: ${context.mood ?? 'n/a'}
Energy: ${context.energy ?? 'n/a'}
Distractions: ${context.distractions ?? 'n/a'}
Weak DSA patterns: ${JSON.stringify(context.weakDsaPatterns.slice(0, 4))}
CS Core due: ${JSON.stringify(context.csCoreDue || null)}
German lesson: ${JSON.stringify(context.germanLesson || null)}
Applications: ${JSON.stringify(context.applications.slice(0, 3))}
Recent logs: ${JSON.stringify(context.recentLogs.slice(0, 3))}
Today problems: ${JSON.stringify(context.todayProblems.slice(0, 3))}

Format as concise coaching with: title, summary, focus, wins, risks, next actions, and 3 short sections.`;
};

async function tryGenerateWithAI(kind: AgentBriefingKind, context: CompactAgentContext, aiSettings?: AgentRequestBody['aiSettings']) {
  const response = await providerRouter.chat({
    messages: [
      { role: 'system', content: makePrompt(kind, context) },
      { role: 'user', content: `Build the ${kind} agent briefing now.` }
    ],
    context: {
      day: context.day,
      focus: context.currentTopic,
      placementScore: context.placementScore,
      resumeScore: context.resumeScore,
      consistencyScore: context.consistencyScore
    },
    preferredProvider: aiSettings?.provider as any,
    model: aiSettings?.model,
    systemPrompt: makePrompt(kind, context),
    temperature: 0.6,
    maxTokens: 700,
    stream: false
  } as any);

  return {
    reply: trim(response.reply, 6000),
    providerUsed: response.metadata?.provider,
    modelUsed: response.metadata?.model,
    fallbackUsed: !!response.metadata?.fallbackUsed
  };
}

export async function handleDailyBriefing(req: Request, res: Response) {
  const started = Date.now();
  const body = req.body as AgentRequestBody;
  const context = body.trackerContext;
  const kind = body.briefingType || 'morning';

  if (!context) {
    return res.status(400).json({ error: 'Missing tracker context.' });
  }

  try {
    const aiResult = await tryGenerateWithAI(kind, context, body.aiSettings);
    const fallback = localBriefing(kind, context);
    const generatedAt = new Date().toISOString();
    return res.json({
      briefing: {
        ...fallback,
        summary: aiResult.reply || fallback.summary,
        generatedAt,
        fallbackUsed: aiResult.fallbackUsed
      },
      generatedAt,
      providerUsed: aiResult.providerUsed,
      modelUsed: aiResult.modelUsed,
      fallbackUsed: aiResult.fallbackUsed,
      latencyMs: Date.now() - started
    });
  } catch (error) {
    const fallback = localBriefing(kind, context);
    const generatedAt = new Date().toISOString();
    return res.json({
      briefing: {
        ...fallback,
        generatedAt,
        fallbackUsed: true
      },
      generatedAt,
      providerUsed: 'local',
      modelUsed: 'rule-based',
      fallbackUsed: true,
      latencyMs: Date.now() - started
    });
  }
}

export async function handleEveningReview(req: Request, res: Response) {
  const started = Date.now();
  const body = req.body as AgentRequestBody;
  const context = body.trackerContext;

  if (!context) {
    return res.status(400).json({ error: 'Missing tracker context.' });
  }

  try {
    const aiResult = await tryGenerateWithAI('evening', context, body.aiSettings);
    const fallback = localBriefing('evening', context);
    const generatedAt = new Date().toISOString();
    return res.json({
      review: {
        ...fallback,
        summary: aiResult.reply || fallback.summary,
        generatedAt,
        fallbackUsed: aiResult.fallbackUsed
      },
      generatedAt,
      providerUsed: aiResult.providerUsed,
      modelUsed: aiResult.modelUsed,
      fallbackUsed: aiResult.fallbackUsed,
      latencyMs: Date.now() - started
    });
  } catch (error) {
    const fallback = localBriefing('evening', context);
    const generatedAt = new Date().toISOString();
    return res.json({
      review: {
        ...fallback,
        generatedAt,
        fallbackUsed: true
      },
      generatedAt,
      providerUsed: 'local',
      modelUsed: 'rule-based',
      fallbackUsed: true,
      latencyMs: Date.now() - started
    });
  }
}
