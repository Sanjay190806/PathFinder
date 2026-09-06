import React from 'react';
import { DailyBriefingCard } from './DailyBriefingCard';
import { BriefingTimeline } from './BriefingTimeline';
import { ShaylaBriefingResult, ShaylaAgentHistoryItem } from '../../types/shaylaAgent';

type Props = {
  briefing: ShaylaBriefingResult | null;
  history: ShaylaAgentHistoryItem[];
  loading?: boolean;
  onGenerateMorning: () => void;
  onGenerateRecovery: () => void;
};

export const DailyBriefingPanel: React.FC<Props> = ({ briefing, history, loading, onGenerateMorning, onGenerateRecovery }) => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DailyBriefingCard
        briefing={briefing}
        loading={loading}
        onGenerateMorning={onGenerateMorning}
        onGenerateRecovery={onGenerateRecovery}
      />
      <BriefingTimeline
        title="Briefing history"
        items={history}
        emptyLabel="No agent briefings saved yet."
      />
    </div>
  );
};
