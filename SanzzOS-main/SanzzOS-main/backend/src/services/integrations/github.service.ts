export const gitHubIntegrationService = {
  status() {
    return { service: 'github', mode: 'manual-link', apiReady: true, notes: ['Public profile and repository links are supported.', 'OAuth can be added backend-side later.'] };
  },
  manualSync(payload: Record<string, unknown>) {
    return { ok: true, service: 'github', syncedAt: new Date().toISOString(), imported: ['profile URL', 'repository links'], payload };
  },
};
