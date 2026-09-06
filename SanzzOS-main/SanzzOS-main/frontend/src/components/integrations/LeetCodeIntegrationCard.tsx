import React, { useState } from 'react';
import { IntegrationCard } from './IntegrationCard';
import { useIntegrationStore } from '../../app/store/useIntegrationStore';

export const LeetCodeIntegrationCard: React.FC = () => {
  const { integrations, updateLeetCodeProfile, removeIntegration, markSynced } = useIntegrationStore();
  const [draft, setDraft] = useState(integrations.leetcode);
  const progress = Math.min(100, Math.round((Number(draft.totalSolved || 0) / Number(draft.targetSolvedCount || 150)) * 100));

  return (
    <IntegrationCard serviceName="LeetCode" status={integrations.leetcode.status} profileUrl={draft.profileUrl} lastSync={integrations.leetcode.lastSync} dataImported={integrations.leetcode.dataImported} setupSteps={['Use your public profile URL only.', 'Update solved counts manually.', 'No scraping or password collection is used.']} onSave={() => updateLeetCodeProfile(draft)} onSync={() => markSynced('leetcode')} onRemove={() => removeIntegration('leetcode')}>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="input-field" placeholder="Username" value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} />
        <input className="input-field" placeholder="Profile URL" value={draft.profileUrl} onChange={(e) => setDraft({ ...draft, profileUrl: e.target.value })} />
        {(['totalSolved', 'easySolved', 'mediumSolved', 'hardSolved', 'targetSolvedCount'] as const).map((key) => (
          <input key={key} className="input-field" type="number" min={0} placeholder={key} value={draft[key] || 0} onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })} />
        ))}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bgBase"><div className="h-full bg-accentBlue" style={{ width: `${progress}%` }} /></div>
      <p className="text-xs text-textMuted">{draft.totalSolved || 0} solved toward {draft.targetSolvedCount || 150}. Compare this manually with the DSA tracker if counts drift.</p>
    </IntegrationCard>
  );
};
