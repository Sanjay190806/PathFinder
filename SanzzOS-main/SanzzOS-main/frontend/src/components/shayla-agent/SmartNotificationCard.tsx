import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AlertTriangle, Bell, CheckCircle2, Info, Trash2 } from 'lucide-react';
import { ShaylaSmartNotification } from '../../types/shaylaAgent';

type Props = {
  notification: ShaylaSmartNotification;
  onAction?: (notification: ShaylaSmartNotification) => void;
  onDismiss?: (notification: ShaylaSmartNotification) => void;
};

const iconByType = {
  warning: <AlertTriangle className="h-4 w-4 text-accentYellow" />,
  success: <CheckCircle2 className="h-4 w-4 text-accentEmerald" />,
  info: <Info className="h-4 w-4 text-accentBlue" />,
  critical: <Bell className="h-4 w-4 text-accentOrange" />,
};

export const SmartNotificationCard: React.FC<Props> = ({ notification, onAction, onDismiss }) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bgSurface/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-border-subtle bg-white/[0.04] p-2">
            {iconByType[notification.type]}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-textPrimary">{notification.title}</p>
              <Badge variant={notification.type === 'critical' ? 'danger' : notification.type === 'success' ? 'success' : 'neutral'}>
                {notification.type}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-textSecondary">{notification.message}</p>
          </div>
        </div>
        {onDismiss && (
          <Button size="sm" variant="ghost" onClick={() => onDismiss(notification)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Dismiss
          </Button>
        )}
      </div>

      {notification.actionLabel && onAction && (
        <div className="mt-3">
          <Button size="sm" variant="outline" onClick={() => onAction(notification)}>
            {notification.actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
