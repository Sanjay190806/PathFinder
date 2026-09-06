import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RoadmapProblem } from '../../types';

interface LeetCodeTaskCardProps {
  problem: RoadmapProblem;
  problemIndex: number;
  solved: boolean;
  confidence: number;
  notes: string;
  onSolvedChange: (val: boolean) => void;
  onConfidenceChange: (val: number) => void;
  onNotesChange: (val: string) => void;
}

export const LeetCodeTaskCard: React.FC<LeetCodeTaskCardProps> = ({
  problem,
  solved,
  confidence,
  notes,
  onSolvedChange,
  onConfidenceChange,
  onNotesChange
}) => {
  const getDiffVariant = (diff: string) => {
    if (diff === 'Easy') return 'success';
    if (diff === 'Medium') return 'warning';
    return 'danger';
  };

  return (
    <Card className={`relative overflow-hidden border-white/5 bg-black/25 transition-all ${solved ? 'border-accentEmerald/30 bg-accentEmerald/5' : ''}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={solved}
            onChange={(e) => onSolvedChange(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded-md border-border-subtle bg-bgSurface text-accentBlue transition focus:ring-1 focus:ring-accentBlue/30"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-textMuted">
                #{problem.number}
              </span>
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-textPrimary transition hover:text-accentBlue hover:underline"
              >
                {problem.title}
              </a>
              <Badge variant={getDiffVariant(problem.difficulty)}>{problem.difficulty}</Badge>
            </div>
            <p className="mt-1 text-[10px] text-textSecondary">
              Pattern: <span className="font-semibold">{problem.pattern}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:pt-0.5">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-textSecondary transition hover:bg-white/[0.06] hover:text-textPrimary"
          >
            Solve on LeetCode
          </a>
        </div>
      </div>

      {solved && (
        <div className="fade-in mt-4 flex flex-col gap-4 border-t border-white/5 pt-4 md:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="pl-0.5 text-[10px] font-semibold uppercase text-textSecondary">Confidence (1-5)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="5"
                value={confidence}
                onChange={(e) => onConfidenceChange(parseInt(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-border-subtle accent-accentBlue"
              />
              <span className="w-4 font-mono text-xs font-bold text-textPrimary">{confidence}</span>
            </div>
          </div>

          <div className="flex flex-[2] flex-col gap-1.5">
            <label className="pl-0.5 text-[10px] font-semibold uppercase text-textSecondary">Mistake Log / Code Notes</label>
            <textarea
              placeholder="Record any edge cases or optimal Java pointers here..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="h-12 w-full resize-none rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-xs text-textPrimary transition focus:border-accentBlue focus:outline-none"
            />
          </div>
        </div>
      )}
    </Card>
  );
};
