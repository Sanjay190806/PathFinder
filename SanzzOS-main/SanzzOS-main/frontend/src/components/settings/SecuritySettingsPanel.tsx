import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';

export const SecuritySettingsPanel: React.FC = () => (
  <Card className="flex flex-col gap-4">
    <div className="flex items-center gap-3 border-b border-border-subtle/50 pb-3">
      <ShieldCheck className="h-4 w-4 text-accentEmerald" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Security</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">Auth and backup safety</h3>
      </div>
    </div>
    <ul className="space-y-2 text-xs leading-5 text-textSecondary">
      <li>Tokens are never included in backup registry exports.</li>
      <li>Cloud APIs ignore frontend user IDs and scope data to the authenticated session.</li>
      <li>Backup restore and migration actions require explicit confirmation.</li>
      <li>The service worker bypasses API, auth, cloud, and sync requests.</li>
    </ul>
  </Card>
);
