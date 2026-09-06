import { useAutomationStore } from '../app/store/useAutomationStore';
import { useNotificationStore } from '../app/store/useNotificationStore';
import { useCalendarStore } from '../app/store/useCalendarStore';
import { riskDetectionService } from './riskDetectionService';

export const automationEngine = {
  // Evaluates active enabled rules and returns lists of runs triggered
  checkAndExecuteRules(): string[] {
    const store = useAutomationStore.getState();
    const notificationStore = useNotificationStore.getState();
    const calendarStore = useCalendarStore.getState();
    const activeRisks = riskDetectionService.detectRisks();

    const messagesTriggered: string[] = [];

    store.rules.forEach((rule) => {
      if (!rule.enabled) return;

      // Rate limit check (cooldown)
      const lastRun = rule.lastRunAt ? new Date(rule.lastRunAt).getTime() : 0;
      if (Date.now() - lastRun < rule.cooldownMinutes * 60 * 1000) {
        return;
      }

      let isTriggered = false;
      let details = '';

      // 1. Evaluate triggers
      if (rule.triggerType === 'streak_at_risk') {
        const streakRisk = activeRisks.find((r) => r.id === 'r-streak');
        if (streakRisk) {
          isTriggered = true;
          details = 'Streak preservation alert rule met.';
        }
      } else if (rule.triggerType === 'backup_due') {
        const backupRisk = activeRisks.find((r) => r.id === 'r-backup');
        if (backupRisk) {
          isTriggered = true;
          details = 'Local database backup interval warning rule met.';
        }
      } else if (rule.triggerType === 'daily_time') {
        // Mock daily cron time trigger checker
        isTriggered = true;
        details = 'Daily morning review check triggered.';
      }

      if (isTriggered) {
        // 2. Perform actions
        if (rule.requiresConfirmation) {
          // If confirmation is required, add a pending confirm nudge
          notificationStore.addNotification({
            title: `Confirm Action: ${rule.name}`,
            message: `Rule triggered: ${details}. Click confirm to schedule tasks.`,
            type: 'warning',
            priority: 'medium',
          });
          messagesTriggered.push(`Nudge queued for rule "${rule.name}"`);
        } else {
          // Direct execution
          if (rule.actionType === 'create_notification') {
            notificationStore.addNotification({
              title: rule.name,
              message: `System Alert: ${details}`,
              type: 'info',
              priority: 'low',
            });
          } else if (rule.actionType === 'create_calendar_event') {
            calendarStore.addEvent({
              title: `Suggested Study sprint - ${rule.name}`,
              start: new Date().toISOString(),
              end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              type: 'study',
              status: 'scheduled',
            });
          }
          messagesTriggered.push(`Executed action for rule "${rule.name}"`);
        }

        // Update run history and cooldown
        useAutomationStore.getState().updateRule(rule.id, {
          lastRunAt: new Date().toISOString(),
        });
        useAutomationStore.getState().addRun({
          ruleId: rule.id,
          ruleName: rule.name,
          status: 'completed',
          details: `Successfully triggered action: ${rule.actionType}. ${details}`,
        });
      }
    });

    return messagesTriggered;
  },
};
export default automationEngine;
