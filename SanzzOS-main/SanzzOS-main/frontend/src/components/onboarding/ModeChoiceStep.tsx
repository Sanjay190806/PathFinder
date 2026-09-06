import React from 'react';

export const ModeChoiceStep: React.FC<{ mode: string; onModeChange: (mode: string) => void }> = ({ mode, onModeChange }) => (
  <div className="grid gap-3 md:grid-cols-2">
    {[
      ['local_only', 'Local only', 'Keep all data in this browser and use JSON backups.'],
      ['account_cloud_sync', 'Account sync', 'Use protected cloud snapshots after login.'],
    ].map(([value, label, detail]) => (
      <button key={value} type="button" onClick={() => onModeChange(value)} className={`rounded-xl border p-4 text-left ${mode === value ? 'border-accentBlue bg-accentBlue/10' : 'border-border-subtle bg-white/[0.04]'}`}>
        <p className="font-semibold text-textPrimary">{label}</p>
        <p className="mt-1 text-xs text-textSecondary">{detail}</p>
      </button>
    ))}
  </div>
);
