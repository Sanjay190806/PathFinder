import { Request, Response } from 'express';
import { gitHubIntegrationService } from '../services/integrations/github.service.js';
import { leetCodeIntegrationService } from '../services/integrations/leetcode.service.js';
import { linkedInIntegrationService } from '../services/integrations/linkedin.service.js';
import { youTubeIntegrationService } from '../services/integrations/youtube.service.js';

const isSafeUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export function handleIntegrationStatus(_req: Request, res: Response) {
  res.json({ ok: true, integrations: [leetCodeIntegrationService.status(), linkedInIntegrationService.status(), gitHubIntegrationService.status(), youTubeIntegrationService.status()] });
}

export function handleValidateUrl(req: Request, res: Response) {
  const url = String(req.body?.url || '');
  res.json({ ok: true, valid: isSafeUrl(url), reason: isSafeUrl(url) ? 'safe_http_url' : 'Only http and https URLs are allowed.' });
}

export function handleLeetCodeManualSync(req: Request, res: Response) {
  res.json(leetCodeIntegrationService.manualSync(req.body || {}));
}

export function handleLinkedInManualSync(req: Request, res: Response) {
  res.json(linkedInIntegrationService.manualSync(req.body || {}));
}

export function handleGitHubManualSync(req: Request, res: Response) {
  res.json(gitHubIntegrationService.manualSync(req.body || {}));
}

export function handleYouTubeManualSync(req: Request, res: Response) {
  res.json(youTubeIntegrationService.manualSync(req.body || {}));
}
