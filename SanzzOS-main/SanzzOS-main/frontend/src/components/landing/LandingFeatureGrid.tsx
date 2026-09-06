import React from 'react';
import { Card } from '../ui/Card';

export const LandingFeatureGrid: React.FC = () => {
  const items = [
    ['Problem', 'Students prepare across disconnected tools and lose momentum.'],
    ['Solution', 'One system for preparation, progress, projects, and AI mentoring.'],
    ['Result', 'A cleaner recruiter story and a calmer daily workflow.'],
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {items.map(([title, body]) => (
        <Card key={title} className="bg-white/[0.04]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">{title}</p>
          <p className="mt-3 text-sm leading-6 text-textSecondary">{body}</p>
        </Card>
      ))}
    </section>
  );
};
