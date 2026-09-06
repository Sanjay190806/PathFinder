import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { featureFlags } from '../../config/featureFlags';

export const FeatureFlagsPanel: React.FC = () => {
  const entries = Object.entries(featureFlags);

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Feature flags</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">Foundation toggles</h3>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white/[0.03] px-4 py-3 text-sm">
            <span className="text-textPrimary">{key}</span>
            <Badge variant={value ? 'success' : 'neutral'}>{value ? 'on' : 'off'}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

