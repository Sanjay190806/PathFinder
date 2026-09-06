import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`glass-panel p-5 relative overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};
export default GlassPanel;
