import { sanitizeResumeText, validateResumeUpload } from './resumeFileSecurity.service.js';

export function parseResumeUpload(input: { fileName: string; fileSize: number; mimeType: string; textContent?: string }) {
  const validation = validateResumeUpload(input);
  if (!validation.ok) return validation;
  const extractedText = sanitizeResumeText(input.textContent || '');
  const warnings = [...(validation.warnings || [])];
  if (!extractedText) warnings.push('No text was extracted automatically. Paste resume text in the preview box and analyze again.');
  return {
    ok: true,
    fileType: validation.extension,
    extractedText,
    warnings,
    metadata: {
      fileName: input.fileName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      parser: extractedText ? 'browser-text-or-manual' : 'manual-text-required',
    },
  };
}
