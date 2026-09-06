import React from 'react';
import { Trash2, RefreshCw, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';
import { IntegrationSetupGuide } from './IntegrationSetupGuide';
import { IntegrationStatus } from '../../app/store/useIntegrationStore';

type Props = {
  serviceName: string;
  status: IntegrationStatus;
  profileUrl?: string;
  lastSync?: string;
  dataImported: string[];
  setupSteps: string[];
  children: React.ReactNode;
  onSave: () => void;
  onSync: () => void;
  onRemove: () => void;
};

export const IntegrationCard: React.FC<Props> = ({
  serviceName,
  status,
  profileUrl,
  lastSync,
  dataImported,
  setupSteps,
  children,
  onSave,
  onSync,
  onRemove,
}) => (
  <Card className="flex flex-col gap-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-textPrimary">{serviceName}</h3>
          <IntegrationStatusBadge status={status} />
        </div>
        <p className="mt-1 text-xs text-textMuted">
          {profileUrl ? <a className="text-accentBlue hover:underline" href={profileUrl} target="_blank" rel="noreferrer">{profileUrl}</a> : 'Add a public profile link or manual details.'}
        </p>
      </div>
      <div className="text-right text-xs text-textMuted">
        <p>Last sync</p>
        <p className="font-medium text-textSecondary">{lastSync ? new Date(lastSync).toLocaleString() : 'Never'}</p>
      </div>
    </div>

    {children}

    <div className="flex flex-wrap gap-2 text-xs text-textMuted">
      {dataImported.length ? dataImported.map((item) => <span key={item} className="rounded-full border border-border-subtle px-2 py-1">{item}</span>) : <span>No data imported yet</span>}
    </div>

    <IntegrationSetupGuide steps={setupSteps} />

    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={onSave}><Save className="mr-2 h-4 w-4" />Save</Button>
      <Button size="sm" variant="outline" onClick={onSync}><RefreshCw className="mr-2 h-4 w-4" />Mark synced</Button>
      <Button size="sm" variant="danger" onClick={onRemove}><Trash2 className="mr-2 h-4 w-4" />Remove</Button>
    </div>
  </Card>
);
