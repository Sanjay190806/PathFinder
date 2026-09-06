import { request } from './apiClient';
import { ResumeProfile } from '../types';

export interface ResumeService {
  saveResume: (resume: ResumeProfile) => Promise<{ success: boolean }>;
  getResume: () => Promise<ResumeProfile>;
}

export const resumeService: ResumeService = {
  saveResume: (resume) => request<{ success: boolean }>('/resume', {
    method: 'POST',
    body: { resume }
  }),
  getResume: () => request<ResumeProfile>('/resume')
};
