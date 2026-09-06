import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '../ui/Button';

const allowed = ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'webp'];

export const ResumeUploadZone: React.FC<{ file: File | null; onFile: (file: File | null) => void; error?: string }> = ({ file, onFile, error }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const pick = (next: File | null) => {
    if (!next) return onFile(null);
    const ext = next.name.split('.').pop()?.toLowerCase() || '';
    onFile(allowed.includes(ext) && next.size <= 5 * 1024 * 1024 ? next : null);
  };
  return (
    <div className={`rounded-lg border border-dashed p-5 ${dragging ? 'border-accentBlue bg-accentBlue/10' : 'border-border-subtle bg-bgSurface/40'}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}>
      <input ref={inputRef} type="file" className="hidden" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp" onChange={(e) => pick(e.target.files?.[0] || null)} />
      <div className="flex flex-col items-center gap-3 text-center">
        <Upload className="h-8 w-8 text-accentBlue" />
        <div>
          <h3 className="font-semibold text-textPrimary">{file ? file.name : 'Upload resume'}</h3>
          <p className="text-xs text-textMuted">{file ? `${(file.size / 1024).toFixed(1)} KB · ${file.type || 'unknown type'}` : 'PDF, DOCX, TXT, PNG, JPG, JPEG, or WEBP. Max 5MB.'}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => inputRef.current?.click()}>Choose file</Button>
          {file && <Button size="sm" variant="outline" onClick={() => onFile(null)}><X className="mr-2 h-4 w-4" />Clear File</Button>}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
};
