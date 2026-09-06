import React from 'react';

export const NeonAtmosphere: React.FC = () => {
  return (
    <div 
      aria-hidden="true" 
      className="pointer-events-none fixed inset-0 z-0 h-full w-full select-none"
    >
      {/* 1. Base dark theme background */}
      <div className="absolute inset-0 bg-[#06060f]" />

      {/* 2. Top-left blue/cyan soft glow aurora */}
      <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[50%] rounded-full bg-cyan-500/10 blur-[120px]" />

      {/* 3. Bottom-right purple/indigo soft glow aurora */}
      <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[50%] rounded-full bg-purple-500/10 blur-[120px]" />

      {/* 4. Center very soft emerald ambient light to make layout feel rich */}
      <div className="absolute top-[30%] left-[40%] h-[40%] w-[40%] rounded-full bg-emerald-500/[0.07] blur-[140px]" />

      {/* 5. Low-opacity premium grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.07]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
};
