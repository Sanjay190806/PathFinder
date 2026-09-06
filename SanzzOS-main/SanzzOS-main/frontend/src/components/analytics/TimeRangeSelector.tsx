import React from 'react';
import { AnalyticsTimeRange } from '../../types/analytics';

const ranges: Array<{ id: AnalyticsTimeRange; label: string }> = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'All time' }
];

export const TimeRangeSelector: React.FC<{ value: AnalyticsTimeRange; onChange: (range: AnalyticsTimeRange) => void }> = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {ranges.map((range) => (
      <button key={range.id} type="button" onClick={() => onChange(range.id)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${value === range.id ? 'border-border-accent bg-white/[0.1] text-textPrimary' : 'border-border-subtle bg-white/[0.03] text-textSecondary'}`}>
        {range.label}
      </button>
    ))}
  </div>
);
