import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ResumeBulletGeneration,
  ResumeInterviewQuestionGroup,
  ResumeJobAnalysis,
  ResumeRecruiterReview,
  ResumeScoreHistoryItem,
  TailoredResumeVersion,
} from '../../types/resumeStudio';

interface ResumeStudioState {
  jobAnalyses: ResumeJobAnalysis[];
  bulletGenerations: ResumeBulletGeneration[];
  recruiterReviews: ResumeRecruiterReview[];
  resumeScoreHistory: ResumeScoreHistoryItem[];
  tailoredVersions: TailoredResumeVersion[];
  selectedResumeVersion: string;
  lastJobDescription: string;
  interviewQuestionSets: ResumeInterviewQuestionGroup[];
  addJobAnalysis: (analysis: ResumeJobAnalysis) => void;
  addBulletGeneration: (generation: ResumeBulletGeneration) => void;
  addRecruiterReview: (review: ResumeRecruiterReview) => void;
  addResumeScoreSnapshot: (snapshot: ResumeScoreHistoryItem) => void;
  createTailoredVersion: (version: TailoredResumeVersion) => void;
  compareResumeVersions: (leftVersion: string, rightVersion: string) => { leftVersion: string; rightVersion: string };
  setSelectedResumeVersion: (version: string) => void;
  setLastJobDescription: (text: string) => void;
  setInterviewQuestionSets: (groups: ResumeInterviewQuestionGroup[]) => void;
  clearResumeStudio: () => void;
}

export const useResumeStudioStore = create<ResumeStudioState>()(
  persist(
    (set) => ({
      jobAnalyses: [],
      bulletGenerations: [],
      recruiterReviews: [],
      resumeScoreHistory: [],
      tailoredVersions: [],
      selectedResumeVersion: 'v1.0',
      lastJobDescription: '',
      interviewQuestionSets: [],
      addJobAnalysis: (analysis) =>
        set((state) => ({ jobAnalyses: [analysis, ...state.jobAnalyses].slice(0, 20) })),
      addBulletGeneration: (generation) =>
        set((state) => ({ bulletGenerations: [generation, ...state.bulletGenerations].slice(0, 20) })),
      addRecruiterReview: (review) =>
        set((state) => ({ recruiterReviews: [review, ...state.recruiterReviews].slice(0, 20) })),
      addResumeScoreSnapshot: (snapshot) =>
        set((state) => ({ resumeScoreHistory: [snapshot, ...state.resumeScoreHistory].slice(0, 40) })),
      createTailoredVersion: (version) =>
        set((state) => ({
          tailoredVersions: [version, ...state.tailoredVersions].slice(0, 20),
          selectedResumeVersion: version.id,
        })),
      compareResumeVersions: (leftVersion, rightVersion) => ({ leftVersion, rightVersion }),
      setSelectedResumeVersion: (selectedResumeVersion) => set({ selectedResumeVersion }),
      setLastJobDescription: (lastJobDescription) => set({ lastJobDescription }),
      setInterviewQuestionSets: (interviewQuestionSets) => set({ interviewQuestionSets }),
      clearResumeStudio: () =>
        set({
          jobAnalyses: [],
          bulletGenerations: [],
          recruiterReviews: [],
          resumeScoreHistory: [],
          tailoredVersions: [],
          interviewQuestionSets: [],
          lastJobDescription: '',
        }),
    }),
    {
      name: 'sanju-resume-studio-v1',
      partialize: (state) => ({
        jobAnalyses: state.jobAnalyses,
        bulletGenerations: state.bulletGenerations,
        recruiterReviews: state.recruiterReviews,
        resumeScoreHistory: state.resumeScoreHistory,
        tailoredVersions: state.tailoredVersions,
        selectedResumeVersion: state.selectedResumeVersion,
        lastJobDescription: state.lastJobDescription,
        interviewQuestionSets: state.interviewQuestionSets,
      }),
    }
  )
);
