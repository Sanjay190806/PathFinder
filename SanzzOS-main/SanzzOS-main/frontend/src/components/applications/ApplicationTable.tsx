import React from 'react';
import { CareerApplication } from '../../types';
import { Badge } from '../ui/Badge';
import { getNextAction } from '../../utils/applicationCrmUtils';

interface ApplicationTableProps {
  applications: CareerApplication[];
  onRowClick: (app: CareerApplication) => void;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({ applications, onRowClick }) => {
  const getStatusVariant = (status: string) => {
    if (status === 'Offer') return 'success';
    if (status === 'Rejected') return 'danger';
    if (status === 'Interview' || status === 'OA') return 'warning';
    return 'neutral';
  };

  if (applications.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-textSecondary text-xs">
        No tracked applications yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border-subtle rounded-2xl bg-bgCard/30">
      <table className="w-full text-left border-collapse text-xs select-none">
        <thead>
          <tr className="border-b border-border-subtle bg-bgSurface/40 text-textSecondary font-bold">
            <th className="p-3.5">Company</th>
            <th className="p-3.5">Role</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5">Next Action</th>
            <th className="p-3.5">Source</th>
            <th className="p-3.5">Salary</th>
            <th className="p-3.5">Applied Date</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const nextAction = getNextAction(app);
            return (
              <tr
                key={app.id}
                onClick={() => onRowClick(app)}
                className="border-b border-border-subtle/50 hover:bg-bgSurface/40 transition cursor-pointer text-textPrimary"
              >
                <td className="p-3.5 font-bold">{app.company}</td>
                <td className="p-3.5 text-textSecondary">{app.role}</td>
                <td className="p-3.5">
                  <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                </td>
                <td className="p-3.5">
                  <span className={nextAction.urgency === 'high' ? 'text-red-300' : nextAction.urgency === 'medium' ? 'text-yellow-200' : 'text-textSecondary'}>
                    {nextAction.label}
                  </span>
                </td>
                <td className="p-3.5 text-textSecondary">{app.source || 'Other'}</td>
                <td className="p-3.5 font-mono text-textSecondary">{app.salary || '-'}</td>
                <td className="p-3.5 font-mono text-textMuted">{app.date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
