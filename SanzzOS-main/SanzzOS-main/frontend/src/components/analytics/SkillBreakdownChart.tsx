import React from 'react';
import { SkillAnalytics } from '../../types/analytics';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const SkillBreakdownChart: React.FC<{ skills: SkillAnalytics[] }> = ({ skills }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Skill breakdown</h3>
    <div className="space-y-3">
      {skills.slice(0, 10).map((skill) => (
        <div key={skill.skillId}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium text-textPrimary">{skill.title}</span>
            <span className="text-textSecondary">{skill.mastery}% · {skill.hours.toFixed(1)}h</span>
          </div>
          <ProgressBar value={skill.mastery} />
        </div>
      ))}
    </div>
  </Card>
);
