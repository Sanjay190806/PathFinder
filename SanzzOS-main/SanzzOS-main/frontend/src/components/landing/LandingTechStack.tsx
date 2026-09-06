import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const LandingTechStack: React.FC = () => {
  const stack = ['React', 'TypeScript', 'Tailwind', 'Zustand', 'Express', 'Prisma', 'PostgreSQL', 'Groq', 'Docker'];
  return (
    <Card className="bg-white/[0.04]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Tech Stack</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {stack.map((item) => (
          <Badge key={item} variant="neutral">{item}</Badge>
        ))}
      </div>
    </Card>
  );
};
