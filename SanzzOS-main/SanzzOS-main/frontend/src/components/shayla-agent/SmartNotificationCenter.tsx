import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ShaylaSmartNotification } from '../../types/shaylaAgent';
import { SmartNotificationCard } from './SmartNotificationCard';

type Props = {
  notifications: ShaylaSmartNotification[];
  onAction?: (notification: ShaylaSmartNotification) => void;
  onDismiss?: (notification: ShaylaSmartNotification) => void;
  title?: string;
};

export const SmartNotificationCenter: React.FC<Props> = ({
  notifications,
  onAction,
  onDismiss,
  title = 'Smart notifications',
}) => {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Shayla Agent</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">{title}</h3>
        </div>
        <Badge variant="neutral">{notifications.length} active</Badge>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-white/[0.02] p-4 text-xs text-textSecondary">
          No active notifications. Shayla will surface nudges only when they matter.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <SmartNotificationCard
              key={notification.id}
              notification={notification}
              onAction={onAction}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
