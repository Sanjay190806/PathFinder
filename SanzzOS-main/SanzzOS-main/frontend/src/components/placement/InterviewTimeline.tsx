import React from 'react';
import { PlacementCompany, PlacementRound } from '../../types/placement';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

export const InterviewTimeline: React.FC<{ interviews: PlacementRound[]; companies: PlacementCompany[] }> = ({ interviews, companies }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Interview timeline</h3>
    {interviews.length === 0 ? (
      <EmptyState title="No interviews yet" description="Scheduled and completed rounds will appear here." />
    ) : (
      <div className="space-y-3">
        {interviews.map((round) => (
          <div key={round.id} className="border-l-2 border-accentBlue pl-4">
            <p className="font-medium text-textPrimary">{companies.find((item) => item.id === round.companyId)?.name} - {round.roundName}</p>
            <p className="text-sm text-textSecondary">{round.date} · {round.result}</p>
          </div>
        ))}
      </div>
    )}
  </Card>
);
