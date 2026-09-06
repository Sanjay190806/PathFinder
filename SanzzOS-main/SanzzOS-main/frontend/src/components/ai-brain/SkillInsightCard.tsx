import React from 'react';
import { SkillProgress } from '../../types/aiBrain';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

interface Props {
  title: string;
  skills: SkillProgress[];
}

export const SkillInsightCard: React.FC<Props> = ({ title, skills }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">{title}</h3>
    <div className="space-y-4">
      {skills.map((skill) => (
        <div key={skill.id}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-textPrimary">{skill.name}</p>
              <p className="text-xs text-textMuted">{skill.evidence}</p>
            </div>
            <Badge variant={skill.score >= 70 ? 'success' : skill.score >= 45 ? 'warning' : 'danger'}>{skill.score}%</Badge>
          </div>
          <ProgressBar value={skill.score} />
        </div>
      ))}
    </div>
  </Card>
);
