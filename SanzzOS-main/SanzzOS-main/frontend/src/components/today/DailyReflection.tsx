import React from 'react';
import { Card } from '../ui/Card';

interface DailyReflectionProps {
  note: string;
  onNoteChange: (val: string) => void;
}

export const DailyReflection: React.FC<DailyReflectionProps> = ({ note, onNoteChange }) => {
  return (
    <Card className="flex flex-col gap-2">
      <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block pl-0.5">Daily reflection notes</label>
      <textarea
        placeholder="Document what went well today, challenges encountered, or German concepts learned..."
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        className="w-full bg-bgSurface border border-border-subtle text-textPrimary text-xs rounded-xl px-4 py-3 transition focus:outline-none focus:border-accentBlue h-28 resize-none"
      />
    </Card>
  );
};
