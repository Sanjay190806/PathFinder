import React from 'react';
import { ApplicationStatus, OARecord, PlacementApplication, PlacementCompany, PlacementRound } from '../../types/placement';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const statuses: ApplicationStatus[] = ['not_started', 'preparing', 'applied', 'oa_scheduled', 'oa_completed', 'interview_scheduled', 'interview_completed', 'selected', 'rejected', 'on_hold'];

export const CompanyDetailPanel: React.FC<{
  company: PlacementCompany | null;
  status: ApplicationStatus;
  application?: PlacementApplication;
  oaRecords?: OARecord[];
  interviews?: PlacementRound[];
  onStatusChange: (status: ApplicationStatus) => void;
}> = ({ company, status, application, oaRecords = [], interviews = [], onStatusChange }) => {
  if (!company) {
    return (
      <Card>
        <p className="text-sm text-textSecondary">Select a company to inspect rounds, focus areas, and next actions.</p>
      </Card>
    );
  }

  const checklist = [
    { label: 'DSA focus', value: company.dsaFocus, done: status !== 'not_started' },
    { label: 'CS core focus', value: company.csCoreFocus, done: status === 'interview_scheduled' || status === 'interview_completed' || status === 'selected' },
    { label: 'Aptitude/OA', value: company.aptitudeFocus, done: oaRecords.length > 0 || status === 'oa_completed' },
    { label: 'Resume tailoring', value: company.resumeTips, done: Boolean(application?.resumeVersion) || status !== 'not_started' },
    { label: 'Project story', value: 'Prepare 90-second project explanation for this role.', done: interviews.length > 0 },
  ];
  const followUpLabel = application?.followUpDate || (status === 'applied' ? 'Set follow-up in 3-5 days' : 'No follow-up set');

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-textPrimary">{company.name}</h3>
        <p className="mt-1 text-sm text-textSecondary">{company.hiringProcess}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Info label="DSA" value={company.dsaFocus} />
        <Info label="SQL" value={company.sqlFocus} />
        <Info label="Aptitude" value={company.aptitudeFocus} />
        <Info label="Resume tip" value={company.resumeTips} />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-textMuted">Per-company prep checklist</p>
        <div className="grid gap-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-start gap-2 rounded-xl border border-border-subtle bg-white/[0.03] p-3">
              <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${item.done ? 'bg-accentEmerald' : 'bg-white/20'}`} />
              <div>
                <p className="text-xs font-semibold text-textPrimary">{item.label}</p>
                <p className="mt-0.5 text-[11px] text-textMuted">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Info label="OA history" value={oaRecords.length ? `${oaRecords.length} attempt(s), latest ${oaRecords[0].score}%` : 'No OA logged yet'} />
        <Info label="Interview rounds" value={interviews.length ? `${interviews.length} round(s) logged` : 'No interview round logged yet'} />
        <Info label="Follow-up" value={followUpLabel} />
        <Info label="Resume version" value={application?.resumeVersion || 'Not selected'} />
        <Info label="Company notes" value={application?.notes || company.notes || 'No notes yet'} />
        <Info label="Next action" value={application?.nextAction || 'Continue preparation'} />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-textMuted">Application status</p>
        <div className="flex flex-wrap gap-2">
          {statuses.map((item) => (
            <Button key={item} size="sm" variant={status === item ? 'primary' : 'outline'} onClick={() => onStatusChange(item)}>
              {item.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
    <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">{label}</p>
    <p className="mt-1 text-sm text-textSecondary">{value}</p>
  </div>
);
