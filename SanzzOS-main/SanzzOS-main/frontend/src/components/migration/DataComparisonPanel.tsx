import React from 'react';
import { MigrationSummary } from '../../services/migrationService';

export const DataComparisonPanel: React.FC<{ summary: MigrationSummary | null }> = ({ summary }) => (
  <div className="grid gap-3 md:grid-cols-2">
    <div className="rounded-xl border border-border-subtle bg-black/35 p-3">
      <p className="text-[10px] font-bold uppercase text-textMuted">Local browser</p>
      <p className="mt-2 text-lg font-semibold text-textPrimary">{summary?.localKeyCount ?? '-'} keys</p>
      <p className="text-xs text-textSecondary">{summary?.localCreatedAt ? new Date(summary.localCreatedAt).toLocaleString() : 'Not scanned'}</p>
    </div>
    <div className="rounded-xl border border-border-subtle bg-black/35 p-3">
      <p className="text-[10px] font-bold uppercase text-textMuted">Cloud account</p>
      <p className="mt-2 text-lg font-semibold text-textPrimary">{summary?.cloudKeyCount ?? '-'} keys</p>
      <p className="text-xs text-textSecondary">{summary?.cloudUpdatedAt ? new Date(summary.cloudUpdatedAt).toLocaleString() : 'No cloud snapshot'}</p>
    </div>
  </div>
);
