import React from 'react';
import { LearningPath } from '../../types/learning';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const SkillMasteryGrid: React.FC<{ paths: LearningPath[] }> = ({ paths }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Skill mastery grid</h3>
    <div className="grid gap-3 md:grid-cols-2">
      {paths.map((path) => (
        <div key={path.id}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium text-textPrimary">{path.title}</span>
            <span className="text-textSecondary">{path.masteryPercentage}%</span>
          </div>
          <ProgressBar value={path.masteryPercentage} />
        </div>
      ))}
    </div>
  </Card>
);
