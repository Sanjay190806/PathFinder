import React from 'react';
import { LearningResource } from '../../types/learning';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const LearningResourceList: React.FC<{ resources: LearningResource[] }> = ({ resources }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Resources</h3>
    <div className="space-y-2">
      {resources.map((resource) => (
        <div key={resource.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
          <p className="text-sm font-medium text-textPrimary">{resource.title}</p>
          <Badge>{resource.type}</Badge>
        </div>
      ))}
    </div>
  </Card>
);
