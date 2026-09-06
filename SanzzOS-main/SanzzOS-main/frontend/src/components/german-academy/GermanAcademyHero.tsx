import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Languages, Mic, Headphones } from 'lucide-react';

export const GermanAcademyHero: React.FC<{
  level: string;
  streak: number;
  speakingStreak: number;
  readiness: number;
  onJumpSpeaking: () => void;
  onJumpListening: () => void;
}> = ({ level, streak, speakingStreak, readiness, onJumpSpeaking, onJumpListening }) => {
  return (
    <Card className="grid gap-4 border-accentBlue/20 bg-accentBlue/5 md:grid-cols-[1.2fr_0.8fr]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">German Academy 3.0</Badge>
          <Badge variant="success">{level}</Badge>
          <Badge variant="warning">{streak} day streak</Badge>
        </div>
        <h2 className="text-2xl font-semibold text-textPrimary">Learn German with lessons, stories, speaking, listening, and Shayla conversations.</h2>
        <p className="max-w-2xl text-sm leading-6 text-textSecondary">
          Browser-based practice only. No automatic microphone start, no audio upload, and no Duolingo-style branding.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" className="gap-2" onClick={onJumpSpeaking}>
            <Mic className="h-4 w-4" /> Speaking practice
          </Button>
          <Button variant="outline" className="gap-2" onClick={onJumpListening}>
            <Headphones className="h-4 w-4" /> Listening practice
          </Button>
        </div>
      </div>
      <div className="grid gap-3">
        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Estimated readiness</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-semibold text-textPrimary">{readiness}%</span>
            <span className="pb-1 text-xs text-textSecondary">heuristic</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Speaking streak</p>
          <div className="mt-2 flex items-center gap-2 text-textPrimary">
            <Languages className="h-4 w-4 text-accentBlue" />
            <span className="text-lg font-semibold">{speakingStreak} days</span>
          </div>
          <p className="mt-1 text-xs text-textSecondary">Browser-based speaking practice updates this streak.</p>
        </div>
      </div>
    </Card>
  );
};
