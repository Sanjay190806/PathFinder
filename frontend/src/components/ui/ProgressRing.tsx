import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: "primary" | "success" | "warning" | "info" | "emerald" | "amber" | "cyan";
  className?: string;
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  label,
  color = "primary",
  className
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const offset = circumference - (clampedProgress / 100) * circumference;

  const colorStyles = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
    emerald: "text-success",
    amber: "text-warning",
    cyan: "text-info"
  };

  return (
    <div className={cn("inline-flex flex-col items-center justify-center relative", className)}>
      <svg width={size} height={size} className="transform -rotate-90" suppressHydrationWarning>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-muted"
          fill="transparent"
          suppressHydrationWarning
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={cn("transition-all duration-500 ease-out", colorStyles[color])}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          suppressHydrationWarning
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-bold text-foreground tracking-tight" suppressHydrationWarning>{Math.round(clampedProgress)}%</span>
      </div>
      {label && <span className="text-[10px] text-muted-foreground mt-1.5 font-medium">{label}</span>}
    </div>
  );
}
