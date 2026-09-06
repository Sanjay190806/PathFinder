import React from 'react';
import { Badge } from '../ui/Badge';
import { IntegrationStatus } from '../../app/store/useIntegrationStore';

const labels: Record<IntegrationStatus, string> = {
  not_connected: 'Not connected',
  linked: 'Linked',
  connected: 'Connected',
  error: 'Error',
};

export const IntegrationStatusBadge: React.FC<{ status: IntegrationStatus }> = ({ status }) => {
  const variant = status === 'error' ? 'danger' : status === 'not_connected' ? 'neutral' : 'success';
  return <Badge variant={variant as any}>{labels[status]}</Badge>;
};
