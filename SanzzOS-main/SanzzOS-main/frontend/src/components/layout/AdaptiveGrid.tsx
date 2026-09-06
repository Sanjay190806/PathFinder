import React from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface AdaptiveGridProps {
  children: React.ReactNode;
  className?: string;
  density?: 'compact' | 'balanced' | 'detailed';
  minColumns?: number;
  maxColumns?: number;
}

export const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  children,
  className = '',
  density = 'balanced',
  minColumns = 1,
  maxColumns = 4
}) => {
  const bp = useBreakpoint();

  const getColsClass = () => {
    if (bp === 'xs') return 'grid-cols-1';
    if (bp === 'sm') return `grid-cols-${Math.min(maxColumns, Math.max(minColumns, 2))}`;
    
    // Laptop small / tablet landscape
    if (bp === 'md') return `grid-cols-${Math.min(maxColumns, Math.max(minColumns, 2))}`;
    
    // Laptop normal
    if (bp === 'lg') return `grid-cols-${Math.min(maxColumns, Math.max(minColumns, 3))}`;
    
    // Desktop normal
    if (bp === 'xl') return `grid-cols-${Math.min(maxColumns, Math.max(minColumns, 3))}`;
    
    // Large display
    return `grid-cols-${Math.min(maxColumns, Math.max(minColumns, 4))}`;
  };

  const getGapClass = () => {
    switch (density) {
      case 'compact': return 'gap-3';
      case 'detailed': return 'gap-6';
      case 'balanced':
      default:
        return 'gap-4.5';
    }
  };

  return (
    <div className={`grid ${getColsClass()} ${getGapClass()} ${className}`}>
      {children}
    </div>
  );
};
export default AdaptiveGrid;
