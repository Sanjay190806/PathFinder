import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { Card } from '../ui/Card';

const labels: Record<string, string> = {
  atsFormat: 'ATS-safe formatting',
  quantifiedBullets: 'Quantified project bullets',
  projectLinks: 'Project links added',
  skillsTailored: 'Skills tailored to roles',
  onePage: 'One-page resume',
  proofread: 'Proofread final version'
};

export const ResumeChecklist: React.FC<{ checklist: Record<string, boolean>; onToggle: (key: string) => void }> = ({ checklist, onToggle }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Resume checklist</h3>
    <div className="space-y-2">
      {Object.entries(labels).map(([key, label]) => (
        <button key={key} type="button" onClick={() => onToggle(key)} className="flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-white/[0.03] p-3 text-left text-sm text-textSecondary transition hover:text-textPrimary">
          {checklist[key] ? <CheckSquare className="h-4 w-4 text-accentEmerald" /> : <Square className="h-4 w-4" />}
          {label}
        </button>
      ))}
    </div>
  </Card>
);
