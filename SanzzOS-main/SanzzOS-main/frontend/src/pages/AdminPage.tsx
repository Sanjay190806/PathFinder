import React, { useEffect, useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { aiService } from '../services/aiService';
import { featureFlags } from '../config/featureFlags';

export const AdminPage: React.FC = () => {
  const [health, setHealth] = useState<{ backendOnline: boolean; groqConfigured: boolean; model: string; streamingSupported: boolean } | null>(null);
  const isLocalDev = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

  useEffect(() => {
    aiService.getStatus()
      .then(setHealth)
      .catch(() => setHealth({ backendOnline: false, groqConfigured: false, model: 'unknown', streamingSupported: false }));
  }, []);

  if (!isLocalDev) {
    return (
      <Card className="mx-auto mt-6 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Admin</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">Local dev only placeholder</h3>
        <p className="mt-2 text-sm text-textSecondary">This admin dashboard is only intended for local development.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10 fade-in">
      <SectionHeader title="Admin Dashboard" subtitle="Local dev placeholder for health, flags, and provider state." />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">App health</p>
          <Badge variant={health?.backendOnline ? 'success' : 'warning'}>{health?.backendOnline ? 'Backend online' : 'Backend offline'}</Badge>
          <p className="text-sm text-textSecondary">Model: {health?.model || 'unknown'}</p>
          <p className="text-sm text-textSecondary">Streaming: {health?.streamingSupported ? 'ready' : 'fallback only'}</p>
        </Card>
        <Card className="flex flex-col gap-3 xl:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Feature flags</p>
          <div className="grid gap-2 md:grid-cols-2">
            {Object.entries(featureFlags).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/[0.03] px-3 py-2 text-sm">
                <span className="text-textPrimary">{key}</span>
                <Badge variant={value ? 'success' : 'neutral'}>{value ? 'on' : 'off'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

