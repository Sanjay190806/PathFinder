import React from 'react';

export const IntegrationSetupGuide: React.FC<{ steps: string[] }> = ({ steps }) => (
  <div className="rounded-lg border border-border-subtle bg-bgBase/40 p-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textMuted">Setup</p>
    <ul className="mt-2 space-y-1 text-xs text-textSecondary">
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ul>
  </div>
);
