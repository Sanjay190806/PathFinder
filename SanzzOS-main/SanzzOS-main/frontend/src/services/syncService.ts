import { syncCoreService } from './sync/syncService';
import { CareerState } from '../types';

export interface SyncService {
  checkBackendHealth: () => Promise<boolean>;
  getBackendHealth: () => ReturnType<typeof syncCoreService.getBackendHealth>;
  pullSnapshot: (userId: string) => Promise<CareerState | null>;
  pushSnapshot: (userId: string, data: CareerState) => Promise<{ success: boolean; updatedAt: string }>;
  getSyncHealth: () => ReturnType<typeof syncCoreService.getSyncHealth>;
  pushFullSnapshot: (userId?: string) => ReturnType<typeof syncCoreService.pushFullSnapshot>;
  pullFullSnapshot: (userId?: string) => ReturnType<typeof syncCoreService.pullFullSnapshot>;
}

export const syncService: SyncService = {
  checkBackendHealth: () => syncCoreService.checkBackendHealth(),
  getBackendHealth: () => syncCoreService.getBackendHealth(),
  pullSnapshot: (userId) => syncCoreService.pullCareerSnapshot(userId),
  pushSnapshot: (userId, data) => syncCoreService.pushCareerSnapshot(userId, data),
  getSyncHealth: () => syncCoreService.getSyncHealth(),
  pushFullSnapshot: (userId) => syncCoreService.pushFullSnapshot(userId),
  pullFullSnapshot: (userId) => syncCoreService.pullFullSnapshot(userId),
};

export { syncCoreService };
export default syncService;
