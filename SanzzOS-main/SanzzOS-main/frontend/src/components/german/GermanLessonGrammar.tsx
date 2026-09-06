import React from 'react';
import { GermanGrammarPoint } from '../../types/german';

interface Props {
  grammar: GermanGrammarPoint[];
}

export const GermanLessonGrammar: React.FC<Props> = ({ grammar = [] }) => {
  if (!grammar || grammar.length === 0) {
    return <p className="text-xs text-textMuted italic">No grammar notes yet.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {grammar.map((point) => (
        <div key={point.title} className="rounded-xl border border-border-subtle bg-white/[0.03] p-3">
          <p className="text-sm font-semibold text-textPrimary">{point.title}</p>
          <p className="mt-2 text-xs leading-5 text-textSecondary">{point.explanation}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(point.examples || []).map((example) => (
              <span key={example} className="rounded-lg bg-bgSurface px-2.5 py-1 text-[11px] text-textSecondary">
                {example}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
