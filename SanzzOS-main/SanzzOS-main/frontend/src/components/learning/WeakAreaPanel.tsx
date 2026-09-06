import React from 'react';
import { LearningPath } from '../../types/learning';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const WeakAreaPanel: React.FC<{ paths: LearningPath[] }> = ({ paths }) => {
  const weakAreas = paths.flatMap((path) => path.weakAreas.map((area) => ({ area, path: path.title }))).slice(0, 8);
  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-textPrimary">Weak areas</h3>
      <div className="flex flex-wrap gap-2">
        {weakAreas.map((item) => <Badge key={`${item.path}-${item.area}`} variant="warning">{item.path}: {item.area}</Badge>)}
        {weakAreas.length === 0 && <p className="text-sm text-textSecondary">No weak areas logged yet.</p>}
      </div>
    </Card>
  );
};
