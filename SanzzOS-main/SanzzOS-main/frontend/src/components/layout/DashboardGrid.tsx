import React from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children, className = '' }) => {
  const bp = useBreakpoint();

  const getGridClass = () => {
    if (bp === 'xs') return 'grid-cols-1 gap-4';
    if (bp === 'sm') return 'grid-cols-1 sm:grid-cols-2 gap-4';
    if (bp === 'md') return 'grid-cols-2 gap-5';
    if (bp === 'lg') return 'grid-cols-2 lg:grid-cols-3 gap-5';
    // Large and ultra wide setups
    return 'grid-cols-3 xl:grid-cols-4 gap-6';
  };

  return (
    <div className={`grid ${getGridClass()} ${className}`}>
      {children}
    </div>
  );
};
export default DashboardGrid;
