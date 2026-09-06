export interface PortfolioVisibilitySettings {
  profileSummary: 'private' | 'preview' | 'public';
  skills: 'private' | 'preview' | 'public';
  projects: 'private' | 'preview' | 'public';
  resumeHighlights: 'private' | 'preview' | 'public';
  achievements: 'private' | 'preview' | 'public';
  certifications: 'private' | 'preview' | 'public';
  githubLinks: 'private' | 'preview' | 'public';
  demoLinks: 'private' | 'preview' | 'public';
  contactLinks: 'private' | 'preview' | 'public';
  caseStudies: 'private' | 'preview' | 'public';
  interviewStories: 'private' | 'preview' | 'public';
}

export interface PortfolioProfile {
  targetRole: string;
  recruiterBio: string;
  linkedinAbout: string;
  githubSummary: string;
  resumeSummary: string;
  projectIntro: string;
}

export interface PortfolioProjectCaseStudy {
  id: string;
  projectKey: string; // e.g. caresync
  title: string;
  oneLineSummary: string;
  problem: string;
  targetUsers: string;
  solution: string;
  techStack: string;
  architecture: string;
  aiDataPart: string;
  productThinking: string;
  myContribution: string;
  challenges: string;
  decisions: string;
  impact: string;
  githubLink: string;
  demoLink: string;
  videoLink: string;
  whatILearned: string;
  nextImprovements: string;
  lastUpdated: string;
}

export interface GitHubRepoChecklist {
  id: string;
  repoName: string;
  cleanReadme: boolean;
  stackListed: boolean;
  setupInstructions: boolean;
  screenshots: boolean;
  demoLink: boolean;
  envExample: boolean;
  gitignoreCheck: boolean;
  secretSafetyCheck: boolean;
  completedTasks: string[];
}

export interface LinkedInPostDraft {
  id: string;
  type: string; // project_launch, hackathon, etc
  hook: string;
  story: string;
  details: string;
  skills: string[];
  gratitude: string;
  callToConnect: string;
  hashtags: string[];
  createdAt: string;
}

export interface PortfolioReadinessScore {
  overall: number;
  projectsCount: number;
  caseStudyCompleteness: number;
  githubReadiness: number;
  linkedinReadiness: number;
  band: 'Not Ready' | 'Foundation' | 'Improving' | 'Recruiter Ready' | 'Strong Portfolio';
  color: string;
}
