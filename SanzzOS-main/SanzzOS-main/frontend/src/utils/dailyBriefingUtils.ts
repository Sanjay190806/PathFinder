import { CompactAgentContext, ShaylaBriefingResult } from '../types/shaylaAgent';

const bullet = (items: string[]) => items.filter(Boolean).slice(0, 4);

export function buildLocalBriefing(kind: ShaylaBriefingResult['kind'], context: CompactAgentContext): ShaylaBriefingResult {
  const todayLabel = `Day ${context.day}`;
  const focus = context.todayProblems[0]?.title || context.currentTopic || 'Revision';
  const weakPattern = context.weakDsaPatterns[0] || 'None';
  const germanNote = context.germanLesson
    ? `${context.germanLesson.title} (${context.germanLevel || 'German track'})`
    : 'No active German lesson found';
  const appNote = context.applications[0]
    ? `${context.applications[0].company} - ${context.applications[0].role} (${context.applications[0].status})`
    : 'No active applications logged';

  if (kind === 'evening') {
    const summary = context.mood && context.energy
      ? `Evening review for ${todayLabel}: mood ${context.mood}/5, energy ${context.energy}/5, focus on finishing the small win list.`
      : `Evening review for ${todayLabel}: use the log to capture what moved and what stalled.`;

    return {
      kind,
      title: 'Evening Review',
      summary,
      focus,
      wins: bullet([
        context.completedTasks[0] ? `Completed: ${context.completedTasks[0]}` : 'Capture one completed task.',
        `Placement score sits at ${context.placementScore}%.`,
        context.recentLogs[0] ? `Recent status: ${context.recentLogs[0].status} on Day ${context.recentLogs[0].day}` : '',
      ]),
      risks: bullet([
        context.missedTasks[0] ? `Missed task signal: ${context.missedTasks[0]}` : '',
        context.energy != null && context.energy <= 2 ? 'Energy is low; recovery should be lighter tomorrow.' : '',
      ]),
      nextActions: bullet([
        'Write one sentence about what worked today.',
        'Pick tomorrow’s first task before sleep.',
        context.energy != null && context.energy <= 2 ? 'Sleep and restart with a lighter morning plan.' : 'Keep tomorrow’s first study block tiny and specific.',
      ]),
      sections: [
        { title: 'What moved', items: bullet([context.completedTasks[0] || 'No completed task recorded.', context.todayProblems[0]?.title || 'No DSA task captured.']) },
        { title: 'What needs care', items: bullet([context.missedTasks[0] || 'No missed task flagged.', weakPattern]) },
        { title: 'Trackers', items: bullet([`German: ${germanNote}`, `Applications: ${appNote}`, `Resume score: ${context.resumeScore}%`]) },
      ],
      generatedAt: new Date().toISOString(),
      fallbackUsed: true,
    };
  }

  if (kind === 'recovery') {
    return {
      kind,
      title: 'Recovery Plan',
      summary: `Recovery plan for ${todayLabel}: reduce friction, finish one high-value task, and avoid trying to win the whole week in one sitting.`,
      focus,
      wins: bullet([
        `Target the weakest DSA pattern: ${weakPattern}.`,
        context.csCoreDue ? `CS Core focus: ${context.csCoreDue.subject} - ${context.csCoreDue.topic}` : 'CS Core target not set.',
        context.germanLesson ? `German lesson: ${context.germanLesson.title}` : 'German can wait until energy returns.',
      ]),
      risks: bullet([
        context.distractions && context.distractions >= 4 ? 'Distraction level is high.' : '',
        context.energy != null && context.energy <= 2 ? 'Energy is low; keep blocks short.' : '',
      ]),
      nextActions: bullet([
        'Start with 10 minutes of the easiest task.',
        'Stop and reset after one small completion.',
        'Use Shayla again only after the first block is done.',
      ]),
      sections: [
        { title: 'Tiny win', items: bullet([context.todayProblems[0]?.title || 'Open the roadmap and pick the first task.']) },
        { title: 'Compassionate guardrail', items: bullet(['Do not try to make the whole day perfect.', 'One visible win is enough to restart momentum.']) },
      ],
      generatedAt: new Date().toISOString(),
      fallbackUsed: true,
    };
  }

  return {
    kind,
    title: 'Daily Briefing',
    summary: `Morning briefing for ${todayLabel}: stay placement-first, keep the first block small, and move one important thing forward.`,
    focus,
    wins: bullet([
      `Streak: ${context.streak} days.`,
      `Placement score: ${context.placementScore}%.`,
      context.todayProblems[0]?.title ? `Main DSA problem: ${context.todayProblems[0].title}` : 'No scheduled problem found.',
    ]),
    risks: bullet([
      context.missedTasks[0] ? `Catch-up needed: ${context.missedTasks[0]}` : '',
      weakPattern !== 'None' ? `Weak DSA pattern: ${weakPattern}` : '',
      context.resumeScore < 70 ? 'Resume needs attention soon.' : '',
    ]),
    nextActions: bullet([
      `Open ${focus} first.`,
      context.csCoreDue ? `Review CS Core: ${context.csCoreDue.subject} - ${context.csCoreDue.topic}.` : 'Pick one CS Core topic if the roadmap is light.',
      context.germanLesson ? `Do a short German touchpoint: ${context.germanLesson.title}.` : 'Keep German as a short optional side block.',
    ]),
    sections: [
      { title: 'Today at a glance', items: bullet([`Day ${context.day}`, `Mood ${context.mood ?? 'n/a'}/5`, `Energy ${context.energy ?? 'n/a'}/5`, `Distractions ${context.distractions ?? 0}`]) },
      { title: 'Placement focus', items: bullet([`DSA: ${focus}`, context.csCoreDue ? `CS Core: ${context.csCoreDue.topic}` : 'CS Core summary unavailable', `Resume: ${context.resumeScore}%`]) },
      { title: 'Language and projects', items: bullet([germanNote, context.projectProgress[0] ? `${context.projectProgress[0].name}: ${context.projectProgress[0].progress}%` : 'No project summary yet', appNote]) },
    ],
    generatedAt: new Date().toISOString(),
    fallbackUsed: true,
  };
}

export function briefingToMarkdown(result: ShaylaBriefingResult): string {
  const lines = [
    `**${result.title}**`,
    result.summary,
    '',
    `Focus: ${result.focus}`,
    `Wins: ${result.wins.join(' | ')}`,
    `Risks: ${result.risks.join(' | ') || 'None'}`,
    `Next: ${result.nextActions.join(' | ')}`,
  ];

  result.sections.forEach((section) => {
    lines.push('', `${section.title}: ${section.items.join(' | ')}`);
  });

  return lines.join('\n');
}
