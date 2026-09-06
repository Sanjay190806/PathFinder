import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { GermanAudioControls } from './GermanAudioControls';
import { useCareerStore } from '../../app/store/useCareerStore';

const WORDS = [
  { german: 'Hallo', meaning: 'Hello' },
  { german: 'Danke', meaning: 'Thanks' },
  { german: 'Bitte', meaning: 'Please / You are welcome' },
  { german: 'Bahnhof', meaning: 'Train station' },
];

export const GermanListeningPractice: React.FC = () => {
  const logGermanListeningSession = useCareerStore((s) => s.logGermanListeningSession);
  const [current, setCurrent] = useState(WORDS[0]);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const hasSpeech = typeof window !== 'undefined' && Boolean(window.speechSynthesis);

  const speak = (text: string) => {
    if (!hasSpeech) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    logGermanListeningSession(1);
  };

  const score = useMemo(() => selected && selected === current.meaning ? 'correct' : 'try again', [current.meaning, selected]);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Listening practice</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Play, choose, repeat</h3>
        </div>
        <Badge variant={hasSpeech ? 'success' : 'warning'}>{hasSpeech ? 'SpeechSynthesis ready' : 'Text fallback'}</Badge>
      </div>

      <GermanAudioControls
        hasSpeechSynthesis={hasSpeech}
        onPlayWord={() => speak(current.german)}
        onStop={() => window.speechSynthesis?.cancel?.()}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        {WORDS.map((word) => (
          <button
            key={word.german}
            type="button"
            onClick={() => {
              setCurrent(word);
              setSelected(null);
              setFeedback('');
            }}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              current.german === word.german ? 'border-accentBlue bg-accentBlue/10' : 'border-border-subtle bg-white/[0.03]'
            }`}
          >
            <div className="text-sm font-semibold text-textPrimary">{word.german}</div>
            <div className="mt-1 text-xs text-textSecondary">{word.meaning}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {WORDS.map((word) => (
          <Button key={word.meaning} size="sm" variant="outline" onClick={() => setSelected(word.meaning)}>
            {word.meaning}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
        <div>
          <p className="text-sm font-semibold text-textPrimary">{current.german}</p>
          <p className="text-xs text-textSecondary">{selected || 'Select a meaning'}</p>
        </div>
        <Badge variant={score === 'correct' ? 'success' : 'warning'}>{score}</Badge>
      </div>
      {feedback && <div className="text-sm text-textSecondary">{feedback}</div>}
    </Card>
  );
};

