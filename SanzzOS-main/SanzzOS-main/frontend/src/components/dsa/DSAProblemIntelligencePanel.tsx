import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { ProblemLog } from '../../types';

type DSAIntelItem = {
  day: number;
  index: number;
  topic: string;
  title: string;
  log?: ProblemLog;
};

type DSAIntelPattern = {
  pattern: string;
  totalCount: number;
  solvedCount: number;
  lowConfidenceCount: number;
  revisionQueueCount: number;
  topics: string[];
  items: DSAIntelItem[];
};

const tagMatchers: Array<{ tag: string; terms: string[] }> = [
  { tag: 'edge case', terms: ['edge', 'empty', 'null', 'boundary', 'off by one', 'off-by-one'] },
  { tag: 'time complexity', terms: ['time', 'complexity', 'tle', 'optimize', 'slow'] },
  { tag: 'syntax', terms: ['syntax', 'compile', 'semicolon', 'import', 'type'] },
  { tag: 'logic', terms: ['logic', 'wrong', 'condition', 'loop', 'pointer', 'index'] },
];

const inferMistakeTags = (items: DSAIntelItem[]) => {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const text = `${item.log?.mistakeLog || ''} ${item.log?.notes || ''}`.toLowerCase();
    tagMatchers.forEach(({ tag, terms }) => {
      if (terms.some((term) => text.includes(term))) counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
};

export const DSAProblemIntelligencePanel: React.FC<{
  patterns: DSAIntelPattern[];
  onRedoSoon: (items: Array<{ day: number; index: number }>, reason: string) => void;
}> = ({ patterns, onRedoSoon }) => {
  const solved = patterns.reduce((sum, pattern) => sum + pattern.solvedCount, 0);
  const total = patterns.reduce((sum, pattern) => sum + pattern.totalCount, 0);
  const loggedSolvedItems = patterns.flatMap((pattern) => pattern.items.filter((item) => item.log?.solved));
  const confidenceScore = loggedSolvedItems.length
    ? Math.round((loggedSolvedItems.reduce((sum, item) => sum + (item.log?.confidence || 0), 0) / (loggedSolvedItems.length * 5)) * 100)
    : 0;

  const weakPatterns = [...patterns]
    .map((pattern) => ({
      ...pattern,
      weaknessScore: (pattern.totalCount - pattern.solvedCount) + pattern.lowConfidenceCount * 2 + pattern.revisionQueueCount,
      progress: pattern.totalCount ? Math.round((pattern.solvedCount / pattern.totalCount) * 100) : 0,
      tags: inferMistakeTags(pattern.items),
    }))
    .filter((pattern) => pattern.totalCount > 0)
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 5);

  const redoQueue = patterns
    .flatMap((pattern) => pattern.items.map((item) => ({ ...item, pattern: pattern.pattern })))
    .filter((item) => item.log?.revisitFlag || (item.log?.solved && (item.log?.confidence || 0) <= 2))
    .slice(0, 6);

  const masteryRows = patterns
    .filter((pattern) => pattern.totalCount > 0)
    .map((pattern) => ({
      pattern: pattern.pattern,
      value: pattern.totalCount ? Math.round((pattern.solvedCount / pattern.totalCount) * 100) : 0,
    }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 12);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="p-5" style={{ border: '1px solid rgba(220,38,38,0.14)', background: 'rgba(10,0,2,0.72)' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-textMuted font-mono">DSA Problem Intelligence</p>
            <h3 className="mt-1 text-xl font-black text-textPrimary">Weak patterns and redo engine</h3>
            <p className="mt-1 text-xs text-textSecondary">Detected from solved flags, confidence, revisit flags, notes, and mistake logs.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Signal label="Solved" value={`${solved}/${total}`} />
            <Signal label="Confidence" value={`${confidenceScore}%`} />
            <Signal label="Redo" value={String(redoQueue.length)} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-5">
          {weakPatterns.map((pattern) => (
            <div key={pattern.pattern} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-textPrimary">{pattern.pattern}</p>
                <Badge variant={pattern.progress < 35 ? 'danger' : 'warning'}>{pattern.progress}%</Badge>
              </div>
              <ProgressBar value={pattern.progress} color="#dc2626" />
              <p className="mt-2 text-[10px] text-textMuted">{pattern.lowConfidenceCount} low-confidence, {pattern.revisionQueueCount} flagged</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {pattern.tags.length ? pattern.tags.slice(0, 3).map(([tag, count]) => (
                  <Badge key={tag} variant="neutral" className="text-[8px]">{tag} x{count}</Badge>
                )) : <Badge variant="neutral" className="text-[8px]">no mistake tags yet</Badge>}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 h-7 w-full text-[9px]"
                onClick={() => onRedoSoon(pattern.items.slice(0, 3).map((item) => ({ day: item.day, index: item.index })), 'Redo in 3 days')}
              >
                Redo in 3 days
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5" style={{ border: '1px solid rgba(59,130,246,0.12)', background: 'rgba(0,5,18,0.72)' }}>
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-textMuted font-mono">Pattern Mastery Map</p>
        <div className="mt-4 grid gap-2">
          {masteryRows.map((row) => (
            <div key={row.pattern}>
              <div className="mb-1 flex justify-between gap-3 text-[10px]">
                <span className="truncate text-textSecondary">{row.pattern}</span>
                <span className="font-bold text-textPrimary">{row.value}%</span>
              </div>
              <ProgressBar value={row.value} color={row.value < 35 ? '#dc2626' : row.value < 70 ? '#f97316' : '#22c55e'} />
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-textMuted font-mono">Redo queue</p>
          <div className="grid gap-2">
            {redoQueue.length ? redoQueue.map((item) => (
              <div key={`${item.day}-${item.index}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                <p className="text-xs font-semibold text-textPrimary">Day {item.day}: {item.title}</p>
                <p className="mt-0.5 text-[10px] text-textMuted">{item.pattern} - confidence {item.log?.confidence || 0}/5</p>
              </div>
            )) : (
              <p className="rounded-xl border border-dashed border-white/10 p-3 text-xs text-textMuted">No redo items yet. Flag problems or log low confidence to fill this queue.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const Signal: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
    <p className="text-[8px] uppercase tracking-widest text-textMuted">{label}</p>
    <p className="mt-1 text-sm font-black text-textPrimary">{value}</p>
  </div>
);
