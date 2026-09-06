import { request } from './apiClient';
import { CareerApplication } from '../types';

export interface ApplicationService {
  getApplications: () => Promise<CareerApplication[]>;
  saveApplication: (app: CareerApplication) => Promise<{ success: boolean }>;
  deleteApplication: (id: string) => Promise<{ success: boolean }>;
}

export const applicationService: ApplicationService = {
  getApplications: () => request<CareerApplication[]>('/applications'),
  saveApplication: (app) => request<{ success: boolean }>('/applications', {
    method: 'POST',
    body: { app }
  }),
  deleteApplication: (id) => request<{ success: boolean }>(`/applications/${id}`, {
    method: 'DELETE'
  })
};
