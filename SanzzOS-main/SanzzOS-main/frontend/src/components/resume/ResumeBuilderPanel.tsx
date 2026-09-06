import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useResumeStudioStore } from '../../app/store/useResumeStudioStore';
import { calcResumeScore } from '../../utils/xpUtils';
import { createScoreSnapshot } from '../../utils/resumeStudioUtils';
import { ResumeScoreHistoryItem } from '../../types/resumeStudio';

const SECTION_KEYS = ['contact', 'education', 'skills', 'projects', 'achievements', 'formatting'] as const;

export const ResumeBuilderPanel: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const updateResume = useCareerStore((s) => s.updateResume);
  const selectedResumeVersion = useResumeStudioStore((s) => s.selectedResumeVersion);
  const addResumeScoreSnapshot = useResumeStudioStore((s) => s.addResumeScoreSnapshot);
  const tailoredVersions = useResumeStudioStore((s) => s.tailoredVersions);
  const [targetRole, setTargetRole] = useState(careerState.resume.targetRole || 'SWE');

  const score = calcResumeScore(careerState);
  const sectionValues = useMemo(() => careerState.resume.sections, [careerState.resume.sections]);

  const bumpSection = (key: keyof typeof sectionValues, delta: number) => {
    updateResume({
      targetRole,
      sections: {
        ...careerState.resume.sections,
        [key]: Math.max(0, Math.min(100, careerState.resume.sections[key] + delta)),
      },
      lastUpdated: new Date().toISOString(),
    });
  };

  const saveSnapshot = () => {
    const snapshot: ResumeScoreHistoryItem = createScoreSnapshot(
      selectedResumeVersion || careerState.resume.version,
      score,
      `Builder snapshot for ${targetRole}`
    );
    addResumeScoreSnapshot(snapshot);
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Resume Builder</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Target role and section tuning</h3>
        </div>
        <Badge variant={score >= 80 ? 'success' : score >= 60 ? 'neutral' : 'danger'}>{score}% ATS</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-bgSurface/30 p-3 text-xs text-textSecondary">
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">Target role</span>
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            onBlur={() =>
              updateResume({
                targetRole,
                lastUpdated: new Date().toISOString(),
              })
            }
            className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary focus:border-accentBlue focus:outline-none"
          />
        </label>
        <div className="rounded-2xl border border-border-subtle bg-bgSurface/30 p-3 text-xs text-textSecondary">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">Selected version</p>
          <p className="mt-2 text-base font-semibold text-textPrimary">{selectedResumeVersion || careerState.resume.version}</p>
          <p className="mt-1">Stored versions: {tailoredVersions.length}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {SECTION_KEYS.map((key) => (
          <div key={key} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-textPrimary capitalize">{key}</p>
              <Badge variant="neutral">{careerState.resume.sections[key]}%</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => bumpSection(key, -5)} className="flex-1">
                -5
              </Button>
              <Button type="button" size="sm" variant="primary" onClick={() => bumpSection(key, 5)} className="flex-1">
                +5
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={saveSnapshot}>
          Save Score Snapshot
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            updateResume({
              targetRole,
              lastUpdated: new Date().toISOString(),
            })
          }
        >
          Sync Builder Changes
        </Button>
      </div>
    </Card>
  );
};
