export const youTubeIntegrationService = {
  status() {
    return { service: 'youtube', mode: 'manual-learning-tracker', apiReady: true, notes: ['Playlist and course links are supported.', 'Watched progress is manual in v1.'] };
  },
  manualSync(payload: Record<string, unknown>) {
    return { ok: true, service: 'youtube', syncedAt: new Date().toISOString(), imported: ['learning links', 'progress notes'], payload };
  },
};
