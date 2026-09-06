import React from 'react';
import { Badge } from '../ui/Badge';
import { ATSIssue } from '../../app/store/useResumeAnalysisStore';

export const ResumeIssueList: React.FC<{ issues: ATSIssue[] }> = ({ issues }) => (
  <div className="grid gap-3">
    {issues.length ? issues.map((issue) => <div key={issue.title} className="rounded-lg border border-border-subtle bg-bgBase/40 p-3"><div className="flex items-center justify-between gap-2"><h4 className="font-semibold text-textPrimary">{issue.title}</h4><Badge variant={issue.severity === 'critical' || issue.severity === 'high' ? 'danger' : issue.severity === 'medium' ? 'warning' : 'neutral'}>{issue.severity}</Badge></div><p className="mt-1 text-sm text-textSecondary">{issue.detail}</p><p className="mt-2 text-xs text-accentGreen">{issue.fix}</p></div>) : <p className="text-sm text-textSecondary">No major issues detected. Keep tailoring for the target role.</p>}
  </div>
);
