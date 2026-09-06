import { request } from './apiClient';
import { UserProfile } from '../types';

export interface SettingsService {
  saveProfile: (profile: UserProfile) => Promise<{ success: boolean }>;
  getProfile: () => Promise<UserProfile>;
}

export const settingsService: SettingsService = {
  saveProfile: (profile) => request<{ success: boolean }>('/settings', {
    method: 'POST',
    body: { profile }
  }),
  getProfile: () => request<UserProfile>('/settings')
};
