'use client';

import React from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface AdaptiveAlertProps {
  trigger: string;
  changeSummary: string;
  versionNumber: number;
  onDismiss?: () => void;
}

export function AdaptiveAlert({ trigger, changeSummary, versionNumber, onDismiss }: AdaptiveAlertProps) {
  if (!changeSummary) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-accent-cyan/40 bg-gradient-to-r from-accent-cyan/15 via-primary-900/30 to-surface-raised p-4 shadow-lg shadow-accent-cyan/5 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan">
                Roadmap Adapted (Version {versionNumber})
              </span>
              <span className="rounded-full bg-accent-cyan/20 px-2 py-0.5 text-[10px] font-semibold text-accent-cyan border border-accent-cyan/30">
                Trigger: {trigger.replace('_', ' ')}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-200 leading-relaxed font-medium">
              {changeSummary}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
