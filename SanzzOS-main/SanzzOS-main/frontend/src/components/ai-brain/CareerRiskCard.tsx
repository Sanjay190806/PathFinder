import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { CareerRiskFlag } from '../../types/aiBrain';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export const CareerRiskCard: React.FC<{ risks: CareerRiskFlag[] }> = ({ risks }) => (
  <Card>
    <div className="mb-4 flex items-center gap-2">
      <ShieldAlert className="h-5 w-5 text-accentYellow" />
      <h3 className="text-lg font-semibold text-textPrimary">Risk alerts</h3>
    </div>
    {risks.length === 0 ? (
      <EmptyState title="No major risks detected" description="Your current career system signals look steady." />
    ) : (
      <div className="space-y-3">
        {risks.map((risk) => (
          <div key={risk.id} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-medium text-textPrimary">{risk.title}</p>
              <Badge variant={risk.severity === 'high' ? 'danger' : risk.severity === 'medium' ? 'warning' : 'neutral'}>{risk.severity}</Badge>
            </div>
            <p className="text-sm text-textSecondary">{risk.detail}</p>
          </div>
        ))}
      </div>
    )}
  </Card>
);
