import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-textSecondary pl-1">{label}</label>}
      <input
        ref={ref}
        className={`w-full rounded-2xl border px-4 py-3 text-sm text-textPrimary transition-all bg-white/[0.03] backdrop-blur-sm placeholder:text-textMuted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBlue/35 focus-visible:ring-offset-2 focus-visible:ring-offset-bgBase disabled:opacity-50 ${
          error ? 'border-red-500/60 focus-visible:ring-red-500/25' : 'border-border-subtle'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-[10px] text-red-400 pl-1">{error}</span>}
    </div>
  );
});

Input.displayName = "Input";
