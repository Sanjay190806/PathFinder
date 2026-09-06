import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const PortfolioPrivacyToggle: React.FC<{
  demoMode: boolean;
  onToggle: (value: boolean) => void;
}> = ({ demoMode, onToggle }) => {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Privacy mode</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">Recruiter-safe demo data</h3>
        <p className="mt-1 text-xs text-textSecondary">No applications, private chat, personal notes, or API settings are shown on this route.</p>
      </div>
      <label className="flex items-center gap-3">
        <Badge variant={demoMode ? 'success' : 'neutral'}>{demoMode ? 'Demo dataset' : 'Sanitized live shell'}</Badge>
        <input type="checkbox" checked={demoMode} onChange={(e) => onToggle(e.target.checked)} className="h-5 w-5 accent-accentBlue" />
      </label>
    </Card>
  );
};

