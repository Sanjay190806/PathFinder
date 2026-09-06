import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Volume2, Star } from 'lucide-react';
import { GermanVocabularyItem } from '../../types/german';

interface GermanFlashcardProps {
  word: GermanVocabularyItem;
  isWeak: boolean;
  onMarkWeak: () => void;
  onMarkKnown: () => void;
}

export const GermanFlashcard: React.FC<GermanFlashcardProps> = ({
  word,
  isWeak,
  onMarkWeak,
  onMarkKnown
}) => {
  const [flipped, setFlipped] = useState(false);

  const speakGerman = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cancel active voice to prevent overlaps
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center max-w-sm w-full mx-auto">
      {/* 3D Flashcard Wrapper */}
      <div
        className="w-full h-64 cursor-pointer perspective"
        onClick={() => setFlipped(!flipped)}
      >
        <div className={`relative w-full h-full duration-500 preserve-3d transform-style ${
          flipped ? 'rotate-y-180' : ''
        }`}>
          {/* Front Card (German Word) */}
          <Card className="absolute inset-0 flex flex-col justify-between items-center text-center backface-hidden border-border-accent/40 bg-bgSurface/60 p-6 shadow-xl">
            <span className="text-[10px] text-textMuted uppercase font-bold tracking-widest">
              German Word (Front)
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-extrabold text-textPrimary tracking-tight">
                {word.word || word.german}
              </h2>
              <span className="text-xs text-textMuted italic font-mono">
                {word.pronunciationHint}
              </span>
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => speakGerman(word.word || word.german || '')}
                className="h-8 w-8 p-0 rounded-full"
                title="Listen Pronunciation"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Back Card (English Translation) */}
          <Card className="absolute inset-0 flex flex-col justify-between items-center text-center backface-hidden rotate-y-180 border-accentBlue/30 bg-accentBlue/5 p-6 shadow-xl">
            <span className="text-[10px] text-textMuted uppercase font-bold tracking-widest">
              Translation (Back)
            </span>
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-textPrimary">
                {word.meaning || word.english}
              </h3>
              <p className="text-xs text-textSecondary max-w-[250px] leading-relaxed mt-2">
                <strong>Ex:</strong> {word.exampleSentence || word.exampleGerman}
              </p>
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant={isWeak ? 'secondary' : 'outline'}
                onClick={onMarkWeak}
                className="text-[10px] h-[30px]"
              >
                <Star className={`mr-1.5 h-3.5 w-3.5 ${isWeak ? 'fill-current text-accentYellow' : ''}`} />
                {isWeak ? 'Weak Vocabulary' : 'Mark as Weak'}
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={onMarkKnown}
                className="text-[10px] h-[30px]"
              >
                ✓ Mark Known
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <span className="text-[10px] text-textMuted text-center">
        💡 Click flashcard to flip between German and English meanings.
      </span>
    </div>
  );
};
