import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useAIStore } from '../../app/store/useAIStore';
import { useUIStore } from '../../app/store/useUIStore';
import { Button } from '../ui/Button';

interface Props {
  prompt: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export const GermanAskShaylaButton: React.FC<Props> = ({ prompt, label = 'Ask Shayla for help', variant = 'outline' }) => {
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
    <Button size="sm" variant={variant} onClick={openShayla} className="gap-2">
      <MessageCircle className="h-4 w-4" />
      {label}
    </Button>
  );
};
