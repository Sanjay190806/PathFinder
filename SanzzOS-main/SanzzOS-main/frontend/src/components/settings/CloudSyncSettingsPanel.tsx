import React from 'react';
import { Cloud, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../app/store/useAuthStore';
import { useCloudAccountSync } from '../../hooks/useCloudAccountSync';

export const CloudSyncSettingsPanel: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { status, loading, message, push, pull, refresh } = useCloudAccountSync();

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
        <div className="flex items-center gap-3">
          <Cloud className="h-4 w-4 text-accentEmerald" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Cloud Sync</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">{isAuthenticated ? 'Account snapshot sync' : 'Sign in required'}</h3>
          </div>
        </div>
        <Button onClick={refresh} variant="ghost" size="sm"><RefreshCw className="h-4 w-4" /></Button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-border-subtle bg-black/35 p-3"><p className="text-[10px] font-bold uppercase text-textMuted">Mode</p><p className="mt-1 text-sm text-textPrimary">{status?.mode || 'local_only'}</p></div>
        <div className="rounded-xl border border-border-subtle bg-black/35 p-3"><p className="text-[10px] font-bold uppercase text-textMuted">Last sync</p><p className="mt-1 truncate text-sm text-textPrimary">{status?.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleString() : 'Never'}</p></div>
        <div className="rounded-xl border border-border-subtle bg-black/35 p-3"><p className="text-[10px] font-bold uppercase text-textMuted">Pending</p><p className="mt-1 text-sm text-textPrimary">{status?.pendingOperations ?? 0}</p></div>
      </div>
      {message && <p className="rounded-xl border border-accentBlue/20 bg-accentBlue/10 p-3 text-xs text-accentBlue">{message}</p>}
      <div className="flex flex-wrap gap-3">
        <Button onClick={push} disabled={!isAuthenticated || loading} size="sm">Push local to cloud</Button>
        <Button onClick={pull} disabled={!isAuthenticated || loading} variant="outline" size="sm">Pull cloud to this device</Button>
      </div>
    </Card>
  );
};
