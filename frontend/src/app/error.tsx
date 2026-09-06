'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const isProd = process.env.NODE_ENV === 'production';
  const [errorRef, setErrorRef] = useState<string>('');

  useEffect(() => {
    // Generate or use Next.js error digest for correlation
    const refId = error.digest || Math.random().toString(36).substring(2, 8).toUpperCase();
    setErrorRef('PF-ERR-' + refId);
    
    // Log sanitized error telemetry to console or APM
    if (isProd) {
      console.error('[Error Ref: PF-ERR-' + refId + '] Client runtime error occurred');
    } else {
      console.error('Unhandled Client Error:', error);
    }
  }, [error, isProd]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-surface-border bg-surface p-8 shadow-2xl text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-400">
            {isProd
              ? 'We encountered an unexpected issue while loading this view. Your session and data remain secure.'
              : error.message || 'An unexpected runtime error occurred in development mode.'}
          </p>
        </div>

        {/* In production: safe error tracking code without internal details */}
        {errorRef && (
          <div className="py-2 px-3 rounded-xl bg-surface-raised border border-surface-border text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
            <span>Incident Ref: <strong className="text-slate-300">{errorRef}</strong></span>
          </div>
        )}

        {/* In development: display stack trace for local debugging */}
        {!isProd && error.stack && (
          <details className="text-left mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-rose-300 overflow-x-auto max-h-48">
            <summary className="cursor-pointer font-semibold text-slate-400 mb-1">
              Developer Stack Trace
            </summary>
            <pre className="whitespace-pre-wrap font-mono">{error.stack}</pre>
          </details>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            variant="primary"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Try again
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              leftIcon={<Home className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
