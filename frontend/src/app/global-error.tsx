'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const isProd = process.env.NODE_ENV === 'production';
  const [errorRef, setErrorRef] = useState<string>('');

  useEffect(() => {
    const refId = error.digest || Math.random().toString(36).substring(2, 8).toUpperCase();
    setErrorRef('PF-ROOT-' + refId);
    if (isProd) {
      console.error('[Root Error: PF-ROOT-' + refId + '] Fatal application error caught');
    } else {
      console.error('Unhandled Global Fatal Error:', error);
    }
  }, [error, isProd]);

  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Application Exception
            </h1>
            <p className="text-sm text-slate-400">
              {isProd
                ? 'A critical system error occurred. We have isolated the fault to preserve security and state.'
                : error.message || 'Fatal error occurred in root application layout.'}
            </p>
          </div>

          {errorRef && (
            <div className="py-2 px-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
              <span>Reference ID: <strong className="text-slate-200">{errorRef}</strong></span>
            </div>
          )}

          {!isProd && error.stack && (
            <details className="text-left mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-rose-300 overflow-x-auto max-h-48">
              <summary className="cursor-pointer font-semibold text-slate-400 mb-1">
                Debug Stack Trace
              </summary>
              <pre className="whitespace-pre-wrap font-mono">{error.stack}</pre>
            </details>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors shadow-md"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
