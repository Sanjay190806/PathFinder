import React from 'react';
import { Folder } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = <Folder className="h-8 w-8" /> }) => {
  return (
    <div className="glass-card mx-auto flex max-w-sm flex-col items-center justify-center p-8 text-center">
      <div className="mb-3 text-3xl">{icon}</div>
      <h3 className="mb-1 text-sm font-bold text-textPrimary">{title}</h3>
      <p className="text-xs text-textSecondary">{description}</p>
    </div>
  );
};
