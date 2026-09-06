import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CareerApplication } from '../../types';
import { getNextAction } from '../../utils/applicationCrmUtils';

interface ApplicationCardProps {
  application: CareerApplication;
  onClick: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onClick }) => {
  const nextAction = getNextAction(application);
  const getStatusVariant = (status: string) => {
    if (status === 'Offer') return 'success';
    if (status === 'Rejected') return 'danger';
    if (status === 'Interview' || status === 'OA') return 'warning';
    return 'neutral';
  };

  return (
    <Card hoverable onClick={onClick} className="p-3.5 flex flex-col gap-2 relative bg-bgSurface border border-border-subtle cursor-pointer select-none">
      <div className="flex justify-between items-start gap-2">
        <h4 className="text-xs font-bold text-textPrimary truncate">{application.company}</h4>
        <Badge variant={getStatusVariant(application.status)} className="text-[8px] py-0">{application.status}</Badge>
      </div>
      <p className="text-[10px] text-textSecondary truncate">{application.role}</p>
      <div className={`rounded-lg border px-2 py-1 text-[9px] ${
        nextAction.urgency === 'high'
          ? 'border-red-500/30 bg-red-500/10 text-red-300'
          : nextAction.urgency === 'medium'
            ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200'
            : 'border-border-subtle bg-bgCard/40 text-textSecondary'
      }`}>
        {nextAction.label}
      </div>
      
      <div className="flex justify-between items-center mt-2 text-[9px] text-textMuted border-t border-border-subtle/50 pt-2 font-mono">
        <span>{application.date}</span>
        <span className="text-textSecondary">{application.priority || application.salary || 'Medium'}</span>
      </div>
    </Card>
  );
};
