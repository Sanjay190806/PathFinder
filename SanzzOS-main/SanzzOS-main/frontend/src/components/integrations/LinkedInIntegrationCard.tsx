import React, { useState } from 'react';
import { IntegrationCard } from './IntegrationCard';
import { useIntegrationStore } from '../../app/store/useIntegrationStore';

export const LinkedInIntegrationCard: React.FC = () => {
  const { integrations, updateLinkedInProfile, removeIntegration, markSynced } = useIntegrationStore();
  const [draft, setDraft] = useState(integrations.linkedin);
  return (
    <IntegrationCard serviceName="LinkedIn" status={integrations.linkedin.status} profileUrl={draft.profileUrl} lastSync={integrations.linkedin.lastSync} dataImported={integrations.linkedin.dataImported} setupSteps={['Paste public profile text manually.', 'No LinkedIn scraping or private API access.', 'Use the analyzer for headline/about improvements.']} onSave={() => updateLinkedInProfile(draft)} onSync={() => markSynced('linkedin')} onRemove={() => removeIntegration('linkedin')}>
      <div className="grid gap-3">
        <input className="input-field" placeholder="Profile URL" value={draft.profileUrl} onChange={(e) => setDraft({ ...draft, profileUrl: e.target.value })} />
        <input className="input-field" placeholder="Headline" value={draft.headline} onChange={(e) => setDraft({ ...draft, headline: e.target.value })} />
        <textarea className="input-field min-h-[96px]" placeholder="About section paste" value={draft.about} onChange={(e) => setDraft({ ...draft, about: e.target.value })} />
        <input className="input-field" placeholder="Skills" value={draft.skills} onChange={(e) => setDraft({ ...draft, skills: e.target.value })} />
        <input className="input-field" placeholder="Target role" value={draft.targetRole} onChange={(e) => setDraft({ ...draft, targetRole: e.target.value })} />
      </div>
    </IntegrationCard>
  );
};
