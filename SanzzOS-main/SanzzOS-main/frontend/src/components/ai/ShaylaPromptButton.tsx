import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useAIStore } from '../../app/store/useAIStore';
import { useUIStore } from '../../app/store/useUIStore';
import { Button } from '../ui/Button';

interface ShaylaPromptButtonProps {
  prompt: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ShaylaPromptButton: React.FC<ShaylaPromptButtonProps> = ({
  prompt,
  children,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const queuePrompt = useAIStore((s) => s.queuePrompt);
  const setActiveSection = useUIStore((s) => s.setActiveSection);

  const openShayla = () => {
    queuePrompt(prompt);
    setActiveSection('ai');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/shayla');
    }
  };

  return (
    <Button type="button" size={size} variant={variant} onClick={openShayla} className={`gap-2 ${className}`}>
      <MessageCircle className="h-4 w-4" />
      {children}
    </Button>
  );
};
