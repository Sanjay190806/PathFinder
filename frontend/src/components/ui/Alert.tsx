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
    info: "bg-cyan-950/40 border-cyan-800/60 text-cyan-200",
    success: "bg-emerald-950/40 border-emerald-800/60 text-emerald-200",
    warning: "bg-amber-950/40 border-amber-800/60 text-amber-200",
    danger: "bg-rose-950/40 border-rose-800/60 text-rose-200"
  };

  const icons = {
    info: <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />,
    success: <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />,
    danger: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3.5 text-xs transition-all",
        variantStyles[variant],
        className
      )}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-bold mb-0.5">{title}</h5>}
        <p className="leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss alert"
          className="rounded p-1 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
