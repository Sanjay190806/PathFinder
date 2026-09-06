import React from 'react';
import { Sparkles } from 'lucide-react';
import { AIRecommendation } from '../../types/aiBrain';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const AIRecommendationPanel: React.FC<{ recommendations: AIRecommendation[] }> = ({ recommendations }) => (
  <Card>
    <div className="mb-4 flex items-center gap-2">
      <Sparkles className="h-5 w-5 text-accentPurple" />
      <h3 className="text-lg font-semibold text-textPrimary">Recommended next actions</h3>
    </div>
    <div className="space-y-3">
      {recommendations.map((item) => (
        <div key={item.id} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-textPrimary">{item.title}</h4>
            <Badge variant={item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'neutral'}>{item.priority}</Badge>
          </div>
          <p className="text-sm text-textSecondary">{item.detail}</p>
        </div>
      ))}
    </div>
  </Card>
);
