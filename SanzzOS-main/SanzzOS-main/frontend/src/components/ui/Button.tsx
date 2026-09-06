import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-accentBlue text-white hover:bg-blue-600 shadow-glow-blue",
    secondary: "bg-accentPurple text-white hover:bg-purple-600 shadow-glow-purple",
    outline: "border border-border-subtle text-textPrimary hover:bg-bg-glass-hover hover:border-textSecondary",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
    ghost: "text-textSecondary hover:text-textPrimary hover:bg-bg-glass"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base"
  };

  return (
    <button
      type="button"
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBlue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bgBase ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
