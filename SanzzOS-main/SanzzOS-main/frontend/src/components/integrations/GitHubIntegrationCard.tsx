import React, { useState } from 'react';
import { IntegrationCard } from './IntegrationCard';
import { useIntegrationStore } from '../../app/store/useIntegrationStore';

export const GitHubIntegrationCard: React.FC = () => {
  const { integrations, updateGitHubProfile, removeIntegration, markSynced } = useIntegrationStore();
  const [draft, setDraft] = useState(integrations.github);
  return (
    <IntegrationCard serviceName="GitHub" status={integrations.github.status} profileUrl={draft.profileUrl} lastSync={integrations.github.lastSync} dataImported={integrations.github.dataImported} setupSteps={['Add your public GitHub profile.', 'Paste pinned projects and repo links.', 'OAuth can be added later from the backend only.']} onSave={() => updateGitHubProfile(draft)} onSync={() => markSynced('github')} onRemove={() => removeIntegration('github')}>
      <div className="grid gap-3">
        <input className="input-field" placeholder="Username" value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} />
        <input className="input-field" placeholder="Profile URL" value={draft.profileUrl} onChange={(e) => setDraft({ ...draft, profileUrl: e.target.value })} />
        <textarea className="input-field min-h-[80px]" placeholder="Pinned projects" value={draft.pinnedProjects} onChange={(e) => setDraft({ ...draft, pinnedProjects: e.target.value })} />
        <textarea className="input-field min-h-[80px]" placeholder="Repository links" value={draft.repositoryLinks} onChange={(e) => setDraft({ ...draft, repositoryLinks: e.target.value })} />
      </div>
    </IntegrationCard>
  );
};
