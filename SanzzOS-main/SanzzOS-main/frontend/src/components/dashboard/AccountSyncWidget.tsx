import React, { useEffect, useState } from 'react';
import { Cloud, HardDrive } from 'lucide-react';
import { useAuthStore } from '../../app/store/useAuthStore';
import { cloudSyncService } from '../../services/cloud/cloudSyncService';
import { CloudStatus } from '../../services/cloud/cloudApiClient';

export const AccountSyncWidget: React.FC = () => {
  const { isAuthenticated, status: authStatus } = useAuthStore();
  const [syncStatus, setSyncStatus] = useState<CloudStatus | null>(null);
  const lastLocalBackup = localStorage.getItem('sanzz_os_last_backup_v1');

  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated) return;
    cloudSyncService.getStatus().then((status) => {
      if (mounted) setSyncStatus(status);
    });
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <div className="rounded-xl border border-border-subtle bg-white/[0.04] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-textSecondary">
          {isAuthenticated ? <Cloud className="h-4 w-4 text-accentEmerald" /> : <HardDrive className="h-4 w-4 text-accentOrange" />}
          <span>Account mode</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-textPrimary">{isAuthenticated ? 'Cloud account' : authStatus === 'offline_local_mode' ? 'Local only' : 'Not signed in'}</p>
      </div>
      <div className="rounded-xl border border-border-subtle bg-white/[0.04] p-4">
        <p className="text-xs font-semibold text-textSecondary">Last cloud sync</p>
        <p className="mt-2 truncate text-sm font-semibold text-textPrimary">{syncStatus?.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString() : 'Never'}</p>
      </div>
      <div className="rounded-xl border border-border-subtle bg-white/[0.04] p-4">
        <p className="text-xs font-semibold text-textSecondary">Pending / backup</p>
        <p className="mt-2 truncate text-sm font-semibold text-textPrimary">{syncStatus?.pendingOperations ?? 0} pending | {lastLocalBackup ? 'Backup exists' : 'No local backup flag'}</p>
      </div>
    </section>
  );
};
