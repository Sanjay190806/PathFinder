import React from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { ToastItem, ToastType } from '../../app/store/useToastStore';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; icon: any; shadow: string }> = {
  success: {
    bg: 'bg-accentEmerald/10',
    border: 'border-accentEmerald/20',
    text: 'text-accentEmerald',
    icon: CheckCircle,
    shadow: 'shadow-glow-emerald/5',
  },
  info: {
    bg: 'bg-accentBlue/10',
    border: 'border-accentBlue/20',
    text: 'text-accentBlue',
    icon: Info,
    shadow: 'shadow-glow-blue/5',
  },
  warning: {
    bg: 'bg-accentOrange/10',
    border: 'border-accentOrange/20',
    text: 'text-accentOrange',
    icon: AlertTriangle,
    shadow: 'shadow-glow-orange/5',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    icon: XCircle,
    shadow: 'shadow-glow-red/5',
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const styles = toastStyles[toast.type] || toastStyles.info;
  const Icon = styles.icon;

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold backdrop-blur-xl ${styles.bg} ${styles.border} ${styles.text} ${styles.shadow} animate-toastIn max-w-sm w-full transition-all`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-textPrimary leading-normal">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg text-textMuted hover:text-textPrimary hover:bg-white/5 transition"
        aria-label="Dismiss notification"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};
