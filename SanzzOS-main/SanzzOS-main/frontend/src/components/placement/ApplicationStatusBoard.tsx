import React from 'react';
import { ApplicationStatus, PlacementApplication, PlacementCompany } from '../../types/placement';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

type PipelineColumn = {
  title: string;
  hint: string;
  statuses: ApplicationStatus[];
};

const columns: PipelineColumn[] = [
  { title: 'Wishlist', hint: 'Target and prep', statuses: ['not_started', 'preparing'] },
  { title: 'Applied', hint: 'Submitted resumes', statuses: ['applied'] },
  { title: 'OA', hint: 'Assessment stage', statuses: ['oa_scheduled', 'oa_completed'] },
  { title: 'Interview', hint: 'Tech and HR rounds', statuses: ['interview_scheduled', 'interview_completed'] },
  { title: 'Final', hint: 'Offer, reject, hold', statuses: ['selected', 'rejected', 'on_hold'] },
];

export const ApplicationStatusBoard: React.FC<{
  applications: PlacementApplication[];
  companies: PlacementCompany[];
  onStatusChange?: (companyId: string, status: ApplicationStatus) => void;
}> = ({ applications, companies, onStatusChange }) => {
  const applicationByCompany = new Map(applications.map((app) => [app.companyId, app]));
  const cards = companies.map((company) => ({
    company,
    application: applicationByCompany.get(company.id) || {
      id: `virtual-${company.id}`,
      companyId: company.id,
      status: 'not_started' as ApplicationStatus,
      updatedAt: '',
      nextAction: company.priority === 'high' ? 'Create company prep checklist' : 'Keep warm as backup target'
    }
  }));

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Company pipeline board</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Wishlist to offer/rejected</h3>
        </div>
        <Badge variant="primary">{applications.filter((app) => app.status !== 'not_started').length} active</Badge>
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        {columns.map((column) => {
          const items = cards.filter((card) => column.statuses.includes(card.application.status));
          return (
            <div key={column.title} className="min-h-[220px] rounded-2xl border border-border-subtle bg-white/[0.025] p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-textPrimary">{column.title}</p>
                  <p className="text-[10px] text-textMuted">{column.hint}</p>
                </div>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-textMuted">{items.length}</span>
              </div>

              <div className="flex flex-col gap-2">
                {items.map(({ application, company }) => (
                  <div key={application.id} className="rounded-xl border border-white/10 bg-bgSurface/50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-textPrimary">{company.name}</p>
                        <p className="mt-0.5 text-[10px] text-textMuted">{company.targetRole}</p>
                      </div>
                      <Badge>{company.priority}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[10px] text-textSecondary">{application.nextAction}</p>
                    {onStatusChange && (
                      <div className="mt-3 grid grid-cols-2 gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-[9px]" onClick={() => onStatusChange(company.id, 'applied')}>
                          Applied
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[9px]" onClick={() => onStatusChange(company.id, 'interview_scheduled')}>
                          Interview
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
