import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type Props = {
  summary: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ResumeSuggestionConfirmation: React.FC<Props> = ({ summary, onConfirm, onCancel }) => {
  return (
    <Card className="flex flex-col gap-4 border-accentBlue/20 bg-accentBlue/5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Confirmation</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">Apply suggestions manually</h3>
      </div>
      <p className="text-xs text-textSecondary">{summary}</p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={onConfirm}>
          Confirm and save version
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
};
