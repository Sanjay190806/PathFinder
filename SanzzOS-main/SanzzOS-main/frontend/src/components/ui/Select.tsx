import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: readonly Option[] | Option[];
  error?: string;
  className?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-textSecondary pl-1">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none rounded-2xl border px-4 py-3 pr-11 text-sm text-textPrimary transition-all bg-white/[0.03] backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBlue/35 focus-visible:ring-offset-2 focus-visible:ring-offset-bgBase disabled:opacity-50 ${
            error ? 'border-red-500/60 focus-visible:ring-red-500/25' : 'border-border-subtle'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bgSurface text-textPrimary">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-textSecondary">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && <span className="text-[10px] text-red-400 pl-1">{error}</span>}
    </div>
  );
});

Select.displayName = "Select";
