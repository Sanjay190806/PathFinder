export const linkedInIntegrationService = {
  status() {
    return { service: 'linkedin', mode: 'paste-based', apiReady: true, notes: ['Paste public profile text manually.', 'No LinkedIn scraping or passwords are supported.'] };
  },
  manualSync(payload: Record<string, unknown>) {
    return { ok: true, service: 'linkedin', syncedAt: new Date().toISOString(), imported: ['headline', 'about', 'skills'], payload };
  },
};
