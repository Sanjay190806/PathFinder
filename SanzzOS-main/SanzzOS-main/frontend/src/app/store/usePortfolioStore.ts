import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PortfolioVisibilitySettings, PortfolioProfile, PortfolioProjectCaseStudy, GitHubRepoChecklist, LinkedInPostDraft } from '../../types/portfolio';
import { runMigrationForStore } from './migrations';

interface PortfolioState {
  visibility: PortfolioVisibilitySettings;
  profile: PortfolioProfile;
  caseStudies: Record<string, PortfolioProjectCaseStudy>;
  githubRepos: GitHubRepoChecklist[];
  linkedinDrafts: LinkedInPostDraft[];
  
  updateVisibility: (updates: Partial<PortfolioVisibilitySettings>) => void;
  updateProfile: (updates: Partial<PortfolioProfile>) => void;
  saveCaseStudy: (projectKey: string, study: Omit<PortfolioProjectCaseStudy, 'id' | 'projectKey' | 'lastUpdated'>) => void;
  addGithubRepo: (repoName: string) => void;
  updateGithubRepo: (id: string, updates: Partial<GitHubRepoChecklist>) => void;
  deleteGithubRepo: (id: string) => void;
  addLinkedinDraft: (draft: Omit<LinkedInPostDraft, 'id' | 'createdAt'>) => void;
  deleteLinkedinDraft: (id: string) => void;
}

const DEFAULT_VISIBILITY: PortfolioVisibilitySettings = {
  profileSummary: 'private',
  skills: 'private',
  projects: 'private',
  resumeHighlights: 'private',
  achievements: 'private',
  certifications: 'private',
  githubLinks: 'private',
  demoLinks: 'private',
  contactLinks: 'private',
  caseStudies: 'private',
  interviewStories: 'private',
};

const DEFAULT_PROFILE: PortfolioProfile = {
  targetRole: 'AI Product Intern',
  recruiterBio: 'Passionate builder specializing in clinical AI prioritization dashboards and local-first adapters.',
  linkedinAbout: 'I build offline-first web applications using React, Zustand, and TypeScript, focusing on data-integrity and offline sync.',
  githubSummary: 'Senior placement preparation tracker. Core developer of CareSync AI clinical monitor and SmartEdu curriculum builders.',
  resumeSummary: 'Full-stack software developer with experience in progressive web apps, IndexedDB integrations, and state synchronization rules.',
  projectIntro: 'Showcasing three production-ready mock setups built using modular frameworks and responsive vanilla layouts.',
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      visibility: DEFAULT_VISIBILITY,
      profile: DEFAULT_PROFILE,
      caseStudies: {},
      githubRepos: [
        {
          id: 'repo-1',
          repoName: 'CareSync-AI-Triage',
          cleanReadme: true,
          stackListed: true,
          setupInstructions: true,
          screenshots: false,
          demoLink: true,
          envExample: true,
          gitignoreCheck: true,
          secretSafetyCheck: true,
          completedTasks: ['README', 'LICENSE'],
        },
        {
          id: 'repo-2',
          repoName: 'SmartEdu-Adaptive-Core',
          cleanReadme: false,
          stackListed: true,
          setupInstructions: false,
          screenshots: false,
          demoLink: false,
          envExample: false,
          gitignoreCheck: true,
          secretSafetyCheck: true,
          completedTasks: [],
        }
      ],
      linkedinDrafts: [
        {
          id: 'draft-1',
          type: 'project_launch',
          hook: 'Excited to unveil CareSync AI, an offline-first patient prioritization workspace!',
          story: 'Medical staff blank out during emergency vital influxes. To fix this, I engineered a vital anomaly prioritization algorithm that computes risk indexes conceptually.',
          details: 'Built with React, TypeScript, and a responsive WebSocket simulation stream.',
          skills: ['React', 'TypeScript', 'Data Structures', 'Isolation Forest'],
          gratitude: 'Thanks to the placement team and review coaches for guidance.',
          callToConnect: 'Check the GitHub repo below and let me know your thoughts!',
          hashtags: ['reactjs', 'healthcareai', 'productdesign'],
          createdAt: new Date().toISOString(),
        }
      ],

      updateVisibility: (updates) =>
        set((state) => ({
          visibility: {
            ...state.visibility,
            ...updates,
          },
        })),

      updateProfile: (updates) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...updates,
          },
        })),

      saveCaseStudy: (projectKey, study) =>
        set((state) => ({
          caseStudies: {
            ...state.caseStudies,
            [projectKey]: {
              ...study,
              id: state.caseStudies[projectKey]?.id || `case-${Date.now()}`,
              projectKey,
              lastUpdated: new Date().toISOString(),
            },
          },
        })),

      addGithubRepo: (repoName) =>
        set((state) => ({
          githubRepos: [
            ...state.githubRepos,
            {
              id: `repo-${Date.now()}`,
              repoName,
              cleanReadme: false,
              stackListed: false,
              setupInstructions: false,
              screenshots: false,
              demoLink: false,
              envExample: false,
              gitignoreCheck: false,
              secretSafetyCheck: false,
              completedTasks: [],
            },
          ],
        })),

      updateGithubRepo: (id, updates) =>
        set((state) => ({
          githubRepos: state.githubRepos.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteGithubRepo: (id) =>
        set((state) => ({
          githubRepos: state.githubRepos.filter((r) => r.id !== id),
        })),

      addLinkedinDraft: (draft) =>
        set((state) => ({
          linkedinDrafts: [
            {
              ...draft,
              id: `draft-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.linkedinDrafts,
          ],
        })),

      deleteLinkedinDraft: (id) =>
        set((state) => ({
          linkedinDrafts: state.linkedinDrafts.filter((d) => d.id !== id),
        })),
    }),
    {
      name: 'sanzz_os_portfolio_os_v1',
      version: 1,
      migrate: (persistedState, version) => runMigrationForStore('sanzz_os_portfolio_os_v1', persistedState, version),
    }
  )
);
