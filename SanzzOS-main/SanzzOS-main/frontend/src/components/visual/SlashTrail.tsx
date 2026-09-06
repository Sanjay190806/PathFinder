import React from 'react';

interface SlashTrailProps {
  delay: string;
}

export const SlashTrail: React.FC<SlashTrailProps> = ({ delay }) => {
  return (
    <div
      className="absolute top-1/4 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-accentOrange/40 to-transparent rotate-[-12deg] pointer-events-none z-0"
      style={{
        animation: 'slash-sweep 3.5s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        animationDelay: delay
      }}
    />
  );
};
export default SlashTrail;
