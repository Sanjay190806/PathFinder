import React from 'react';
import { Card } from '../ui/Card';

export const GermanCultureTip: React.FC = () => {
  return (
    <Card className="bg-white/[0.04] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Culture Tip</p>
      <p className="mt-2 text-sm font-semibold text-textPrimary">Punctuality matters in German work culture.</p>
      <p className="mt-2 text-xs leading-6 text-textSecondary">
        Arriving on time, keeping updates short, and following through consistently are seen as strong signs of professionalism.
      </p>
    </Card>
  );
};
