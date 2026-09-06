import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MentorAutomationRule, MentorAutomationRun } from '../../types/aiMentor';
import { runMigrationForStore } from './migrations';

interface AutomationState {
  rules: MentorAutomationRule[];
  runs: MentorAutomationRun[];
  
  addRule: (rule: Omit<MentorAutomationRule, 'id'>) => void;
  updateRule: (id: string, updates: Partial<MentorAutomationRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  addRun: (run: Omit<MentorAutomationRun, 'id' | 'timestamp'>) => void;
  clearRunHistory: () => void;
}

const DEFAULT_RULES: MentorAutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Daily Study Checklist Alert',
    triggerType: 'daily_time',
    condition: 'time == "09:00"',
    actionType: 'create_notification',
    enabled: true,
    requiresConfirmation: false,
    cooldownMinutes: 1440,
  },
  {
    id: 'rule-2',
    name: 'No Zero Day Streak Guardian',
    triggerType: 'streak_at_risk',
    condition: 'lcStatus.length == 0 && time >= "21:00"',
    actionType: 'create_notification',
    enabled: true,
    requiresConfirmation: true,
    cooldownMinutes: 720,
  },
  {
    id: 'rule-3',
    name: 'Weekly Backup Snapshots Prompt',
    triggerType: 'backup_due',
    condition: 'daysSinceLastBackup >= 7',
    actionType: 'suggest_backup',
    enabled: true,
    requiresConfirmation: true,
    cooldownMinutes: 1440,
  }
];

export const useAutomationStore = create<AutomationState>()(
  persist(
    (set) => ({
      rules: DEFAULT_RULES,
      runs: [
        {
          id: 'run-1',
          ruleId: 'rule-1',
          ruleName: 'Daily Study Checklist Alert',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          details: 'Daily agenda reminder notification generated successfully.',
        }
      ],

      addRule: (rule) =>
        set((state) => ({
          rules: [
            ...state.rules,
            {
              ...rule,
              id: `rule-${Date.now()}`,
            },
          ],
        })),

      updateRule: (id, updates) =>
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteRule: (id) =>
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
        })),

      toggleRule: (id) =>
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
        })),

      addRun: (run) =>
        set((state) => ({
          runs: [
            {
              ...run,
              id: `run-${Date.now()}`,
              timestamp: new Date().toISOString(),
            },
            ...state.runs,
          ],
        })),

      clearRunHistory: () => set({ runs: [] }),
    }),
    {
      name: 'sanzz_os_automation_rules_v1',
      version: 1,
      migrate: (persistedState, version) => runMigrationForStore('sanzz_os_automation_rules_v1', persistedState, version),
    }
  )
);
