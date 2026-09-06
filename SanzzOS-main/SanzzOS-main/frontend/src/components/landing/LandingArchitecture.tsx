import React from 'react';
import { Card } from '../ui/Card';

export const LandingArchitecture: React.FC = () => {
  const rows = [
    ['Frontend', 'Vite + React dashboard shell with Zustand persistence'],
    ['Backend', 'Express API proxy for health, sync, and AI'],
    ['Data', 'Prisma + PostgreSQL snapshots for local-first storage'],
    ['AI', 'Groq only through backend env and proxy'],
  ];
  return (
    <Card className="bg-white/[0.04]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Architecture</p>
      <div className="mt-4 grid gap-3">
        {rows.map(([left, right]) => (
          <div key={left} className="flex items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-bgBase/40 px-4 py-3">
            <span className="text-sm font-semibold text-textPrimary">{left}</span>
            <span className="text-sm text-textSecondary">{right}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
