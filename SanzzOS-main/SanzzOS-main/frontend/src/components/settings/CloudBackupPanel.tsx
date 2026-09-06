import React, { useEffect, useState } from 'react';
import { ArchiveRestore } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CloudBackupListItem, cloudBackupService } from '../../services/cloud/cloudBackupService';
import { useAuthStore } from '../../app/store/useAuthStore';
import { restoreBackupData, savePreRestoreBackup } from '../../services/backup/backupRegistry';

export const CloudBackupPanel: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [backups, setBackups] = useState<CloudBackupListItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    if (!isAuthenticated) return;
    try {
      setBackups(await cloudBackupService.list());
    } catch {
      setBackups([]);
    }
  };

  useEffect(() => {
    load();
  }, [isAuthenticated]);

  const create = async () => {
    const backup = await cloudBackupService.create(`Manual cloud backup ${new Date().toLocaleString()}`);
    setMessage(`Created ${backup.name}`);
    await load();
  };

  const restore = async (id: string) => {
    if (!window.confirm('Restore this cloud backup into local browser storage? A pre-restore local backup will be saved first.')) return;
    const snapshot = await cloudBackupService.get(id);
    savePreRestoreBackup();
    const result = restoreBackupData(snapshot);
    setMessage(result.success ? `Restored ${result.restoredKeys.length} keys from cloud backup.` : result.error || 'Restore failed.');
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
        <div className="flex items-center gap-3">
          <ArchiveRestore className="h-4 w-4 text-accentYellow" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Cloud Backups</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">Account-owned backup snapshots</h3>
          </div>
        </div>
        <Button onClick={create} disabled={!isAuthenticated} size="sm">Create</Button>
      </div>
      {message && <p className="rounded-xl border border-accentBlue/20 bg-accentBlue/10 p-3 text-xs text-accentBlue">{message}</p>}
      <div className="flex flex-col gap-2">
        {backups.length === 0 ? <p className="text-xs text-textSecondary">{isAuthenticated ? 'No cloud backups yet.' : 'Sign in to use cloud backups.'}</p> : backups.map((backup) => (
          <div key={backup.id} className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-black/35 p-3 text-xs">
            <div className="min-w-0">
              <p className="truncate font-semibold text-textPrimary">{backup.name}</p>
              <p className="text-textMuted">{new Date(backup.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => restore(backup.id)}>Restore</Button>
              <Button size="sm" variant="danger" onClick={() => cloudBackupService.delete(backup.id).then(load)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
