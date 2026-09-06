import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Sparkles, Languages } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useAIStore } from '../../app/store/useAIStore';
import { useUIStore } from '../../app/store/useUIStore';
import { generateDailyBriefContext } from '../../utils/aiContextUtils';

export const ShaylaAdviceCard: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const queuePrompt = useAIStore((s) => s.queuePrompt);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const [brief, setBrief] = useState(generateDailyBriefContext(careerState));

  const generateBrief = () => {
    const nextBrief = generateDailyBriefContext(careerState);
    setBrief(nextBrief);
    queuePrompt(`Generate Shayla Daily Brief using this local context: ${JSON.stringify(nextBrief)}. Include today's main target, 2 LeetCode tasks, weakest habit, one German phrase, one tiny next action, and honest motivation.`);
    setActiveSection('ai');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/shayla');
    }
  };

  return (
    <Card className="relative flex flex-col justify-between overflow-hidden border-accentPurple/25 bg-gradient-to-br from-accentPurple/10 via-bgCard to-bgCard">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accentPurple">Shayla&apos;s advice</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Daily mentor note</h3>
        </div>
        <Sparkles className="h-4 w-4 text-accentPurple" />
      </div>

      <div className="my-auto py-2">
        <p className="text-lg font-semibold italic text-textPrimary">
          {brief.germanPhrase}
        </p>
        <p className="mt-2 text-sm leading-6 text-textSecondary">
          Main target: <span className="font-semibold text-accentPurple">{brief.mainTarget}</span>. Tiny action: {brief.tinyNextAction}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle/50 pt-3">
        <div className="flex items-center gap-2 text-[11px] text-textMuted">
          <Languages className="h-4 w-4 text-accentPurple" />
          <span>Weakest habit: {brief.weakestHabit}</span>
        </div>
        <Button size="sm" variant="secondary" onClick={generateBrief}>
          Generate Shayla Daily Brief
        </Button>
      </div>
    </Card>
  );
};
