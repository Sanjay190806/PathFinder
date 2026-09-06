import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverable = false, style }) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`glass-card surface-card p-5 ${hoverable || onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:border-border-accent' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
