import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IntegrationStatus = 'not_connected' | 'linked' | 'connected' | 'error';

type BaseIntegration = {
  status: IntegrationStatus;
  profileUrl: string;
  lastSync?: string;
  dataImported: string[];
  error?: string;
};

export type LeetCodeProfile = BaseIntegration & {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  contestRating?: number;
  targetSolvedCount: number;
};

export type LinkedInProfile = BaseIntegration & {
  headline: string;
  about: string;
  skills: string;
  targetRole: string;
};

export type GitHubProfile = BaseIntegration & {
  username: string;
  pinnedProjects: string;
  repositoryLinks: string;
};

export type YouTubeLinks = BaseIntegration & {
  playlistLinks: string;
  courseLinks: string;
  watchedVideos: number;
  totalVideos: number;
  currentVideo: string;
  notes: string;
  topic: string;
  priority: 'low' | 'medium' | 'high';
};

export type PortfolioLinks = BaseIntegration & {
  portfolioUrl: string;
  resumeUrl: string;
  projectDemoUrls: string;
  linkedInPostUrls: string;
};

type IntegrationKey = 'leetcode' | 'linkedin' | 'github' | 'youtube' | 'portfolio';

type IntegrationState = {
  integrations: {
    leetcode: LeetCodeProfile;
    linkedin: LinkedInProfile;
    github: GitHubProfile;
    youtube: YouTubeLinks;
    portfolio: PortfolioLinks;
  };
  updateLeetCodeProfile: (profile: Partial<LeetCodeProfile>) => void;
  updateLinkedInProfile: (profile: Partial<LinkedInProfile>) => void;
  updateGitHubProfile: (profile: Partial<GitHubProfile>) => void;
  updateYouTubeLinks: (links: Partial<YouTubeLinks>) => void;
  updatePortfolioLinks: (links: Partial<PortfolioLinks>) => void;
  removeIntegration: (key: IntegrationKey) => void;
  markSynced: (key: IntegrationKey) => void;
  validateURL: (url: string) => boolean;
};

const sanitizeText = (value: unknown) =>
  String(value ?? '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();

const sanitizeProfile = <T extends Record<string, unknown>>(profile: Partial<T>) =>
  Object.fromEntries(
    Object.entries(profile).map(([key, value]) => [key, typeof value === 'string' ? sanitizeText(value) : value])
  ) as Partial<T>;

const isSafeURL = (url: string) => {
  if (!url.trim()) return true;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const base = (): BaseIntegration => ({
  status: 'not_connected',
  profileUrl: '',
  dataImported: [],
});

const defaults = {
  leetcode: {
    ...base(),
    username: '',
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    targetSolvedCount: 150,
  },
  linkedin: {
    ...base(),
    headline: '',
    about: '',
    skills: '',
    targetRole: 'Software Engineer',
  },
  github: {
    ...base(),
    username: '',
    pinnedProjects: '',
    repositoryLinks: '',
  },
  youtube: {
    ...base(),
    playlistLinks: '',
    courseLinks: '',
    watchedVideos: 0,
    totalVideos: 0,
    currentVideo: '',
    notes: '',
    topic: 'Java DSA',
    priority: 'medium' as const,
  },
  portfolio: {
    ...base(),
    portfolioUrl: '',
    resumeUrl: '',
    projectDemoUrls: '',
    linkedInPostUrls: '',
  },
};

const withStatus = <T extends BaseIntegration>(profile: T): T => ({
  ...profile,
  status: profile.profileUrl || Object.values(profile).some((value) => typeof value === 'string' && value.trim()) ? 'linked' : 'not_connected',
});

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set) => ({
      integrations: defaults,
      updateLeetCodeProfile: (profile) =>
        set((state) => ({ integrations: { ...state.integrations, leetcode: withStatus({ ...state.integrations.leetcode, ...sanitizeProfile(profile), dataImported: ['manual solved counts', 'public profile link'] }) } })),
      updateLinkedInProfile: (profile) =>
        set((state) => ({ integrations: { ...state.integrations, linkedin: withStatus({ ...state.integrations.linkedin, ...sanitizeProfile(profile), dataImported: ['profile text', 'skills', 'target role'] }) } })),
      updateGitHubProfile: (profile) =>
        set((state) => ({ integrations: { ...state.integrations, github: withStatus({ ...state.integrations.github, ...sanitizeProfile(profile), dataImported: ['profile link', 'repositories', 'pinned projects'] }) } })),
      updateYouTubeLinks: (links) =>
        set((state) => ({ integrations: { ...state.integrations, youtube: withStatus({ ...state.integrations.youtube, ...sanitizeProfile(links), dataImported: ['learning links', 'progress', 'notes'] }) } })),
      updatePortfolioLinks: (links) =>
        set((state) => ({ integrations: { ...state.integrations, portfolio: withStatus({ ...state.integrations.portfolio, ...sanitizeProfile(links), dataImported: ['portfolio', 'resume link', 'demo links'] }) } })),
      removeIntegration: (key) => set((state) => ({ integrations: { ...state.integrations, [key]: defaults[key] } })),
      markSynced: (key) => set((state) => ({ integrations: { ...state.integrations, [key]: { ...state.integrations[key], lastSync: new Date().toISOString(), status: 'linked' } } })),
      validateURL: (url) => isSafeURL(url),
    }),
    { name: 'sanju-career-os-integrations-v15' }
  )
);
