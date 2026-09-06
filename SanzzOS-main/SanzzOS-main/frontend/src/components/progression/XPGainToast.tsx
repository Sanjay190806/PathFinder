import React, { useEffect, useState } from 'react';
import { Award } from 'lucide-react';

interface ToastItem {
  id: string;
  source: string;
  amount: number;
}

export const XPGainToast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleXPLogged = (e: Event) => {
      const customEvent = e as CustomEvent<{ source: string; amount: number }>;
      const { source, amount } = customEvent.detail;
      
      const newToast: ToastItem = {
        id: `toast-${Date.now()}-${Math.random()}`,
        source,
        amount
      };

      setToasts((current) => [...current, newToast]);

      // Remove after 3 seconds
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== newToast.id));
      }, 3000);
    };

    window.addEventListener('xp_logged', handleXPLogged);
    return () => window.removeEventListener('xp_logged', handleXPLogged);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2 select-none pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-slide-up flex items-center gap-2.5 rounded-2xl border border-accentEmerald/20 bg-black/90 px-4 py-2.5 text-xs text-textPrimary shadow-2xl"
          style={{
            animation: 'slide-up-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <div className="h-6 w-6 rounded-lg bg-accentEmerald/10 border border-accentEmerald/20 flex items-center justify-center text-accentEmerald">
            <Award className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-accentEmerald">+{toast.amount} XP</span>
            <span className="text-[9px] text-textSecondary">{toast.source}</span>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
export default XPGainToast;
