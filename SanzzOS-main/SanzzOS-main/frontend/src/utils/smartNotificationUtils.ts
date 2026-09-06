import { CompactAgentContext, ShaylaSmartNotification } from '../types/shaylaAgent';
import { useShaylaAgentStore } from '../app/store/useShaylaAgentStore';

const sensitivityWeight = (sensitivity: 'low' | 'medium' | 'high') => {
  if (sensitivity === 'low') return 2;
  if (sensitivity === 'high') return 0.5;
  return 1;
};

const pushNotification = (
  list: ShaylaSmartNotification[],
  type: ShaylaSmartNotification['type'],
  title: string,
  message: string,
  actionLabel: string | undefined,
  actionPrompt: string | undefined,
  severity: number,
  day: number
) => {
  list.push({
    id: `${day}-${title}-${list.length}`,
    type,
    title,
    message,
    actionLabel,
    actionPrompt,
    createdAt: new Date().toISOString(),
    severity,
    day,
  });
};

export function buildSmartNotifications(context: CompactAgentContext) {
  const settings = useShaylaAgentStore.getState();
  const notifications: ShaylaSmartNotification[] = [];
  const weight = sensitivityWeight(settings.notificationSensitivity);
  const lowEnergy = (context.energy ?? 3) <= 2;
  const highDistraction = (context.distractions ?? 0) >= 4;

  if (settings.enableCsCoreNudges && context.csCoreDue && context.consistencyScore < 70 * weight) {
    pushNotification(
      notifications,
      'warning',
      'CS Core check-in',
      `Shayla noticed ${context.csCoreDue.subject} needs attention: ${context.csCoreDue.topic}. Keep it as a short revision block today.`,
      'Ask Shayla to explain',
      `Explain the CS Core topic "${context.csCoreDue.topic}" for interview prep in simple terms.`,
      7,
      context.day
    );
  }

  if (settings.enableGermanNudges && context.germanLesson && !context.germanLesson.completed && context.germanStreak !== undefined && context.germanStreak < 3 * weight) {
    pushNotification(
      notifications,
      'info',
      'German touchpoint',
      `Your next German lesson is ${context.germanLesson.title}. A 5-minute review keeps the streak alive.`,
      'Start German lesson',
      `Open German lesson ${context.germanLesson.title} and review vocabulary, grammar, and one example.`,
      5,
      context.day
    );
  }

  if (settings.enableResumeNudges && context.resumeScore < 70 * weight) {
    pushNotification(
      notifications,
      'warning',
      'Resume needs a pass',
      `ATS readiness is at ${context.resumeScore}%. Shayla can help tighten the strongest weak section first.`,
      'Review resume',
      'Review my resume and tell me the single highest-impact improvement to make next.',
      6,
      context.day
    );
  }

  if (settings.enableRecoverySuggestions && (lowEnergy || highDistraction)) {
    pushNotification(
      notifications,
      'critical',
      'Recovery mode',
      lowEnergy
        ? 'Energy is low. Shift to a short block, then stop before burnout grows.'
        : 'Distraction is high. Reduce the session to one task and one timer.',
      'Create recovery plan',
      `Create a recovery plan for Day ${context.day}. Mood ${context.mood ?? 'n/a'}, energy ${context.energy ?? 'n/a'}, distractions ${context.distractions ?? 'n/a'}.`,
      8,
      context.day
    );
  }

  if (context.placementScore > 70 && context.completedTasks.length > 0) {
    pushNotification(
      notifications,
      'success',
      'Momentum is active',
      `Good work. You already logged ${context.completedTasks.length} completed day(s) recently.`,
      'Lock in tomorrow',
      'Help me lock in tomorrow with the smallest possible plan.',
      4,
      context.day
    );
  }

  return notifications
    .sort((a, b) => b.severity - a.severity)
    .slice(0, settings.notificationSensitivity === 'high' ? 6 : 4);
}
