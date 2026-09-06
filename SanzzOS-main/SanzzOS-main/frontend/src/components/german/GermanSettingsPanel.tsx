import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface GermanSettingsPanelProps {
  onLogMinutes: (minutes: number) => void;
  onReset: () => void;
}

export const GermanSettingsPanel: React.FC<GermanSettingsPanelProps> = ({ onLogMinutes, onReset }) => {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Study Controls</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Daily target and reset</h3>
        </div>
        <Badge variant="neutral">20 min/day</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onLogMinutes(10)}>Add 10 min</Button>
        <Button size="sm" variant="outline" onClick={() => onLogMinutes(20)}>Add 20 min</Button>
        <Button size="sm" variant="danger" onClick={onReset}>Reset German</Button>
      </div>

      <p className="text-xs text-textSecondary">German progress stays in the same persisted app snapshot as your main career data.</p>
    </Card>
  );
};
