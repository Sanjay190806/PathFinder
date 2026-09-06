import React, { useEffect, useState } from 'react';
import { getBackendHealthSummary, BackendHealthSummary } from '../../services/apiClient';

export const BackendHealthCard: React.FC = () => {
  const [health, setHealth] = useState<BackendHealthSummary | null>(null);

  const refresh = () => {
    getBackendHealthSummary().then(setHealth);
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!health) {
    return <div className="rounded-xl border border-border-subtle bg-white/[0.04] p-3 text-xs text-textSecondary">Checking backend...</div>;
  }

  const db = health.database;
  const dbOk = Boolean(db?.available);

  return (
    <div className={`rounded-xl border p-3 text-xs ${health.online ? 'border-accentBlue/20 bg-accentBlue/10 text-accentBlue' : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{health.online ? 'Backend online' : 'Backend offline'}</p>
        <button type="button" onClick={refresh} className="underline">Retry</button>
      </div>
      <p className="mt-1">API: {health.apiBase}</p>
      {db && (
        <p className={`mt-1 ${dbOk ? 'text-accentEmerald' : 'text-yellow-300'}`}>
          DB: {dbOk ? 'connected' : `${db.code} - ${db.message}`}
        </p>
      )}
      {health.providers && <p className="mt-1">Google Sign-In: {health.providers.google ? 'configured' : 'not configured'}</p>}
      {health.error && <p className="mt-1">{health.error}</p>}
    </div>
  );
};
