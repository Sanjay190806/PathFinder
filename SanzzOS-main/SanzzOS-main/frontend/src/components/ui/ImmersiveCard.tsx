import React from 'react';

interface ImmersiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  glow?: boolean;
}

export const ImmersiveCard: React.FC<ImmersiveCardProps> = ({ 
  children, 
  interactive = false, 
  glow = true,
  className = '',
  ...props 
}) => {
  return (
    <div
      className={`hud-panel ${interactive ? 'hud-panel--interactive cursor-pointer' : ''} ${className}`}
      style={{
        boxShadow: glow ? undefined : 'none'
      }}
      {...props}
    >
      <div className="p-5 relative z-10">
        {children}
      </div>
    </div>
  );
};
export default ImmersiveCard;
