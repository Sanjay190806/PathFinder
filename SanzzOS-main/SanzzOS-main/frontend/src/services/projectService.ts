import { request } from './apiClient';
import { Project } from '../types';

export interface ProjectService {
  saveProject: (key: string, proj: Project) => Promise<{ success: boolean }>;
  getProjects: () => Promise<Record<string, Project>>;
}

export const projectService: ProjectService = {
  saveProject: (key, proj) => request<{ success: boolean }>('/projects', {
    method: 'POST',
    body: { key, proj }
  }),
  getProjects: () => request<Record<string, Project>>('/projects')
};
