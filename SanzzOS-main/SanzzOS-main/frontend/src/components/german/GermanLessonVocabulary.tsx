import React from 'react';
import { GermanVocabularyItem } from '../../types/german';

interface Props {
  vocabulary: GermanVocabularyItem[];
}

export const GermanLessonVocabulary: React.FC<Props> = ({ vocabulary = [] }) => {
  if (!vocabulary || vocabulary.length === 0) {
    return <p className="text-xs text-textMuted italic">No vocabulary yet.</p>;
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
    {vocabulary.map((item) => (
      <div key={item.id} className="rounded-xl border border-border-subtle bg-white/[0.03] p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-textPrimary">{item.german || item.word}</p>
            <p className="mt-1 text-xs text-textSecondary">{item.english || item.meaning}</p>
          </div>
          <span className="rounded-lg bg-accentYellow/10 px-2 py-1 text-[10px] font-semibold text-accentYellow">
            {item.category}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-textMuted">Pronunciation: {item.pronunciationHint}</p>
        <p className="mt-2 text-xs text-textSecondary">{item.exampleGerman || item.exampleSentence}</p>
        {item.exampleEnglish && <p className="mt-1 text-[11px] text-textMuted">{item.exampleEnglish}</p>}
      </div>
    ))}
  </div>
  );
};
