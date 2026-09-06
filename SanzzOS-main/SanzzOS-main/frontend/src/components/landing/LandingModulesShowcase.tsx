import React from 'react';
import { Card } from '../ui/Card';

export const LandingModulesShowcase: React.FC = () => {
  const modules = [
    '180-Day DSA Roadmap',
    'Today Mission',
    'Analytics',
    'Resume Studio',
    'Projects Workspace',
    'Applications CRM',
    'Shayla AI Mentor',
    'SQL / Aptitude / CS Core',
    'Reports',
  ];

  return (
    <section id="modules" className="grid gap-4">
      <Card className="bg-white/[0.04]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Modules</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <div key={module} className="rounded-2xl border border-border-subtle bg-bgBase/40 px-4 py-3 text-sm text-textPrimary">
              {module}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};
