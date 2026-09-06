import React from 'react';
import { Card } from '../ui/Card';

export interface FirstPlanDraft {
  currentGoal: string;
  targetCompanies: string;
  dailyTime: string;
  dsaLevel: string;
  germanLevel: string;
  preferredRoutine: string;
}

export const FirstPlanStep: React.FC<{
  plan: FirstPlanDraft;
  onChange: (plan: FirstPlanDraft) => void;
}> = ({ plan, onChange }) => {
  const update = (key: keyof FirstPlanDraft, value: string) => onChange({ ...plan, [key]: value });

  return (
    <div>
      <h2 className="text-2xl font-semibold text-textPrimary">Generate your first plan</h2>
      <p className="mt-2 text-sm text-textSecondary">Tell the tracker your current reality. It will save this as onboarding context for Shayla and your dashboard.</p>
      <Card className="mt-5 grid gap-3 p-4 md:grid-cols-2">
        <Field label="Current goal" value={plan.currentGoal} onChange={(value) => update('currentGoal', value)} placeholder="Placement in service/product company" />
        <Field label="Target companies" value={plan.targetCompanies} onChange={(value) => update('targetCompanies', value)} placeholder="TCS, Zoho, Accenture..." />
        <Field label="Daily time available" value={plan.dailyTime} onChange={(value) => update('dailyTime', value)} placeholder="2 hours weekdays, 4 hours Sunday" />
        <Field label="DSA level" value={plan.dsaLevel} onChange={(value) => update('dsaLevel', value)} placeholder="Beginner / Arrays / Medium" />
        <Field label="German level" value={plan.germanLevel} onChange={(value) => update('germanLevel', value)} placeholder="A1 Beginner" />
        <Field label="Preferred routine" value={plan.preferredRoutine} onChange={(value) => update('preferredRoutine', value)} placeholder="Morning DSA, night German" />
      </Card>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; placeholder: string; onChange: (value: string) => void }> = ({ label, value, placeholder, onChange }) => (
  <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-widest text-textMuted">
    {label}
    <input
      className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm normal-case tracking-normal text-textPrimary outline-none"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);
