import React from 'react';
export const ResumeParsedTextPreview: React.FC<{ text: string; onChange: (text: string) => void; warnings: string[] }> = ({ text, onChange, warnings }) => (
  <div className="grid gap-3">
    <textarea className="input-field min-h-[260px] font-mono text-xs" value={text} onChange={(e) => onChange(e.target.value)} placeholder="Parsed resume text appears here. For image/PDF/DOCX fallback, paste extracted text manually." />
    {warnings.map((warning) => <p key={warning} className="text-xs text-accentYellow">{warning}</p>)}
  </div>
);
