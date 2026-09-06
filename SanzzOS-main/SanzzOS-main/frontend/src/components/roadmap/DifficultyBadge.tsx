import React from 'react';
import { Badge } from '../ui/Badge';

interface DifficultyBadgeProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const variantMap = {
    Easy: 'success' as const,
    Medium: 'warning' as const,
    Hard: 'danger' as const
  };

  return <Badge variant={variantMap[difficulty]}>{difficulty}</Badge>;
};
