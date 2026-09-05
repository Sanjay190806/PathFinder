'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Info, RefreshCw, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface IntegrityWarningBannerProps {
  sessionId: string;
  integrityState: string; // NORMAL, WARNING, REPEATED_WARNING, ESCALATED, REVIEW_REQUIRED, INVALIDATED
  actionInstruction: string; // CONTINUE, SHOW_WARNING, PAUSE_REQUIRED, REQUEST_INTERVENTION, MARK_REVIEW_REQUIRED, INVALIDATE
  warningCount: number;
  allowedWarningCount: number;
  activeWarning?: {
    warning_id?: string;
    event_type?: string;
    message?: string;
    severity?: string;
    is_technical_interruption?: boolean;
  } | null;
  onAcknowledged?: () => void;
}

export const IntegrityWarningBanner: React.FC<IntegrityWarningBannerProps> = ({
  sessionId,
  integrityState,
  actionInstruction,
  warningCount,
  allowedWarningCount,
  activeWarning,
  onAcknowledged
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If normal and no active warning, render nothing
  if ((integrityState === 'NORMAL' && !activeWarning) || actionInstruction === 'CONTINUE') {
    return null;
  }

  const isTechnical = activeWarning?.is_technical_interruption || actionInstruction === 'PAUSE_REQUIRED';
  const isInvalidated = integrityState === 'INVALIDATED' || actionInstruction === 'INVALIDATE';
  const isReviewRequired = integrityState === 'REVIEW_REQUIRED' || actionInstruction === 'MARK_REVIEW_REQUIRED';
  const isEscalated = integrityState === 'ESCALATED' || integrityState === 'REPEATED_WARNING';

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      await api.acknowledgeIntegrityWarning(sessionId, activeWarning?.warning_id);
      if (onAcknowledged) {
        onAcknowledged();
      }
    } catch (err) {
      console.error('Failed to acknowledge integrity warning:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Color schemes based on severity and state
  let bannerBg = 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200';
  let badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200';
  let IconComponent = AlertTriangle;

  if (isInvalidated) {
    bannerBg = 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60 text-rose-900 dark:text-rose-200';
    badgeBg = 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200';
    IconComponent = XCircle;
  } else if (isReviewRequired) {
    bannerBg = 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-700/60 text-orange-900 dark:text-orange-200';
    badgeBg = 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200';
    IconComponent = ShieldAlert;
  } else if (isTechnical) {
    bannerBg = 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/60 text-blue-900 dark:text-blue-200';
    badgeBg = 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200';
    IconComponent = Info;
  }

  return (
    <aside aria-label="Assessment Integrity Notice" className={`w-full mb-4 border rounded-xl p-4 shadow-sm transition-all duration-300 ${bannerBg}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 rounded-lg bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm shrink-0">
            <IconComponent className="w-5 h-5 text-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                {isTechnical
                  ? 'Technical Notice'
                  : isInvalidated
                  ? 'Assessment Invalidated'
                  : isReviewRequired
                  ? 'Integrity Review Required'
                  : isEscalated
                  ? `Escalated Warning (${warningCount}/${allowedWarningCount})`
                  : `Integrity Warning (${warningCount}/${allowedWarningCount})`}
              </span>
              <span className="text-xs opacity-75 font-medium">
                {activeWarning?.event_type ? activeWarning.event_type.replace(/_/g, ' ') : 'Integrity Supervision'}
              </span>
            </div>
            <p className="text-sm font-medium leading-snug">
              {activeWarning?.message ||
                (isReviewRequired
                  ? 'Multiple integrity events detected. Your assessment will be reviewed by an administrator.'
                  : 'Please maintain authorized testing posture and ensure only you are visible.')}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {!isInvalidated && (
          <div className="sm:self-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <button
              onClick={handleAcknowledge}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Acknowledging...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>I Understand / Resume</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
