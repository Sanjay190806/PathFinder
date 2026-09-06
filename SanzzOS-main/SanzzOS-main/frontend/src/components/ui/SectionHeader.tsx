import React from 'react';

interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = ''
}) => {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 ${className}`}>
      <div>
        <h2 className="text-xl font-bold text-textPrimary tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-textSecondary mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 w-full md:w-auto">{actions}</div>}
    </div>
  );
};
