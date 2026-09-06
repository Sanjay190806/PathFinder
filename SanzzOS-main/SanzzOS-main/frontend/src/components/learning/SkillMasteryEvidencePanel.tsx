import React from 'react';
import { LearningPath, LearningSession } from '../../types/learning';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const SkillMasteryEvidencePanel: React.FC<{
  paths: LearningPath[];
  sessions: LearningSession[];
}> = ({ paths, sessions }) => (
  <Card className="p-5">
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Skill Mastery Evidence</p>
      <h3 className="mt-1 text-xl font-semibold text-textPrimary">Proof behind every skill score</h3>
    </div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {paths.map((path) => {
        const pathSessions = sessions.filter((session) => session.pathId === path.id);
        const notesWritten = pathSessions.filter((session) => session.notes || session.mistakes || session.nextAction).length;
        const mockSignal = path.category === 'interview' || path.category === 'communication' ? pathSessions.length : 0;
        return (
          <div key={path.id} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-textPrimary">{path.title}</p>
                <p className="mt-1 text-[11px] text-textMuted">{path.targetRoleRelevance}</p>
              </div>
              <Badge variant={path.masteryPercentage >= 70 ? 'success' : 'warning'}>{path.masteryPercentage}%</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-textSecondary">
              <Evidence label="Problems/sessions" value={pathSessions.length} />
              <Evidence label="Notes written" value={notesWritten} />
              <Evidence label="Quizzes passed" value={path.milestones.filter((item) => item.completed).length} />
              <Evidence label="Mock signal" value={mockSignal} />
            </div>
            <p className="mt-3 text-[10px] text-textMuted">Last practiced: {path.lastStudiedAt ? path.lastStudiedAt.slice(0, 10) : 'Not practiced yet'}</p>
          </div>
        );
      })}
    </div>
  </Card>
);

const Evidence: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-bgSurface/40 p-2">
    <p className="text-[9px] uppercase tracking-widest text-textMuted">{label}</p>
    <p className="mt-1 font-semibold text-textPrimary">{value}</p>
  </div>
);
