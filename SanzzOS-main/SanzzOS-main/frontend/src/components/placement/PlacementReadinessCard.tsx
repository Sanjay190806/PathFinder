import React from 'react';
import { PlacementOSReadiness } from '../../types/placement';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const PlacementReadinessCard: React.FC<{ readiness: PlacementOSReadiness }> = ({ readiness }) => (
  <Card>
    <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Placement OS</p>
    <h2 className="mt-1 text-2xl font-semibold text-textPrimary">{readiness.score}% ready</h2>
    <div className="mt-4">
      <ProgressBar value={readiness.score} />
    </div>
    <p className="mt-3 text-sm text-textSecondary">{readiness.nextAction}</p>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Metric label="Resume" value={readiness.resumeScore} />
      <Metric label="Companies" value={readiness.companyPrepScore} />
      <Metric label="Interviews" value={readiness.interviewScore} />
      <Metric label="OA" value={readiness.oaScore} />
    </div>
    <div className="mt-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-textMuted">Readiness breakdown</p>
      <div className="grid gap-2">
        <Breakdown label="DSA readiness" value={readiness.dsaReadiness} />
        <Breakdown label="CS core readiness" value={readiness.csCoreReadiness} />
        <Breakdown label="Aptitude readiness" value={readiness.aptitudeReadiness} />
        <Breakdown label="Project readiness" value={readiness.projectReadiness} />
        <Breakdown label="Communication readiness" value={readiness.communicationReadiness} />
        <Breakdown label="Application momentum" value={readiness.applicationMomentum} />
      </div>
    </div>
  </Card>
);

const Metric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
    <p className="text-xs text-textMuted">{label}</p>
    <p className="text-lg font-semibold text-textPrimary">{value}%</p>
  </div>
);

const Breakdown: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="mb-1 flex items-center justify-between gap-3 text-xs">
      <span className="text-textSecondary">{label}</span>
      <span className="font-semibold text-textPrimary">{value}%</span>
    </div>
    <ProgressBar value={value} />
  </div>
);
