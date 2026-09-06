import React from 'react';
import { LearningPath, LearningSession, RevisionItem } from '../../types/learning';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

export const RevisionEnginePanel: React.FC<{
  paths: LearningPath[];
  sessions: LearningSession[];
  dueRevision: RevisionItem[];
  allRevision: RevisionItem[];
  onComplete: (id: string) => void;
}> = ({ paths, sessions, dueRevision, allRevision, onComplete }) => {
  const weakPaths = [...paths].sort((a, b) => a.masteryPercentage - b.masteryPercentage).slice(0, 5);
  const revisionXp = allRevision.filter((item) => item.status === 'completed').length * 12 + dueRevision.length * 3;
  const recentLowConfidence = sessions.filter((session) => session.confidence === 'low').slice(0, 4);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Revision Engine</p>
          <h3 className="mt-1 text-xl font-semibold text-textPrimary">Due today, weakness heatmap, explain prompts</h3>
        </div>
        <Badge variant={dueRevision.length ? 'warning' : 'success'}>{dueRevision.length} due today</Badge>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Due today queue</p>
          <div className="mt-3 grid gap-2">
            {dueRevision.length ? dueRevision.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-bgSurface/50 p-3">
                <p className="text-xs font-semibold text-textPrimary">{item.topic}</p>
                <p className="mt-1 text-[10px] text-textMuted">{item.reason} - {item.confidence} confidence</p>
                <Button size="sm" variant="outline" className="mt-2 h-7 text-[9px]" onClick={() => onComplete(item.id)}>
                  Complete +12 XP
                </Button>
              </div>
            )) : <p className="text-sm text-textMuted">No revision due today.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Weakness heatmap</p>
          <div className="mt-3 grid gap-2">
            {weakPaths.map((path) => (
              <div key={path.id}>
                <div className="mb-1 flex justify-between text-[10px]">
                  <span className="text-textSecondary">{path.title}</span>
                  <span className="font-semibold text-textPrimary">{path.masteryPercentage}%</span>
                </div>
                <ProgressBar value={path.masteryPercentage} color={path.masteryPercentage < 40 ? '#dc2626' : path.masteryPercentage < 70 ? '#f97316' : '#22c55e'} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Explain in your own words</p>
          <div className="mt-3 grid gap-2">
            {(recentLowConfidence.length ? recentLowConfidence : sessions.slice(0, 4)).map((session) => (
              <div key={session.id} className="rounded-xl border border-white/10 bg-bgSurface/50 p-3">
                <p className="text-xs font-semibold text-textPrimary">{session.topic}</p>
                <p className="mt-1 text-[10px] text-textMuted">Prompt: explain the intuition, one mistake, and the next review step.</p>
              </div>
            ))}
            {!sessions.length && <p className="text-sm text-textMuted">Log sessions to unlock explanation prompts.</p>}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-accentOrange/20 bg-accentOrange/5 p-3 text-sm text-textSecondary">
        Revision XP: <span className="font-semibold text-textPrimary">{revisionXp}</span>. Spaced repetition comes from confidence: low = 1 day, medium = 3 days, high = 7 days.
      </div>
    </Card>
  );
};
