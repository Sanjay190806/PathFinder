export type SyncMode = 'local-only' | 'cloud-ready' | 'manual-db-snapshot' | 'cloud-sync';

export type SyncStatus = 'offline' | 'online' | 'syncing' | 'synced' | 'failed' | 'conflict';

export type SyncEntityType =
  | 'ai_brain'
  | 'smart_planner'
  | 'placement_os'
  | 'learning_os'
  | 'analytics'
  | 'project_os'
  | 'resume_manager'
  | 'daily_tasks'
  | 'xp_streak'
  | 'settings';

export interface SyncEntityRecord {
  id: string;
  entityType: SyncEntityType;
  payload: any;
  updatedAt: string;
  version: number;
}

export interface SyncConflict {
  entityType: SyncEntityType;
  entityId: string;
  localVersion: number;
  remoteVersion: number;
  localUpdatedAt: string;
  remoteUpdatedAt: string;
  localData: any;
  remoteData: any;
  conflictReason: string;
  resolutionStatus: 'pending' | 'resolved';
}

export interface SyncOperation {
  id: string;
  entityType: SyncEntityType;
  operationType: 'create' | 'update' | 'delete' | 'complete' | 'restore';
  payload: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  retries: number;
  error?: string;
}

export interface SyncMetadata {
  lastSyncTime: string | null;
  syncMode: SyncMode;
  queueLength: number;
  storageSizeKB: number;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  conflicts: SyncConflict[];
  error?: string;
}

export interface SyncHealth {
  status: SyncStatus;
  online: boolean;
  dbConnected: boolean;
  mode?: string;
  authEnabled?: boolean;
  realMultiDeviceSync?: boolean;
  latencyMs?: number;
}

export interface BackupSnapshot {
  appName: string;
  version: string;
  schemaVersion: number;
  createdAt: string;
  mode?: string;
  keysIncluded?: string[];
  keysMissing?: string[];
  data: Record<string, string>;
}

export interface RestoreResult {
  success: boolean;
  restoredKeys: string[];
  skippedKeys?: string[];
  warnings?: string[];
  error?: string;
  preRestoreSaved?: boolean;
}
