import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useUIStore } from '../../app/store/useUIStore';
import { useAIStore } from '../../app/store/useAIStore';

const prompts = ['Hallo', 'Ich heisse Sanju.', 'Ich lerne Deutsch.', 'Ich komme aus Indien.'];

export const MobileGermanQuickPractice: React.FC = () => {
  const queuePrompt = useAIStore((s) => s.queuePrompt);
  const setActiveSection = useUIStore((s) => s.setActiveSection);

  const ask = (prompt: string) => {
    queuePrompt(`Help me practice this German sentence and correct it gently: ${prompt}`);
    setActiveSection('ai');
  };

  return (
    <Card className="md:hidden flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">German quick practice</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">One tap German reps</h3>
        </div>
        <Badge variant="success">A1/A2</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {prompts.map((prompt) => (
          <Button key={prompt} variant="outline" size="sm" onClick={() => ask(prompt)}>
            {prompt}
          </Button>
        ))}
      </div>
      <Button size="sm" onClick={() => setActiveSection('german')}>Open German Academy</Button>
    </Card>
  );
};

