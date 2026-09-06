import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  // Compute overall progress as average of 6 dimensions
  const dims = project.progress || { backend: 0, frontend: 0, ai: 0, testing: 0, docs: 0, deploy: 0 };
  const overall = Math.round(
    (dims.backend + dims.frontend + dims.ai + dims.testing + dims.docs + dims.deploy) / 6
  );

  const getStatusVariant = (status: string) => {
    if (status === 'deployed') return 'success';
    if (status === 'building') return 'primary';
    if (status === 'testing') return 'warning';
    return 'neutral';
  };

  return (
    <Card hoverable onClick={onClick} className="flex flex-col h-[220px] justify-between relative">
      <div>
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-sm font-bold text-textPrimary leading-tight truncate">{project.name}</h3>
          <Badge variant={getStatusVariant(project.status)} className="capitalize">{project.status}</Badge>
        </div>
        <p className="text-[10px] text-textSecondary mt-2 line-clamp-2 min-h-[32px]">{project.description || "No description set yet."}</p>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {(project.stack || []).slice(0, 3).map((tag, idx) => (
            <Badge key={idx} variant="neutral" className="text-[9px] px-1.5 py-0.2">{tag}</Badge>
          ))}
          {(project.stack || []).length > 3 && (
            <span className="text-[8px] text-textMuted flex items-center font-bold">+{project.stack.length - 3}</span>
          )}
        </div>
      </div>

      <div className="border-t border-border-subtle/50 pt-3">
        <div className="flex justify-between items-center text-[10px] text-textSecondary font-bold mb-1.5 pl-0.5">
          <span>Overall Completeness</span>
          <span className="font-mono text-accentBlue">{overall}%</span>
        </div>
        <ProgressBar value={overall} color="var(--accent-blue)" />
      </div>
    </Card>
  );
};
