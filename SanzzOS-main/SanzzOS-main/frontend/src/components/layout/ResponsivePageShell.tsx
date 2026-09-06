import React from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface ResponsivePageShellProps {
  children: React.ReactNode;
  className?: string;
  density?: 'compact' | 'balanced' | 'detailed';
}

export const ResponsivePageShell: React.FC<ResponsivePageShellProps> = ({
  children,
  className = '',
  density = 'balanced'
}) => {
  const bp = useBreakpoint();

  const getPaddingClass = () => {
    // Combine breakpoint and layout density for optimized breathing room
    if (bp === 'xs') return 'px-4 py-4 gap-4';
    
    switch (density) {
      case 'compact':
        return 'px-5 py-4 gap-4';
      case 'detailed':
        return 'px-8 py-8 gap-8';
      case 'balanced':
      default:
        return 'px-6 py-6 gap-6';
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto flex flex-col ${getPaddingClass()} ${className}`}>
      {children}
    </div>
  );
};
export default ResponsivePageShell;
