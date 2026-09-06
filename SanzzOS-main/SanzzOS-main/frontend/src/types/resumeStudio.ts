import { CareerApplication } from './applications';
import { Project } from './projects';
import { ResumeProfile } from './resume';

export interface ResumeStudioProjectSummary {
  name: string;
  status: Project['status'];
  stack: string[];
  bullets: string[];
}

export interface ResumeStudioApplicationSummary {
  company: string;
  role: string;
  status: CareerApplication['status'];
}

export interface ResumeStudioContext {
  resume: ResumeProfile;
  selectedResumeVersion: string;
  lastJobDescription: string;
  currentTargetCompany: string;
  currentTargetRole: string;
  atsScore: number;
  scoreReason: string;
  projects: ResumeStudioProjectSummary[];
  applications: ResumeStudioApplicationSummary[];
  skills: string[];
  missingKeywords: string[];
  matchingKeywords: string[];
  projectHighlights: string[];
  versionNotes: string[];
}

export interface ResumeJobAnalysis {
  roleTitle: string;
  requiredSkills: string[];
  preferredSkills: string[];
  matchingKeywords: string[];
  missingKeywords: string[];
  estimatedMatchScore: number;
  recommendations: string[];
  providerUsed?: string;
  modelUsed?: string;
}

export interface ResumeBulletRequest {
  projectName: string;
  actionVerb: string;
  techStack: string;
  problemSolved: string;
  measurableImpact: string;
  roleType: string;
  targetCompany: string;
  tone: 'concise' | 'strong' | 'ATS' | 'recruiter-friendly';
}

export interface ResumeBulletGeneration {
  input: ResumeBulletRequest;
  variations: string[];
  starVersion: string;
  atsVersion: string;
  honestVersion: string;
  quantifiedVersion: string;
  providerUsed?: string;
  modelUsed?: string;
}

export interface ResumeRecruiterReview {
  score: number;
  categories: Array<{
    label: string;
    score: number;
    note: string;
  }>;
  topFixes: string[];
  recruiterQuestions: string[];
  suggestedPositioning: string;
  providerUsed?: string;
  modelUsed?: string;
}

export interface ResumeInterviewQuestionItem {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  whyAsked: string;
  answerOutline: string;
}

export interface ResumeInterviewQuestionGroup {
  category: string;
  questions: ResumeInterviewQuestionItem[];
}

export interface ResumeScoreHistoryItem {
  id: string;
  date: string;
  score: number;
  reason: string;
  version: string;
}

export interface TailoredResumeVersion {
  id: string;
  name: string;
  targetCompany: string;
  targetRole: string;
  sourceVersion: string;
  summary: string;
  createdAt: string;
  notes: string[];
}
