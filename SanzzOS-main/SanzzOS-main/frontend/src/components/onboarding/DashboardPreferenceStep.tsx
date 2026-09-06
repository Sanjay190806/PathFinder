import React from 'react';

export const DashboardPreferenceStep: React.FC<{ focus: string; onChange: (focus: string) => void }> = ({ focus, onChange }) => (
  <div className="grid gap-3 md:grid-cols-3">
    {['Placement', 'Learning', 'Projects'].map((item) => (
      <button key={item} type="button" onClick={() => onChange(item)} className={`rounded-xl border p-4 text-left ${focus === item ? 'border-accentEmerald bg-accentEmerald/10' : 'border-border-subtle bg-white/[0.04]'}`}>
        <p className="font-semibold text-textPrimary">{item}</p>
      </button>
    ))}
  </div>
);
