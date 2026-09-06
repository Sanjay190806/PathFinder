import React from 'react';
import { Button } from '../ui/Button';

interface SaveDayButtonProps {
  onSave: () => void;
}

export const SaveDayButton: React.FC<SaveDayButtonProps> = ({ onSave }) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <Button
        onClick={onSave}
        variant="primary"
        className="w-full text-sm py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600 transition shadow-lg"
      >
        <span>💾</span>
        <span>Save Daily Progress Logs</span>
      </Button>
      <span className="text-[10px] text-textMuted text-center">
        Saves locally and computes level XP multipliers immediately.
      </span>
    </div>
  );
};
