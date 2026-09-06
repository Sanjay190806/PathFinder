import React from 'react';

export interface OnboardingProfileDraft {
  name: string;
  degreeYear: string;
  targetRole: string;
  focusSkills: string;
}

export const CareerProfileStep: React.FC<{ profile: OnboardingProfileDraft; onChange: (profile: OnboardingProfileDraft) => void }> = ({ profile, onChange }) => {
  const update = (key: keyof OnboardingProfileDraft, value: string) => onChange({ ...profile, [key]: value });
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="text-xs font-semibold text-textSecondary">Name<input value={profile.name} onChange={(e) => update('name', e.target.value)} className="mt-2 w-full rounded-xl border border-border-subtle bg-black/35 px-3 py-2 text-textPrimary outline-none" /></label>
      <label className="text-xs font-semibold text-textSecondary">Degree/year<input value={profile.degreeYear} onChange={(e) => update('degreeYear', e.target.value)} className="mt-2 w-full rounded-xl border border-border-subtle bg-black/35 px-3 py-2 text-textPrimary outline-none" /></label>
      <label className="text-xs font-semibold text-textSecondary">Target role<input value={profile.targetRole} onChange={(e) => update('targetRole', e.target.value)} className="mt-2 w-full rounded-xl border border-border-subtle bg-black/35 px-3 py-2 text-textPrimary outline-none" /></label>
      <label className="text-xs font-semibold text-textSecondary">Focus skills<input value={profile.focusSkills} onChange={(e) => update('focusSkills', e.target.value)} className="mt-2 w-full rounded-xl border border-border-subtle bg-black/35 px-3 py-2 text-textPrimary outline-none" /></label>
    </div>
  );
};
