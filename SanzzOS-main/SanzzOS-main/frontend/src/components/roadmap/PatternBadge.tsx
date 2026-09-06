import React from 'react';
import { Badge } from '../ui/Badge';

interface PatternBadgeProps {
  pattern: string;
}

export const PatternBadge: React.FC<PatternBadgeProps> = ({ pattern }) => {
  return (
    <Badge variant="neutral" className="bg-bgSurface text-textSecondary border border-border-subtle max-w-[120px] truncate">
      {pattern}
    </Badge>
  );
};
