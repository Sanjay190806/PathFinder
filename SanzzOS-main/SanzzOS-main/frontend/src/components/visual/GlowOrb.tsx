import React from 'react';

interface GlowOrbProps {
  color: string;
  size: string;
  position: string;
}

export const GlowOrb: React.FC<GlowOrbProps> = ({ color, size, position }) => {
  return (
    <div
      className={`absolute rounded-full glow-orb animate-pulse-glow ${size} ${position}`}
      style={{
        backgroundColor: color
      }}
    />
  );
};
