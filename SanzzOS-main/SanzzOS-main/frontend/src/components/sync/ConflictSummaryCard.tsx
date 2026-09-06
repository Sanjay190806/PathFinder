import React from 'react';
import { SnapshotConflictSummary } from '../../services/cloud/conflictResolutionService';

export const ConflictSummaryCard: React.FC<{ summary: SnapshotConflictSummary }> = ({ summary }) => (
  <div className="rounded-xl border border-accentOrange/20 bg-accentOrange/10 p-3 text-xs text-accentOrange">
    <p className="font-semibold">{summary.conflict ? 'Conflict detected' : 'No conflict detected'}</p>
    <p className="mt-1">{summary.reason}</p>
  </div>
);
