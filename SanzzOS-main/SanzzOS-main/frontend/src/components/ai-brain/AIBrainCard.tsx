import React from 'react';
import { Brain, RefreshCw } from 'lucide-react';
import { AIBrainSummary } from '../../types/aiBrain';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

interface Props {
  summary: AIBrainSummary;
  onRefresh?: () => void;
}

export const AIBrainCard: React.FC<Props> = ({ summary, onRefresh }) => (
  <Card className="flex flex-col gap-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-accentBlue">
          <Brain className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest">AI Brain</span>
        </div>
        <h2 className="text-2xl font-semibold text-textPrimary">Career context engine</h2>
        <p className="mt-2 max-w-2xl text-sm text-textSecondary">
          {summary.profile.degree}, {summary.profile.year}, batch {summary.profile.batch}. Current direction: {summary.profile.currentDirection.join(', ')}.
        </p>
      </div>
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      )}
    </div>
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-textSecondary">Placement readiness</span>
        <span className="font-semibold text-textPrimary">{summary.placementReadinessScore}%</span>
      </div>
      <ProgressBar value={summary.placementReadinessScore} />
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
        <p className="text-xs text-textMuted">Streak</p>
        <p className="text-xl font-semibold text-textPrimary">{summary.currentStreak} days</p>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
        <p className="text-xs text-textMuted">Portfolio</p>
        <p className="text-xl font-semibold text-textPrimary">{summary.projectPortfolioStrength}%</p>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
        <p className="text-xs text-textMuted">Burnout risk</p>
        <p className="text-xl font-semibold capitalize text-textPrimary">{summary.burnoutRisk}</p>
      </div>
    </div>
  </Card>
);
