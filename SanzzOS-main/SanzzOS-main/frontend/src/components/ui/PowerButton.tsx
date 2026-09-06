import React from 'react';

interface PowerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const PowerButton: React.FC<PowerButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseClasses = 'btn-power text-xs tracking-wider uppercase font-bold transition-all';
  
  let variantClasses = '';
  if (variant === 'secondary') {
    variantClasses = 'from-accentEmerald/80 to-black border-accentEmerald/40';
  } else if (variant === 'outline') {
    variantClasses = 'from-transparent to-transparent border-white/10 hover:border-accentBlue/40';
  }

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};
export default PowerButton;
