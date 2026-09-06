import { Request, Response } from 'express';
import { providerRouter } from '../ai/router/providerRouter.js';
import { parseResumeUpload } from '../services/resume/resumeParser.service.js';
import { scoreResumeATS } from '../services/resume/atsScoring.service.js';

function extractJson<T>(text: string): T | null {
  const source = /```json\s*([\s\S]*?)```/i.exec(text)?.[1] || text;
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(source.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export function handleResumeUploadParse(req: Request, res: Response) {
  const { fileName, fileSize, mimeType, textContent } = req.body || {};
  if (!fileName || typeof fileSize !== 'number') {
    return res.status(400).json({ error: 'fileName and fileSize are required.' });
  }
  const parsed = parseResumeUpload({ fileName, fileSize, mimeType: String(mimeType || ''), textContent: String(textContent || '') });
  if (!parsed.ok) {
    return res.status((parsed as any).status || 400).json({ error: (parsed as any).error || 'Resume upload rejected.' });
  }
  return res.json(parsed);
}

export function handleResumeScore(req: Request, res: Response) {
  const { extractedText, targetRole, targetCompany } = req.body || {};
  if (!String(extractedText || '').trim()) {
    return res.status(400).json({ error: 'Extracted resume text is required.' });
  }
  return res.json(scoreResumeATS(String(extractedText), String(targetRole || 'Software Engineer'), String(targetCompany || 'Zoho')));
}

export async function handleResumeAIReview(req: Request, res: Response) {
  const { extractedText, targetRole, targetCompany, atsScore, keywordGaps, aiSettings } = req.body || {};
  if (!String(extractedText || '').trim()) {
    return res.status(400).json({ error: 'extractedText is required and must be confirmed by the user before calling this endpoint.' });
  }

  const fallback = [
    `Recruiter-style review for ${targetRole || 'Software Engineer'} at ${targetCompany || 'target company'}: ATS score is ${atsScore ?? 'unknown'}, so fix role alignment first.`,
    `Top improvements: add missing keywords (${(keywordGaps || []).slice(0, 6).join(', ') || 'none detected'}), strengthen project impact, keep bullets concise, and add verified links.`,
    'Do not invent fake experience or fake metrics. Use placeholders like [measured result] until you can verify numbers.',
  ].join('\n\n');

  try {
    const result = await providerRouter.chat({
      messages: [
        { role: 'system', content: 'You are Shayla, a placement-focused resume reviewer. Be honest. Do not invent fake experience or metrics. Return concise markdown with recruiter review, top 10 improvements, weak bullets, rewrite suggestions, interview risk questions, missing skills, and action plan.' },
        { role: 'user', content: `Target role: ${targetRole}\nTarget company: ${targetCompany}\nATS score: ${atsScore}\nKeyword gaps: ${(keywordGaps || []).join(', ')}\n\nResume text:\n${String(extractedText).slice(0, 18000)}` },
      ],
      preferredProvider: aiSettings?.provider,
      model: aiSettings?.model,
      temperature: 0.4,
      maxTokens: 1200,
    } as any);
    return res.json({ ok: true, review: result.reply, providerUsed: result.provider, modelUsed: result.model });
  } catch {
    return res.json({ ok: true, review: fallback, providerUsed: 'local', modelUsed: 'rule-based' });
  }
}

export async function handleLinkedInAnalyzeProfileText(req: Request, res: Response) {
  const { headline = '', about = '', experience = '', skills = '', featuredLinks = '', targetRole = 'Software Engineer', aiSettings } = req.body || {};
  const source = `${headline}\n${about}\n${experience}\n${skills}\n${featuredLinks}`;
  const lower = source.toLowerCase();
  const hasProof = lower.includes('github') || lower.includes('portfolio') || lower.includes('project');
  const score = Math.min(100, 35 + (headline ? 15 : 0) + (about.length > 120 ? 20 : 5) + (skills ? 15 : 0) + (hasProof ? 15 : 0));
  const fallback = {
    score,
    suggestions: [
      headline ? 'Make the headline role-specific and proof-backed.' : 'Add a clear role-focused headline.',
      about.length > 120 ? 'Trim the About section into sharper proof points.' : 'Expand About with projects, skills, and placement goal.',
      hasProof ? 'Keep GitHub/portfolio links visible.' : 'Add GitHub, portfolio, or featured project links.',
    ],
    headlineVersions: [
      `${targetRole} | Java DSA | React Projects | Placement-ready Builder`,
      `${targetRole} Candidate building practical projects with Java, SQL, and GitHub proof`,
    ],
    improvedAbout: `I am targeting ${targetRole} roles with a focus on practical projects, clear technical fundamentals, and honest measurable progress. Add 2-3 strongest projects, verified skills, and links here.`,
  };

  try {
    const result = await providerRouter.chat({
      messages: [
        { role: 'system', content: 'Analyze pasted LinkedIn profile text. Return only JSON with keys: score, suggestions, headlineVersions, improvedAbout. Do not invent experience.' },
        { role: 'user', content: `Target role: ${targetRole}\nProfile text:\n${source.slice(0, 12000)}` },
      ],
      preferredProvider: aiSettings?.provider,
      model: aiSettings?.model,
      temperature: 0.4,
      maxTokens: 800,
    } as any);
    const parsed = extractJson<typeof fallback>(result.reply);
    return res.json(parsed || fallback);
  } catch {
    return res.json(fallback);
  }
}
