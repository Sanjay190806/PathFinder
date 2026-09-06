import React, { useState } from 'react';
import { IntegrationCard } from './IntegrationCard';
import { useIntegrationStore } from '../../app/store/useIntegrationStore';

export const YouTubeIntegrationCard: React.FC = () => {
  const { integrations, updateYouTubeLinks, removeIntegration, markSynced } = useIntegrationStore();
  const [draft, setDraft] = useState(integrations.youtube);
  const progress = draft.totalVideos ? Math.round((draft.watchedVideos / draft.totalVideos) * 100) : 0;
  return (
    <IntegrationCard serviceName="YouTube Learning" status={integrations.youtube.status} profileUrl={draft.profileUrl || draft.playlistLinks.split('\n')[0]} lastSync={integrations.youtube.lastSync} dataImported={integrations.youtube.dataImported} setupSteps={['Add playlist, course, or channel links.', 'Track watched videos manually.', 'Use notes for Shayla summaries later.']} onSave={() => updateYouTubeLinks(draft)} onSync={() => markSynced('youtube')} onRemove={() => removeIntegration('youtube')}>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="input-field" placeholder="Topic" value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} />
        <select className="input-field" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as any })}><option>low</option><option>medium</option><option>high</option></select>
        <input className="input-field" type="number" min={0} placeholder="Watched videos" value={draft.watchedVideos} onChange={(e) => setDraft({ ...draft, watchedVideos: Number(e.target.value) })} />
        <input className="input-field" type="number" min={0} placeholder="Total videos" value={draft.totalVideos} onChange={(e) => setDraft({ ...draft, totalVideos: Number(e.target.value) })} />
        <textarea className="input-field min-h-[80px] md:col-span-2" placeholder="Playlist links" value={draft.playlistLinks} onChange={(e) => setDraft({ ...draft, playlistLinks: e.target.value })} />
        <textarea className="input-field min-h-[80px] md:col-span-2" placeholder="Course/channel links and notes" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bgBase"><div className="h-full bg-accentGreen" style={{ width: `${Math.min(100, progress)}%` }} /></div>
    </IntegrationCard>
  );
};
