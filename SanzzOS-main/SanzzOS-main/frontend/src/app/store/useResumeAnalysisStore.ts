import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ATSSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ATSIssue = {
  severity: ATSSeverity;
  title: string;
  detail: string;
  fix: string;
};

export type CategoryScore = {
  label: string;
  score: number;
  max: number;
  note: string;
};

export type ResumeAnalysis = {
  id: string;
  createdAt: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  targetRole: string;
  targetCompany: string;
  extractedTextPreview: string;
  fullExtractedText?: string;
  atsScore: number;
  categoryScores: CategoryScore[];
  issues: ATSIssue[];
  strengths: string[];
  missingSections: string[];
  keywordGaps: string[];
  priorityFixes: string[];
  rewrittenBullets: string[];
  atsWarnings: string[];
  aiReview?: string;
};

type ResumeAnalysisState = {
  analyses: ResumeAnalysis[];
  selectedAnalysisId: string | null;
  uploadedFileMetadata: { name: string; size: number; type: string } | null;
  targetRole: string;
  targetCompany: string;
  extractedTextPreview: string;
  addAnalysis: (analysis: ResumeAnalysis) => void;
  deleteAnalysis: (id: string) => void;
  compareAnalyses: (leftId: string, rightId: string) => { scoreDelta: number; newIssues: string[] } | null;
  exportAnalysis: (id: string) => string | null;
  clearResumeFile: () => void;
  setTarget: (targetRole: string, targetCompany: string) => void;
  setUploadedFileMetadata: (metadata: ResumeAnalysisState['uploadedFileMetadata']) => void;
  setExtractedTextPreview: (text: string) => void;
  attachAIReview: (id: string, aiReview: string) => void;
};

export const useResumeAnalysisStore = create<ResumeAnalysisState>()(
  persist(
    (set, get) => ({
      analyses: [],
      selectedAnalysisId: null,
      uploadedFileMetadata: null,
      targetRole: 'Software Engineer',
      targetCompany: 'Zoho',
      extractedTextPreview: '',
      addAnalysis: (analysis) => set((state) => ({ analyses: [analysis, ...state.analyses].slice(0, 25), selectedAnalysisId: analysis.id })),
      deleteAnalysis: (id) => set((state) => ({ analyses: state.analyses.filter((analysis) => analysis.id !== id), selectedAnalysisId: state.selectedAnalysisId === id ? null : state.selectedAnalysisId })),
      compareAnalyses: (leftId, rightId) => {
        const left = get().analyses.find((analysis) => analysis.id === leftId);
        const right = get().analyses.find((analysis) => analysis.id === rightId);
        if (!left || !right) return null;
        return {
          scoreDelta: right.atsScore - left.atsScore,
          newIssues: right.issues.map((issue) => issue.title).filter((title) => !left.issues.some((issue) => issue.title === title)),
        };
      },
      exportAnalysis: (id) => {
        const analysis = get().analyses.find((item) => item.id === id);
        return analysis ? JSON.stringify(analysis, null, 2) : null;
      },
      clearResumeFile: () => set({ uploadedFileMetadata: null, extractedTextPreview: '' }),
      setTarget: (targetRole, targetCompany) => set({ targetRole, targetCompany }),
      setUploadedFileMetadata: (uploadedFileMetadata) => set({ uploadedFileMetadata }),
      setExtractedTextPreview: (extractedTextPreview) => set({ extractedTextPreview }),
      attachAIReview: (id, aiReview) =>
        set((state) => ({
          analyses: state.analyses.map((analysis) => (analysis.id === id ? { ...analysis, aiReview } : analysis)),
        })),
    }),
    {
      name: 'sanju-career-os-resume-analysis-v15',
      partialize: (state) => ({
        analyses: state.analyses.map((analysis) => ({ ...analysis, fullExtractedText: undefined })),
        selectedAnalysisId: state.selectedAnalysisId,
        targetRole: state.targetRole,
        targetCompany: state.targetCompany,
      }),
    }
  )
);
