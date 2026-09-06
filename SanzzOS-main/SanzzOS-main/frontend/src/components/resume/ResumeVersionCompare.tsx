import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useResumeStudioStore } from '../../app/store/useResumeStudioStore';

export const ResumeVersionCompare: React.FC = () => {
  const resume = useCareerStore((s) => s.resume);
  const tailoredVersions = useResumeStudioStore((s) => s.tailoredVersions);
  const selected = useResumeStudioStore((s) => s.selectedResumeVersion);
  const setSelected = useResumeStudioStore((s) => s.setSelectedResumeVersion);

  const latest = tailoredVersions[0] || null;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Version History</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Compare resume versions</h3>
        </div>
        <Badge variant="neutral">{tailoredVersions.length} tailored versions</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">Current resume</p>
          <p className="mt-2 text-base font-semibold text-textPrimary">{resume.version}</p>
          <p className="mt-1 text-xs text-textSecondary">Target role: {resume.targetRole}</p>
          <p className="mt-2 text-xs text-textSecondary">ATS score: {resume.atsScore}%</p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">Selected tailored version</p>
          <p className="mt-2 text-base font-semibold text-textPrimary">{selected}</p>
          <p className="mt-1 text-xs text-textSecondary">{latest?.summary || 'No tailored version created yet.'}</p>
          {latest && (
            <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => setSelected(latest.id)}>
              Select latest tailored version
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {tailoredVersions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-white/[0.02] p-4 text-xs text-textSecondary">
            No tailored versions yet. Use Tailor to Job to create one.
          </div>
        ) : (
          tailoredVersions.slice(0, 5).map((version) => (
            <div key={version.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-bgSurface/30 p-4">
              <div>
                <p className="text-sm font-semibold text-textPrimary">{version.name}</p>
                <p className="text-[11px] text-textMuted">{version.summary}</p>
              </div>
              <Button type="button" size="sm" variant={selected === version.id ? 'primary' : 'outline'} onClick={() => setSelected(version.id)}>
                {selected === version.id ? 'Selected' : 'Select'}
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
