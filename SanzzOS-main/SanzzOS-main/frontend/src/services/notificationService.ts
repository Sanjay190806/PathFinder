import { useCalendarStore, CalendarEvent } from '../app/store/useCalendarStore';
import { useNotificationStore, InAppNotification } from '../app/store/useNotificationStore';

// Keep track of fired notifications in memory to prevent duplicate triggers
const firedLocalNotifications = new Set<string>();

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      useNotificationStore.getState().updateSettings({ browserNotifications: granted });
      return granted;
    } catch {
      return false;
    }
  },

  isQuietHours(): boolean {
    const { settings } = useNotificationStore.getState();
    if (!settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentVal = currentHours * 60 + currentMins;

    const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
    const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);

    const startVal = startH * 60 + startM;
    const endVal = endH * 60 + endM;

    if (startVal <= endVal) {
      return currentVal >= startVal && currentVal <= endVal;
    } else {
      // Over midnight (e.g. 22:00 to 08:00)
      return currentVal >= startVal || currentVal <= endVal;
    }
  },

  trigger(
    title: string,
    message: string,
    options: {
      type: InAppNotification['type'];
      priority: InAppNotification['priority'];
      actionLabel?: string;
      actionPrompt?: string;
      eventId?: string;
    }
  ) {
    const { settings, addNotification } = useNotificationStore.getState();
    const uniqueKey = options.eventId ? `${options.eventId}-${options.type}` : `${Date.now()}-${title}`;

    if (firedLocalNotifications.has(uniqueKey)) {
      return;
    }
    firedLocalNotifications.add(uniqueKey);

    // 1. Log in-app notification
    addNotification({
      type: options.type,
      title,
      message,
      priority: options.priority,
      actionLabel: options.actionLabel,
      actionPrompt: options.actionPrompt,
    });

    // 2. Browser Push notification (if enabled, permitted, and not in quiet hours)
    if (
      settings.browserNotifications &&
      !this.isQuietHours() &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(title, {
          body: message,
          icon: '/icons/icon-192.png',
        });
      } catch (e) {
        console.warn('Failed to display browser notification:', e);
      }
    }
  },

  // Periodically check for upcoming time-sensitive events (Interviews, OAs, Milestones)
  checkUpcomingEvents() {
    const { events } = useCalendarStore.getState();
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    events.forEach((event: CalendarEvent) => {
      if (event.status === 'completed' || event.status === 'cancelled') return;

      const eventStart = new Date(event.start);
      // If event starts within the next hour and is in the future
      if (eventStart > now && eventStart <= oneHourFromNow) {
        const timeDiffMins = Math.round((eventStart.getTime() - now.getTime()) / 60000);
        let type: InAppNotification['type'] = 'info';
        let priority: InAppNotification['priority'] = 'medium';

        if (event.type === 'interview' || event.type === 'oa') {
          type = 'critical';
          priority = 'critical';
        } else if (event.type === 'milestone' || event.type === 'assignment') {
          type = 'warning';
          priority = 'high';
        }

        const typeLabel = event.type.toUpperCase();
        this.trigger(
          `Upcoming ${typeLabel}: ${event.title}`,
          `Starts in ${timeDiffMins} minutes at ${eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          {
            type,
            priority,
            eventId: event.id,
            actionLabel: event.type === 'interview' ? 'Start Mock Coach' : undefined,
            actionPrompt: event.type === 'interview' ? `Help me prepare for my upcoming interview: ${event.title}` : undefined,
          }
        );
      }
    });
  },
};

export default notificationService;
