import React from 'react';
import { Button } from '../ui/Button';
import { Volume2, Square } from 'lucide-react';

export const GermanAudioControls: React.FC<{
  hasSpeechSynthesis: boolean;
  onPlayWord: () => void;
  onStop: () => void;
}> = ({ hasSpeechSynthesis, onPlayWord, onStop }) => {
  if (!hasSpeechSynthesis) {
    return <div className="text-sm text-textSecondary">Speech synthesis unavailable. Showing fallback text mode.</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="primary" className="gap-2" onClick={onPlayWord}>
        <Volume2 className="h-4 w-4" />
        Play audio
      </Button>
      <Button size="sm" variant="outline" className="gap-2" onClick={onStop}>
        <Square className="h-4 w-4" />
        Stop
      </Button>
    </div>
  );
};

