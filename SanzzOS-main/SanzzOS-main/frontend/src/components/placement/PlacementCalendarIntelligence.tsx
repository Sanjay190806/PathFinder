import React from 'react';
import { OARecord, PlacementApplication, PlacementCompany, PlacementOSReadiness, PlacementRound } from '../../types/placement';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const dayDiff = (date: string) => {
  const target = new Date(date);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
};

export const PlacementCalendarIntelligence: React.FC<{
  applications: PlacementApplication[];
  interviews: PlacementRound[];
  oaRecords: OARecord[];
  companies: PlacementCompany[];
  readiness: PlacementOSReadiness;
}> = ({ applications, interviews, oaRecords, companies, readiness }) => {
  const companyName = (companyId: string) => companies.find((company) => company.id === companyId)?.name || companyId;
  const scheduled = [
    ...applications.flatMap((app) => [
      ...(app.deadline ? [{ id: `${app.id}-deadline`, type: 'Deadline', companyId: app.companyId, date: app.deadline, detail: 'Application deadline alert' }] : []),
      ...(app.oaDate ? [{ id: `${app.id}-oa`, type: 'OA', companyId: app.companyId, date: app.oaDate, detail: 'Prep countdown for online assessment' }] : []),
      ...(app.interviewDate ? [{ id: `${app.id}-interview`, type: 'Interview', companyId: app.companyId, date: app.interviewDate, detail: 'Interview preparation countdown' }] : []),
      ...(app.followUpDate ? [{ id: `${app.id}-follow`, type: 'Follow-up', companyId: app.companyId, date: app.followUpDate, detail: 'Send polite application follow-up' }] : []),
    ]),
    ...interviews
      .filter((round) => round.result === 'scheduled')
      .map((round) => ({ id: round.id, type: round.roundType || 'Interview', companyId: round.companyId, date: round.date, detail: round.roundName })),
  ]
    .filter((item) => !Number.isNaN(new Date(item.date).getTime()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const mission = readiness.resumeScore < 70
    ? 'Finish resume checklist before broad applications.'
    : readiness.applicationMomentum < 40
      ? 'Move 2 target companies from wishlist to applied/preparing.'
      : readiness.oaScore < 50
        ? 'Run one OA simulation and log mistakes.'
        : 'Prepare one company-specific interview story and one follow-up.';

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Placement calendar intelligence</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">This week's placement mission</h3>
          <p className="mt-1 text-sm text-textSecondary">{mission}</p>
        </div>
        <Badge variant="primary">{readiness.score}% ready</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Signal label="Upcoming interviews" value={interviews.filter((round) => round.result === 'scheduled').length} />
        <Signal label="OA attempts logged" value={oaRecords.length} />
        <Signal label="Active companies" value={applications.filter((app) => app.status !== 'not_started').length} />
      </div>

      <div className="grid gap-2">
        {scheduled.length ? scheduled.map((item) => {
          const days = dayDiff(item.date);
          return (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-white/[0.03] p-3">
              <div>
                <p className="text-xs font-semibold text-textPrimary">{item.type} - {companyName(item.companyId)}</p>
                <p className="mt-0.5 text-[11px] text-textMuted">{item.detail}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-textPrimary">{item.date}</p>
                <p className="text-[10px] text-textMuted">{days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days}d left`}</p>
              </div>
            </div>
          );
        }) : (
          <div className="rounded-xl border border-dashed border-border-subtle bg-white/[0.02] p-4 text-sm text-textMuted">
            No upcoming OA, interview, deadline, or follow-up dates are set yet.
          </div>
        )}
      </div>
    </Card>
  );
};

const Signal: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-xl border border-border-subtle bg-white/[0.03] p-3">
    <p className="text-[10px] uppercase tracking-widest text-textMuted">{label}</p>
    <p className="mt-1 text-xl font-semibold text-textPrimary">{value}</p>
  </div>
);
