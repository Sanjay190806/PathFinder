import React from 'react';

export const MigrationOptionCard: React.FC<{ title: string; detail: string; onClick: () => void; disabled?: boolean }> = ({ title, detail, onClick, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="rounded-xl border border-border-subtle bg-white/[0.04] p-3 text-left transition hover:border-accentBlue disabled:opacity-50">
    <p className="text-sm font-semibold text-textPrimary">{title}</p>
    <p className="mt-1 text-xs leading-5 text-textSecondary">{detail}</p>
  </button>
);
