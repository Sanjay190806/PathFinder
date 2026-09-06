import { request } from './apiClient';
import { DailyLog } from '../types';

export interface DailyLogService {
  saveLog: (day: number, log: DailyLog) => Promise<{ success: boolean; xpEarned: number }>;
  getLogs: () => Promise<Record<string, DailyLog>>;
}

export const dailyLogService: DailyLogService = {
  saveLog: (day, log) => request<{ success: boolean; xpEarned: number }>('/logs', {
    method: 'POST',
    body: { day, log }
  }),
  getLogs: () => request<Record<string, DailyLog>>('/logs')
};
