import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { runMigrationForStore } from './migrations';

export interface InAppNotification {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionLabel?: string;
  actionPrompt?: string;
}

export interface NotificationSettings {
  studyReminders: boolean;
  germanReminders: boolean;
  interviewReminders: boolean;
  resumeReminders: boolean;
  projectReminders: boolean;
  revisionReminders: boolean;
  weekendReminders: boolean;
  achievementNotifications: boolean;
  browserNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  reminderFrequency: 'hourly' | 'daily' | 'twice-daily';
}

export interface WeeklyReport {
  weekKey: string;
  studyHours: number;
  tasksCompleted: number;
  xpGained: number;
  achievements: string[];
  weakestSkill: string;
  strongestSkill: string;
  aiRecommendation: string;
  generatedAt: string;
}

export interface MonthlyReport {
  monthKey: string;
  monthSummary: string;
  learningTrend: number[];
  placementReadinessTrend: number[];
  resumeProgress: number;
  projectProgress: number;
  consistencyScore: number;
  generatedAt: string;
}

export interface DailyAgenda {
  dayNum: number;
  focusTopic: string;
  timeSlots: { time: string; activity: string; duration: number }[];
  tasks: { id: string; text: string; completed: boolean; source: string }[];
  generatedAt: string;
}

interface NotificationStoreState {
  notifications: InAppNotification[];
  settings: NotificationSettings;
  weeklyReports: Record<string, WeeklyReport>;
  monthlyReports: Record<string, MonthlyReport>;
  agendas: Record<string, DailyAgenda>;
  addNotification: (notification: Omit<InAppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  saveWeeklyReport: (weekKey: string, report: WeeklyReport) => void;
  saveMonthlyReport: (monthKey: string, report: MonthlyReport) => void;
  saveDailyAgenda: (dayNum: number, agenda: DailyAgenda) => void;
  toggleAgendaTask: (dayNum: number, taskId: string) => void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  studyReminders: true,
  germanReminders: true,
  interviewReminders: true,
  resumeReminders: true,
  projectReminders: true,
  revisionReminders: true,
  weekendReminders: true,
  achievementNotifications: true,
  browserNotifications: false,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  reminderFrequency: 'daily',
};

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set) => ({
      notifications: [],
      settings: DEFAULT_SETTINGS,
      weeklyReports: {},
      monthlyReports: {},
      agendas: {},
      addNotification: (notif) =>
        set((state) => ({
          notifications: [
            {
              ...notif,
              id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 100), // Cap in-app notifications at 100
        })),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      saveWeeklyReport: (weekKey, report) =>
        set((state) => ({
          weeklyReports: { ...state.weeklyReports, [weekKey]: report },
        })),
      saveMonthlyReport: (monthKey, report) =>
        set((state) => ({
          monthlyReports: { ...state.monthlyReports, [monthKey]: report },
        })),
      saveDailyAgenda: (dayNum, agenda) =>
        set((state) => ({
          agendas: { ...state.agendas, [dayNum]: agenda },
        })),
      toggleAgendaTask: (dayNum, taskId) =>
        set((state) => {
          const agenda = state.agendas[dayNum];
          if (!agenda) return state;
          const updatedTasks = agenda.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          return {
            agendas: {
              ...state.agendas,
              [dayNum]: { ...agenda, tasks: updatedTasks },
            },
          };
        }),
    }),
    {
      name: 'sanzz_os_notification_store_v1',
      version: 1,
      migrate: (persistedState, version) => runMigrationForStore('sanzz_os_notification_store_v1', persistedState, version),
    }
  )
);
