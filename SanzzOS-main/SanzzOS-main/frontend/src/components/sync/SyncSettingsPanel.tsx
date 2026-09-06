import React, { useEffect, useState } from 'react';
import { CloudOff, Database, RefreshCw, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
import syncCoreService, { SyncMode } from '../../services/sync/syncService';

export const SyncSettingsPanel: React.FC = () => {
  const [mode, setMode] = useState<SyncMode>(() => syncCoreService.getSyncMode());
  const [lastSync, setLastSync] = useState<string | null>(() => syncCoreService.getLastSyncTime());
  const [queueLength, setQueueLength] = useState(() => syncCoreService.getQueueLength());
  const [dbConnected, setDbConnected] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | 'info' | null>(null);
  const [msg, setMsg] = useState('');

  const refreshStatus = async () => {
    const health = await syncCoreService.getSyncHealth();
    setDbConnected(health.dbConnected);
    setBackendOnline(health.online);
    setQueueLength(syncCoreService.getQueueLength());
    setLastSync(syncCoreService.getLastSyncTime());
  };

  useEffect(() => {
    refreshStatus();
    const onChange = () => {
      setMode(syncCoreService.getSyncMode());
      setLastSync(syncCoreService.getLastSyncTime());
      setQueueLength(syncCoreService.getQueueLength());
    };
    window.addEventListener('sync_config_changed', onChange);
    window.addEventListener('sync_queue_changed', onChange);
    const timer = setInterval(refreshStatus, 15000);
    return () => {
      window.removeEventListener('sync_config_changed', onChange);
      window.removeEventListener('sync_queue_changed', onChange);
      clearInterval(timer);
    };
  }, []);

  const handleModeChange = (newMode: SyncMode) => {
    setMode(newMode);
    syncCoreService.setSyncMode(newMode);
  };

  const handleSyncNow = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await syncCoreService.synchronize();
      if (res.success) {
        setStatus('success');
        setMsg(res.message || 'Manual database snapshot completed.');
      } else {
        setStatus('error');
        setMsg(res.error || 'Database snapshot unavailable.');
      }
      await refreshStatus();
    } catch (e: any) {
      setStatus('error');
      setMsg(e.message || 'Database snapshot failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleFlushQueue = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await syncCoreService.flushQueue();
      setStatus(res.success ? 'success' : 'error');
      setMsg(res.message || res.error || 'Queue flush attempted.');
      await refreshStatus();
    } catch (e: any) {
      setStatus('error');
      setMsg(e.message || 'Queue flush failed.');
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = !backendOnline
    ? 'Sync unavailable'
    : !dbConnected
      ? 'Backend online, database offline'
      : mode === 'local-only'
        ? 'Local-first storage'
        : 'Manual DB snapshot mode';

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.01] p-4.5 select-none">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Storage & Sync</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">Local-First + Manual DB Snapshot</h3>
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-textSecondary">
          {mode === 'local-only' ? <CloudOff className="h-3.5 w-3.5" /> : <Database className="h-3.5 w-3.5 text-accentBlue" />}
          <span>{statusLabel}</span>
        </span>
      </div>

      <div className="rounded-xl border border-white/5 bg-black/45 p-3 text-[10px] text-textSecondary leading-relaxed flex gap-2">
        <Info className="h-4 w-4 shrink-0 text-accentBlue mt-0.5" />
        <p>
          Data is stored locally in your browser. You can export a backup JSON anytime. Optional manual database snapshots push/pull a full backup to PostgreSQL when backend and database are configured. Real account-based multi-device sync requires authentication and is planned for v1.7.
        </p>
      </div>

      {status && (
        <div className={`flex items-center gap-2 rounded-xl border p-3 text-[10px] ${
          status === 'success'
            ? 'border-accentEmerald/20 bg-accentEmerald/10 text-accentEmerald'
            : status === 'info'
              ? 'border-accentBlue/20 bg-accentBlue/10 text-accentBlue'
              : 'border-red-500/20 bg-red-500/10 text-red-400'
        }`}>
          {status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          <span>{msg}</span>
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-3 text-[10px]">
        <div className="rounded-xl border border-white/5 bg-black/45 p-3">
          <span className="text-textMuted uppercase font-bold">Auth</span>
          <p className="mt-1 text-textPrimary font-semibold">Not enabled</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/45 p-3">
          <span className="text-textMuted uppercase font-bold">Database</span>
          <p className="mt-1 text-textPrimary font-semibold">{dbConnected ? 'Available' : 'Unavailable'}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/45 p-3">
          <span className="text-textMuted uppercase font-bold">Offline Queue</span>
          <p className="mt-1 text-textPrimary font-semibold">{queueLength} pending</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {(['local-only', 'manual-db-snapshot'] as SyncMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={`flex-1 rounded-xl border py-2.5 text-center text-xs font-black uppercase tracking-wider transition ${
                mode === m
                  ? 'border-accentBlue bg-accentBlue/10 text-textPrimary'
                  : 'border-white/5 bg-white/[0.01] text-textSecondary hover:bg-white/5'
              }`}
            >
              {m === 'local-only' ? 'Local Only' : 'Manual DB Snapshot'}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/5 bg-black/45 p-3 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[8px] text-textMuted uppercase font-bold">Last DB Snapshot</span>
            <span className="text-[10px] text-textSecondary font-mono truncate">
              {lastSync ? new Date(lastSync).toLocaleString() : 'Never synced to database'}
            </span>
          </div>

          <div className="flex gap-2 shrink-0">
            {queueLength > 0 && (
              <button
                type="button"
                onClick={handleFlushQueue}
                disabled={busy}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-black text-textPrimary hover:bg-white/10 transition uppercase tracking-wider"
              >
                Flush Queue
              </button>
            )}
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={busy || mode === 'local-only' || !dbConnected}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-[10px] font-black text-textPrimary hover:bg-white/10 transition uppercase tracking-wider disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
              <span>Push Snapshot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncSettingsPanel;
