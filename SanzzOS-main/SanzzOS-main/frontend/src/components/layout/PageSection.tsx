import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PageSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({
  title,
  subtitle,
  children,
  collapsible = false,
  defaultOpen = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={`flex flex-col gap-3.5 ${className}`}>
      <div 
        className={`flex items-center justify-between ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-textPrimary">{title}</h3>
          {subtitle && <p className="text-[10px] text-textSecondary mt-0.5">{subtitle}</p>}
        </div>
        
        {collapsible && (
          <button 
            type="button" 
            className="text-textSecondary hover:text-textPrimary p-1 rounded transition bg-white/5 border border-white/5"
            aria-label={isOpen ? 'Collapse section' : 'Expand section'}
          >
            {isOpen ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>

      {(!collapsible || isOpen) && (
        <div className="transition-all duration-300">
          {children}
        </div>
      )}
    </section>
  );
};
export default PageSection;
