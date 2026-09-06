import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAIStore } from '../../app/store/useAIStore';
import { useUIStore } from '../../app/store/useUIStore';
import { MessageCircle } from 'lucide-react';

export const MobileShaylaDock: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const queuePrompt = useAIStore((s) => s.queuePrompt);
  const setActiveSection = useUIStore((s) => s.setActiveSection);

  const handleOpen = () => {
    if (prompt.trim()) {
      queuePrompt(prompt.trim());
    }
    setActiveSection('ai');
  };

  return (
    <Card className="md:hidden flex items-center gap-3">
      <MessageCircle className="h-5 w-5 shrink-0 text-accentBlue" />
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask Shayla on mobile..."
        className="min-w-0 flex-1 rounded-xl border border-border-subtle bg-white/[0.03] px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted/70"
      />
      <Button size="sm" onClick={handleOpen}>Open</Button>
    </Card>
  );
};

