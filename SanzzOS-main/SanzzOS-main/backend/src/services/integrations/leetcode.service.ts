export const leetCodeIntegrationService = {
  status() {
    return { service: 'leetcode', mode: 'manual-link', apiReady: true, notes: ['Public profile link and manual solved counts are supported.', 'No authenticated scraping is used.'] };
  },
  manualSync(payload: Record<string, unknown>) {
    return { ok: true, service: 'leetcode', syncedAt: new Date().toISOString(), imported: ['manual solved counts', 'profile URL'], payload };
  },
};
