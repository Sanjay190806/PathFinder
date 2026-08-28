import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function AssessmentTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-raised px-2.5 py-1 text-xs font-mono text-slate-400"
      title="Elapsed pacing time (does not affect scoring)"
    >
      <Clock className="h-3.5 w-3.5 text-primary-400 shrink-0" />
      <span>Elapsed: {formatTime(seconds)}</span>
    </div>
  );
}
