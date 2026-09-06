import React, { useState } from 'react';
import { IntegrationCard } from './IntegrationCard';
import { useIntegrationStore } from '../../app/store/useIntegrationStore';

export const PortfolioLinksCard: React.FC = () => {
  const { integrations, updatePortfolioLinks, removeIntegration, markSynced } = useIntegrationStore();
  const [draft, setDraft] = useState(integrations.portfolio);
  return (
    <IntegrationCard serviceName="Portfolio Links" status={integrations.portfolio.status} profileUrl={draft.portfolioUrl} lastSync={integrations.portfolio.lastSync} dataImported={integrations.portfolio.dataImported} setupSteps={['Add public links only.', 'Keep resume URLs share-safe.', 'Use demo and LinkedIn post URLs to strengthen profile proof.']} onSave={() => updatePortfolioLinks(draft)} onSync={() => markSynced('portfolio')} onRemove={() => removeIntegration('portfolio')}>
      <div className="grid gap-3">
        <input className="input-field" placeholder="Portfolio URL" value={draft.portfolioUrl} onChange={(e) => setDraft({ ...draft, portfolioUrl: e.target.value, profileUrl: e.target.value })} />
        <input className="input-field" placeholder="Resume URL" value={draft.resumeUrl} onChange={(e) => setDraft({ ...draft, resumeUrl: e.target.value })} />
        <textarea className="input-field min-h-[80px]" placeholder="Project demo URLs" value={draft.projectDemoUrls} onChange={(e) => setDraft({ ...draft, projectDemoUrls: e.target.value })} />
        <textarea className="input-field min-h-[80px]" placeholder="LinkedIn post URLs" value={draft.linkedInPostUrls} onChange={(e) => setDraft({ ...draft, linkedInPostUrls: e.target.value })} />
      </div>
    </IntegrationCard>
  );
};
