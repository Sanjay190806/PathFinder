import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  progress: number;
  label?: string;
  valueLabel?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "info" | "destructive" | "emerald" | "amber" | "cyan" | "rose";
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
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    info: "bg-info",
    destructive: "bg-destructive",
    emerald: "bg-success",
    amber: "bg-warning",
    cyan: "bg-info",
    rose: "bg-destructive"
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {valueLabel && <span className="text-muted-foreground font-mono">{valueLabel}</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-surface-muted overflow-hidden", sizeStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorStyles[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
