import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  valueLabel?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "emerald" | "amber" | "cyan" | "rose";
  className?: string;
}

export function ProgressBar({
  progress,
  label,
  valueLabel,
  size = "md",
  color = "primary",
  className
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4"
  };

  const colorStyles = {
    primary: "bg-primary-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    cyan: "bg-cyan-500",
    rose: "bg-rose-500"
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-semibold text-slate-300">{label}</span>}
          {valueLabel && <span className="text-slate-400 font-mono">{valueLabel}</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-surface-raised overflow-hidden", sizeStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorStyles[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
