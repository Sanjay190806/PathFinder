import React from 'react';
import { GermanExample } from '../../types/german';

interface Props {
  examples: GermanExample[];
  cultureTip?: string;
}

export const GermanLessonExamples: React.FC<Props> = ({ examples = [], cultureTip }) => {
  if (!examples || examples.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-textMuted italic">No examples yet.</p>
        {cultureTip && (
          <div className="rounded-xl border border-accentRed/20 bg-accentRed/10 p-3 text-xs leading-5 text-textSecondary">
            <span className="font-semibold text-accentRed">Culture tip: </span>
            {cultureTip}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        {examples.map((example) => (
          <div key={`${example.german}-${example.english}`} className="rounded-xl border border-border-subtle bg-white/[0.03] p-3">
            <p className="text-sm font-semibold text-textPrimary">{example.german}</p>
            <p className="mt-1 text-xs text-textSecondary">{example.english}</p>
            {example.pronunciationHint && <p className="mt-2 text-[11px] text-textMuted">{example.pronunciationHint}</p>}
          </div>
        ))}
      </div>

      {cultureTip && (
        <div className="rounded-xl border border-accentRed/20 bg-accentRed/10 p-3 text-xs leading-5 text-textSecondary">
          <span className="font-semibold text-accentRed">Culture tip: </span>
          {cultureTip}
        </div>
      )}
    </div>
  );
};
