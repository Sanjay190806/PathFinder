import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'orange';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    primary: "bg-accentBlue/10 text-accentBlue border-accentBlue/20",
    success: "bg-accentEmerald/10 text-accentEmerald border-accentEmerald/20",
    warning: "bg-accentYellow/10 text-accentYellow border-accentYellow/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    neutral: "bg-bg-glass-hover text-textSecondary border-border-subtle",
    orange: "bg-accentOrange/10 text-accentOrange border-accentOrange/20"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border backdrop-blur-sm ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
