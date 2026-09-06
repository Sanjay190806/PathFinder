import { request } from './apiClient';
import { RoadmapProblem } from '../types';

export interface RoadmapService {
  getRoadmap: () => Promise<Record<string, RoadmapProblem[]>>;
  solveProblem: (day: number, problemIndex: number) => Promise<{ success: boolean }>;
}

export const roadmapService: RoadmapService = {
  getRoadmap: () => request<Record<string, RoadmapProblem[]>>('/roadmap'),
  solveProblem: (day, problemIndex) => request<{ success: boolean }>('/roadmap/solve', {
    method: 'POST',
    body: { day, problemIndex }
  })
};
