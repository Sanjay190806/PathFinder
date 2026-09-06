import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const FounderWorkspacePanel: React.FC = () => {
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Workspace</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">Local personal mode</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <Badge variant="success">Personal workspace</Badge>
          <p className="mt-2 text-sm leading-6 text-textSecondary">This app remains local-first for Sanju. No login is required for day-to-day use.</p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <Badge variant="neutral">Future team workspaces</Badge>
          <p className="mt-2 text-sm leading-6 text-textSecondary">Cloud account and team collaboration foundations are reserved for later phases.</p>
        </div>
      </div>
      <p className="text-xs text-textMuted">Data ownership stays with the local profile by default. Team and cloud concepts are placeholders only.</p>
    </Card>
  );
};

