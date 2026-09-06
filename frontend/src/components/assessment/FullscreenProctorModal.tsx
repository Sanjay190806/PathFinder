"use client";

import React, { useEffect, useState } from "react";
import { 
  Maximize, AlertTriangle, ShieldAlert, MonitorCheck,
  AlertOctagon, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui";

interface FullscreenProctorModalProps {
  // Gate before exam begins
  showFullscreenGate: boolean;
  onEnterFullscreen: () => void;
  // Warning when user exits fullscreen during exam
  showFullscreenExitWarning: boolean;
  onResumeFullscreen: () => void;
  onFullscreenExitExpired?: () => void;
  // Warning when user switches tabs
  showTabSwitchWarning: boolean;
  tabStrikesCount: number;
  maxStrikes: number;
  onDismissTabWarning: () => void;
  // Warning when auto-submitting
  isAutoSubmitting: boolean;
  autoSubmitReason?: string;
}

export function FullscreenProctorModal({
  showFullscreenGate,
  onEnterFullscreen,
  showFullscreenExitWarning,
  onResumeFullscreen,
  onFullscreenExitExpired,
  showTabSwitchWarning,
  tabStrikesCount,
  maxStrikes = 3,
  onDismissTabWarning,
  isAutoSubmitting,
  autoSubmitReason,
}: FullscreenProctorModalProps) {
  // Countdown for fullscreen exit
  const [exitCountdown, setExitCountdown] = useState(10);

  useEffect(() => {
    if (!showFullscreenExitWarning) {
      setExitCountdown(10);
      return;
    }

    const timer = setInterval(() => {
      setExitCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFullscreenExitExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showFullscreenExitWarning, onFullscreenExitExpired]);

  // 1. Auto-submitting due to violations
  if (isAutoSubmitting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="bg-surface border-2 border-red-500/60 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-5">
          <div className="h-16 w-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto animate-pulse">
            <AlertOctagon className="h-8 w-8 text-red-500" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-red-500 tracking-tight">Exam Auto-Submitted</h2>
            <p className="text-xs uppercase tracking-widest font-bold text-red-400">Malpractice Limit Exceeded</p>
          </div>

          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-900 dark:text-red-200 leading-relaxed text-left space-y-2">
            <p className="font-semibold text-red-800 dark:text-red-300">
              Reason: {autoSubmitReason || "Reached maximum allowed tab-switching strikes."}
            </p>
            <p className="text-muted-foreground">
              All answers marked prior to violation have been saved and compiled into your final assessment calibration.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Tab Switch Malpractice Warning Modal
  if (showTabSwitchWarning) {
    const remainingStrikes = Math.max(0, maxStrikes - tabStrikesCount);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
        <div className="bg-surface border-2 border-red-500/50 rounded-2xl shadow-2xl max-w-md w-full p-7 space-y-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="h-8 w-8 text-red-500 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider border border-red-500/30">
              ⚠️ Strike {tabStrikesCount} of {maxStrikes}
            </div>
            <h2 className="text-xl font-extrabold text-foreground pt-1">Malpractice Warning: Tab Switch Detected</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Leaving the assessment window, switching browser tabs, or opening external applications is strictly prohibited.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-left text-xs text-amber-900 dark:text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Strict Proctoring Rules (Unstop / Smartica Standard)</span>
            </div>
            <p className="text-amber-800/95 dark:text-amber-200/90 leading-normal">
              You have <strong className="text-amber-950 dark:text-amber-100 font-bold">{remainingStrikes} strike{remainingStrikes === 1 ? "" : "s"}</strong> remaining. If you switch tabs again, this exam will automatically submit immediately without further warning.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold"
            onClick={onDismissTabWarning}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            I Understand — Resume Assessment
          </Button>
        </div>
      </div>
    );
  }

  // 3. Fullscreen Exit Warning Modal
  if (showFullscreenExitWarning) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
        <div className="bg-surface border-2 border-amber-500/50 rounded-2xl shadow-2xl max-w-md w-full p-7 space-y-5 text-center">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Maximize className="h-7 w-7 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-foreground">Fullscreen Exited!</h2>
            <p className="text-xs text-muted-foreground">
              This exam must remain in fullscreen mode. Please return to fullscreen immediately.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 font-medium">
            Returning to fullscreen in <strong className="text-amber-950 dark:text-amber-100 font-bold text-sm">{exitCountdown}s</strong>, otherwise a violation strike will be logged.
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold"
            onClick={onResumeFullscreen}
            leftIcon={<Maximize className="h-4 w-4" />}
          >
            Return to Fullscreen Now
          </Button>
        </div>
      </div>
    );
  }

  // 4. Initial Fullscreen Gate Modal (Explicit user gesture required by browsers)
  if (showFullscreenGate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
        <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mx-auto">
            <MonitorCheck className="h-8 w-8 text-primary" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-extrabold text-foreground">Proctored Assessment Mode</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To guarantee fairness and integrity, this exam operates in a <strong>secure fullscreen environment</strong>.
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/80">
            <div className="flex items-start gap-2.5">
              <span className="text-primary font-bold">1.</span>
              <span><strong>Fullscreen Only:</strong> The exam opens in fullscreen. Exiting fullscreen logs a proctoring infraction.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-primary font-bold">2.</span>
              <span><strong>Tab-Switch Protection:</strong> Switching tabs, minimizing windows, or opening external apps gives a warning strike. Reaching 3 strikes will <strong>auto-submit</strong> your test.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-primary font-bold">3.</span>
              <span><strong>Draggable Camera:</strong> Your live face monitor appears in the top-right corner. You can drag it anywhere if it obscures your view.</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-lg shadow-primary/20"
            onClick={onEnterFullscreen}
            leftIcon={<Maximize className="h-4 w-4" />}
          >
            Start / Enter Fullscreen
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
