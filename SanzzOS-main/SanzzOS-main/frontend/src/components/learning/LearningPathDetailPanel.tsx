import React from 'react';
import { LearningPath, LearningSession } from '../../types/learning';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const LearningPathDetailPanel: React.FC<{ path: LearningPath | null; sessions: LearningSession[] }> = ({ path, sessions }) => {
  if (!path) {
    return <Card><p className="text-sm text-textSecondary">Select a learning path to inspect details.</p></Card>;
  }
  const recentSessions = sessions.filter((session) => session.pathId === path.id).slice(0, 4);
  return (
    <Card className="space-y-4">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold text-textPrimary">{path.title}</h3>
          <Badge variant="primary">{path.category.replace('_', ' ')}</Badge>
          <Badge>{path.status.replace('_', ' ')}</Badge>
        </div>
        <p className="text-sm text-textSecondary">{path.description}</p>
        <p className="mt-2 text-xs text-textMuted">{path.targetRoleRelevance}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Info label="Current level" value={path.currentLevel.replace('_', ' ')} />
        <Info label="Target level" value={path.targetLevel.replace('_', ' ')} />
        <Info label="Last studied" value={path.lastStudiedAt ? path.lastStudiedAt.slice(0, 10) : 'Not yet'} />
        <Info label="Next review" value={path.nextReviewAt || 'Not scheduled'} />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-textMuted">Topics</p>
        <div className="flex flex-wrap gap-2">
          {path.topics.map((topic) => <Badge key={topic.id}>{topic.title} · {topic.masteryPercentage}%</Badge>)}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-textMuted">Recent sessions</p>
        {recentSessions.length ? recentSessions.map((session) => <p key={session.id} className="text-sm text-textSecondary">{session.topic} · {session.minutes} min · {session.confidence}</p>) : <p className="text-sm text-textSecondary">No sessions logged for this path.</p>}
      </div>
    </Card>
  );
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
    <p className="text-xs text-textMuted">{label}</p>
    <p className="text-sm font-medium capitalize text-textPrimary">{value}</p>
  </div>
);
