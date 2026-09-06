import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

export interface AlertProps {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({ variant = "info", title, message, onClose, className }: AlertProps) {
  const variantStyles = {
    info: "bg-sky-50 dark:bg-cyan-950/40 border-sky-200 dark:border-cyan-800/60 text-sky-950 dark:text-cyan-200",
    success: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200",
    warning: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200",
    danger: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-200"
  };

  const icons = {
    info: <Info className="h-4 w-4 text-sky-600 dark:text-cyan-400 shrink-0 mt-0.5" />,
    success: <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    danger: <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3.5 text-xs transition-all font-medium",
        variantStyles[variant],
        className
      )}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-bold mb-0.5 text-sm">{title}</h5>}
        <p className="leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss alert"
          className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
