import { request } from './apiClient';
import {
  ResumeBulletGeneration,
  ResumeBulletRequest,
  ResumeInterviewQuestionGroup,
  ResumeJobAnalysis,
  ResumeRecruiterReview,
  ResumeStudioContext,
} from '../types/resumeStudio';
import {
  buildLocalBulletGeneration,
  buildLocalInterviewQuestions,
  buildLocalJobAnalysis,
  buildLocalRecruiterReview,
} from '../utils/resumeStudioUtils';

type AISettings = { provider?: string; model?: string; mode?: string; streaming?: boolean };

type AnalyzeResponse = ResumeJobAnalysis;
type BulletResponse = ResumeBulletGeneration;
type RecruiterResponse = ResumeRecruiterReview;
type InterviewResponse = { groups: ResumeInterviewQuestionGroup[] };

export async function analyzeJobDescription(jobDescription: string, resumeState: ResumeStudioContext, aiSettings: AISettings): Promise<ResumeJobAnalysis> {
  try {
    const response = await request<AnalyzeResponse>('/resume/analyze-job', {
      method: 'POST',
      body: { jobDescription, resumeState, aiSettings },
    });
    return response;
  } catch {
    return buildLocalJobAnalysis(jobDescription, resumeState);
  }
}

export async function generateResumeBullets(input: ResumeBulletRequest, aiSettings: AISettings): Promise<ResumeBulletGeneration> {
  try {
    const response = await request<BulletResponse>('/resume/generate-bullets', {
      method: 'POST',
      body: { input, aiSettings },
    });
    return response;
  } catch {
    return buildLocalBulletGeneration(input);
  }
}

export async function generateRecruiterReview(jobDescription: string, resumeState: ResumeStudioContext, aiSettings: AISettings): Promise<ResumeRecruiterReview> {
  try {
    const response = await request<RecruiterResponse>('/resume/recruiter-review', {
      method: 'POST',
      body: { jobDescription, resumeState, aiSettings },
    });
    return response;
  } catch {
    return buildLocalRecruiterReview(resumeState, jobDescription);
  }
}

export async function generateInterviewQuestions(resumeState: ResumeStudioContext, aiSettings: AISettings): Promise<ResumeInterviewQuestionGroup[]> {
  try {
    const response = await request<InterviewResponse>('/resume/interview-questions', {
      method: 'POST',
      body: { resumeState, aiSettings },
    });
    return response.groups;
  } catch {
    return buildLocalInterviewQuestions(resumeState);
  }
}
