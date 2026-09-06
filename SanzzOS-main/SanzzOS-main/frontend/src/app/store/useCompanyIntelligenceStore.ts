import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CompanyProfile, CompanyPrepPlan, PlacementStrategy } from '../../types/companyIntelligence';
import { DEFAULT_COMPANY_PROFILES } from '../../data/defaultCompanyProfiles';
import { runMigrationForStore } from './migrations';

interface CompanyIntelligenceState {
  companies: CompanyProfile[];
  prepPlans: Record<string, CompanyPrepPlan>;
  strategy: PlacementStrategy;
  addCompanyProfile: (profile: Omit<CompanyProfile, 'id' | 'lastUpdated'>) => void;
  updateCompanyProfile: (id: string, updates: Partial<CompanyProfile>) => void;
  deleteCompanyProfile: (id: string) => void;
  generatePrepPlan: (companyId: string, companyName: string, duration: number) => void;
  togglePlanTask: (companyId: string, dayNum: number) => void;
  updateStrategy: (updates: Partial<PlacementStrategy>) => void;
  updateCompanyReadiness: (companyId: string, score: number) => void;
}

export const useCompanyIntelligenceStore = create<CompanyIntelligenceState>()(
  persist(
    (set) => ({
      companies: DEFAULT_COMPANY_PROFILES,
      prepPlans: {},
      strategy: {
        priorityCompanies: [],
        readySoon: [],
        longTermTargets: [],
        activePipelines: {},
      },
      addCompanyProfile: (p) =>
        set((state) => ({
          companies: [
            ...state.companies,
            {
              ...p,
              id: `company-${Date.now()}`,
              lastUpdated: new Date().toISOString(),
            },
          ],
        })),
      updateCompanyProfile: (id, updates) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...updates,
                  lastUpdated: new Date().toISOString(),
                }
              : c
          ),
        })),
      deleteCompanyProfile: (id) =>
        set((state) => ({
          companies: state.companies.filter((c) => c.id !== id),
        })),
      generatePrepPlan: (companyId, companyName, duration) =>
        set((state) => {
          const tasks = [];
          for (let d = 1; d <= duration; d++) {
            tasks.push({
              dayNum: d,
              codingTask: d % 2 === 0 ? 'Solve 1 Medium DSA problem' : 'Complete 5 SkillRack challenges',
              aptitudeTask: `Practice quantitative aptitude pattern - day ${d}`,
              sqlTask: d % 3 === 0 ? 'Solve 2 SQL Joins queries' : 'Review database normal forms basics',
              theoryTask: d % 4 === 0 ? `Prepare one truthful ${companyName} project walkthrough` : 'Review Java collections API methods',
              completed: false,
            });
          }
          const plan: CompanyPrepPlan = {
            companyName,
            durationDays: duration,
            startDate: new Date().toISOString().substring(0, 10),
            dailyTasks: tasks,
          };
          return {
            prepPlans: {
              ...state.prepPlans,
              [companyId]: plan,
            },
          };
        }),
      togglePlanTask: (companyId, dayNum) =>
        set((state) => {
          const plan = state.prepPlans[companyId];
          if (!plan) return {};

          const updatedTasks = plan.dailyTasks.map((t) =>
            t.dayNum === dayNum ? { ...t, completed: !t.completed } : t
          );

          // Calculate next readiness score based on plan completion rate
          const completedCount = updatedTasks.filter((t) => t.completed).length;
          const completionRate = Math.round((completedCount / updatedTasks.length) * 100);

          const updatedCompanies = state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  readinessScore: Math.min(Math.max(completionRate, 0), 98),
                  lastUpdated: new Date().toISOString(),
                }
              : c
          );

          return {
            companies: updatedCompanies,
            prepPlans: {
              ...state.prepPlans,
              [companyId]: {
                ...plan,
                dailyTasks: updatedTasks,
              },
            },
          };
        }),
      updateStrategy: (updates) =>
        set((state) => ({
          strategy: {
            ...state.strategy,
            ...updates,
          },
        })),
      updateCompanyReadiness: (companyId, score) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? {
                  ...c,
                  readinessScore: score,
                  lastUpdated: new Date().toISOString(),
                }
              : c
          ),
        })),
    }),
    {
      name: 'sanzz_os_company_intelligence_v1',
      version: 2,
      migrate: (persistedState, version) => runMigrationForStore('sanzz_os_company_intelligence_v1', persistedState, version),
    }
  )
);
