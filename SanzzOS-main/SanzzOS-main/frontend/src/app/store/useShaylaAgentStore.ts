import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { runMigrationForStore } from './migrations';
import { ShaylaAgentHistoryItem, ShaylaAgentSettings, ShaylaSmartNotification } from '../../types/shaylaAgent';

interface ShaylaAgentState extends ShaylaAgentSettings {
  dismissedNotifications: string[];
  briefingHistory: ShaylaAgentHistoryItem[];
  eveningReviewHistory: ShaylaAgentHistoryItem[];
  smartNotificationLog: ShaylaSmartNotification[];
  setAgentModeEnabled: (enabled: boolean) => void;
  toggleAgentModeEnabled: () => void;
  setDailyBriefingEnabled: (enabled: boolean) => void;
  setEveningReviewEnabled: (enabled: boolean) => void;
  setSmartNotificationsEnabled: (enabled: boolean) => void;
  setAutoGenerateBriefingOnLaunch: (enabled: boolean) => void;
  setNotificationSensitivity: (level: ShaylaAgentSettings['notificationSensitivity']) => void;
  setAgentSubFeature: (
    key: 'enableRecoverySuggestions' | 'enableGermanNudges' | 'enableCsCoreNudges' | 'enableResumeNudges',
    enabled: boolean
  ) => void;
  dismissNotification: (notificationId: string) => void;
  clearDismissedNotifications: () => void;
  recordBriefing: (briefing: ShaylaAgentHistoryItem) => void;
  recordEveningReview: (review: ShaylaAgentHistoryItem) => void;
  recordSmartNotifications: (notifications: ShaylaSmartNotification[]) => void;
  clearHistory: () => void;
}

const DEFAULT_SETTINGS: ShaylaAgentSettings = {
  agentModeEnabled: true,
  dailyBriefingEnabled: true,
  eveningReviewEnabled: true,
  smartNotificationsEnabled: true,
  autoGenerateBriefingOnLaunch: false,
  notificationSensitivity: 'medium',
  enableRecoverySuggestions: true,
  enableGermanNudges: true,
  enableCsCoreNudges: true,
  enableResumeNudges: true,
};

export const useShaylaAgentStore = create<ShaylaAgentState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      dismissedNotifications: [],
      briefingHistory: [],
      eveningReviewHistory: [],
      smartNotificationLog: [],
      setAgentModeEnabled: (agentModeEnabled) => set({ agentModeEnabled }),
      toggleAgentModeEnabled: () => set((state) => ({ agentModeEnabled: !state.agentModeEnabled })),
      setDailyBriefingEnabled: (dailyBriefingEnabled) => set({ dailyBriefingEnabled }),
      setEveningReviewEnabled: (eveningReviewEnabled) => set({ eveningReviewEnabled }),
      setSmartNotificationsEnabled: (smartNotificationsEnabled) => set({ smartNotificationsEnabled }),
      setAutoGenerateBriefingOnLaunch: (autoGenerateBriefingOnLaunch) => set({ autoGenerateBriefingOnLaunch }),
      setNotificationSensitivity: (notificationSensitivity) => set({ notificationSensitivity }),
      setAgentSubFeature: (key, enabled) => set({ [key]: enabled } as Pick<ShaylaAgentState, typeof key>),
      dismissNotification: (notificationId) =>
        set((state) => ({
          dismissedNotifications: state.dismissedNotifications.includes(notificationId)
            ? state.dismissedNotifications
            : [...state.dismissedNotifications, notificationId],
        })),
      clearDismissedNotifications: () => set({ dismissedNotifications: [] }),
      recordBriefing: (briefing) =>
        set((state) => ({
          briefingHistory: [briefing, ...state.briefingHistory].slice(0, 20),
        })),
      recordEveningReview: (review) =>
        set((state) => ({
          eveningReviewHistory: [review, ...state.eveningReviewHistory].slice(0, 20),
        })),
      recordSmartNotifications: (notifications) =>
        set((state) => ({
          smartNotificationLog: [...notifications, ...state.smartNotificationLog].slice(0, 50),
        })),
      clearHistory: () =>
        set({
          briefingHistory: [],
          eveningReviewHistory: [],
          smartNotificationLog: [],
          dismissedNotifications: [],
        }),
    }),
    {
      name: 'sanju-shayla-agent-persist-v1',
      version: 141,
      migrate: (persistedState, version) => runMigrationForStore('sanju-shayla-agent-persist-v1', persistedState, version),
      partialize: (state) => ({
        agentModeEnabled: state.agentModeEnabled,
        dailyBriefingEnabled: state.dailyBriefingEnabled,
        eveningReviewEnabled: state.eveningReviewEnabled,
        smartNotificationsEnabled: state.smartNotificationsEnabled,
        autoGenerateBriefingOnLaunch: state.autoGenerateBriefingOnLaunch,
        notificationSensitivity: state.notificationSensitivity,
        enableRecoverySuggestions: state.enableRecoverySuggestions,
        enableGermanNudges: state.enableGermanNudges,
        enableCsCoreNudges: state.enableCsCoreNudges,
        enableResumeNudges: state.enableResumeNudges,
        dismissedNotifications: state.dismissedNotifications,
        briefingHistory: state.briefingHistory,
        eveningReviewHistory: state.eveningReviewHistory,
        smartNotificationLog: state.smartNotificationLog,
      }),
    }
  )
);
