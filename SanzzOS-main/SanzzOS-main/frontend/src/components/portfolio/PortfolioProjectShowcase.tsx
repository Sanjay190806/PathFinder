import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const PortfolioProjectShowcase: React.FC<{ projects: { name: string; stack: string[]; summary: string; impact: string }[] }> = ({ projects }) => {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.name} className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-textPrimary">{project.name}</h3>
              <p className="mt-1 text-xs text-textSecondary">{project.summary}</p>
            </div>
            <Badge variant="primary">Showcase</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((item) => <Badge key={item} variant="neutral">{item}</Badge>)}
          </div>
          <p className="text-sm leading-6 text-textSecondary">{project.impact}</p>
        </Card>
      ))}
    </div>
  );
};

