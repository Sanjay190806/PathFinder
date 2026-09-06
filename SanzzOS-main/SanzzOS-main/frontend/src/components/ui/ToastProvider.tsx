import React from 'react';
import { useToastStore } from '../../app/store/useToastStore';
import { Toast } from './Toast';

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toasts, dismissToast } = useToastStore();

  return (
    <>
      {children}
      <div 
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full select-none"
        aria-live="assertive"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </>
  );
};
