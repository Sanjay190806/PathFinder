import React from 'react';
import { PlannerMode } from '../../types/smartPlanner';

const modes: Array<{ id: PlannerMode; label: string }> = [
  { id: 'normal', label: 'Normal Day' },
  { id: 'busy', label: 'Busy Day' },
  { id: 'low_energy', label: 'Low Energy' },
  { id: 'placement_sprint', label: 'Placement Sprint' },
  { id: 'project_build', label: 'Project Build' },
  { id: 'revision', label: 'Revision' }
];

export const PlannerModeSelector: React.FC<{ value: PlannerMode; onChange: (mode: PlannerMode) => void }> = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {modes.map((mode) => (
      <button
        key={mode.id}
        type="button"
        onClick={() => onChange(mode.id)}
        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
          value === mode.id ? 'border-border-accent bg-white/[0.1] text-textPrimary' : 'border-border-subtle bg-white/[0.03] text-textSecondary hover:text-textPrimary'
        }`}
      >
        {mode.label}
      </button>
    ))}
  </div>
);
