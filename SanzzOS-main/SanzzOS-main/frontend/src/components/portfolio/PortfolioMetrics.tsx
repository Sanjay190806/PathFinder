import React from 'react';
import { Card } from '../ui/Card';

export const PortfolioMetrics: React.FC<{ items: { label: string; value: string; detail: string }[] }> = ({ items }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">{item.label}</p>
          <div className="text-2xl font-semibold text-textPrimary">{item.value}</div>
          <p className="text-xs text-textSecondary">{item.detail}</p>
        </Card>
      ))}
    </div>
  );
};

