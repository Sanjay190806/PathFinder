const allowedExtensions = new Set(['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'webp']);
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
  '',
]);

export function validateResumeUpload(input: { fileName: string; fileSize: number; mimeType: string }) {
  const extension = input.fileName.split('.').pop()?.toLowerCase() || '';
  const warnings: string[] = [];
  if (!allowedExtensions.has(extension)) {
    return { ok: false, status: 400, error: 'Unsupported resume file type.' };
  }
  if (!allowedMimeTypes.has(input.mimeType || '')) {
    return { ok: false, status: 400, error: 'Unsupported resume MIME type.' };
  }
  if (input.fileSize > 5 * 1024 * 1024) {
    return { ok: false, status: 413, error: 'Resume file is larger than 5MB.' };
  }
  if (/\.(exe|bat|cmd|js|vbs|ps1|sh|html?)$/i.test(input.fileName)) {
    return { ok: false, status: 400, error: 'Executable or script files are not allowed.' };
  }
  if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) warnings.push('Image resume OCR support is experimental. Paste extracted text manually if OCR is unavailable.');
  if (['pdf', 'docx'].includes(extension)) warnings.push(`${extension.toUpperCase()} parsing requires a text extraction library. Paste text manually if no text was extracted.`);
  return { ok: true, extension, warnings };
}

export function sanitizeResumeText(text: string) {
  return String(text || '')
    .replace(/\0/g, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .slice(0, 120000)
    .trim();
}
