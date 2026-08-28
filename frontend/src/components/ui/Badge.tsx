import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "primary" | "success" | "warning" | "danger" | "cyan" | "purple";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    neutral: "bg-slate-800 text-slate-300 border-slate-700",
    primary: "bg-primary-950/80 text-primary-300 border-primary-800/60",
    success: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
    warning: "bg-amber-950/80 text-amber-300 border-amber-800/60",
    danger: "bg-rose-950/80 text-rose-300 border-rose-800/60",
    cyan: "bg-cyan-950/80 text-cyan-300 border-cyan-800/60",
    purple: "bg-purple-950/80 text-purple-300 border-purple-800/60"
  };

  const dotColorStyles = {
    neutral: "bg-slate-400",
    primary: "bg-primary-400",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-rose-400",
    cyan: "bg-cyan-400",
    purple: "bg-purple-400"
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-1 font-semibold"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border tracking-tight shrink-0",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColorStyles[variant])} />}
      {children}
    </span>
  );
}
