import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

export const GermanProgressSnapshotCard: React.FC<{
  title: string;
  label: string;
  value: number;
  details: string[];
}> = ({ title, label, value, details }) => {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">{title}</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">{label}</h3>
        </div>
        <Badge variant="primary">{value}%</Badge>
      </div>
      <ProgressBar value={value} color="#8B5CF6" />
      <div className="grid gap-2 text-sm text-textSecondary sm:grid-cols-2">
        {details.map((detail) => <div key={detail}>{detail}</div>)}
      </div>
    </Card>
  );
};

