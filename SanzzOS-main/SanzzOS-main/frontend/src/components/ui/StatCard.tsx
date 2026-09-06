import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  accentColor?: string;
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  accentColor = '#3B82F6',
  description,
  className = ''
}) => {
  return (
    <Card hoverable className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accentColor }} />

      <div className="flex items-start justify-between gap-3 pt-2">
        <div className="min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">{title}</span>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-textPrimary">{value}</h3>
          {description && <p className="mt-1 text-[11px] text-textSecondary">{description}</p>}
        </div>
        {icon && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-white/5 text-textPrimary"
            style={{ color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
