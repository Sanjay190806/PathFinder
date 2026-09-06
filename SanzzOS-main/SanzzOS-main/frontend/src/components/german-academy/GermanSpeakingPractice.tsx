import React, { useMemo, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { GermanPronunciationFeedback } from './GermanPronunciationFeedback';
import { GermanSpeakingHistory, SpeakingHistoryItem } from './GermanSpeakingHistory';
import { useCareerStore } from '../../app/store/useCareerStore';
import { MicrophoneHelpPanel } from '../german/MicrophoneHelpPanel';

const prompts = [
  'Stell dich bitte vor. (Introduce yourself)',
  'Sag deinen heutigen Satz. (Say your sentence for today)',
  'Beschreibe dein College. (Describe your college)',
  'Beschreibe dein Ziel. (Describe your goal)',
  'German interview mini-practice'
];

export const GermanSpeakingPractice: React.FC = () => {
  const logGermanSpeakingSession = useCareerStore((s) => s.logGermanSpeakingSession);
  const awardXP = useCareerStore((s) => s.awardXP);
  const speakingStreak = useCareerStore((s) => s.germanSpeakingStreak || s.germanStreak || 0);

  const [prompt, setPrompt] = useState(prompts[0]);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [history, setHistory] = useState<SpeakingHistoryItem[]>([]);
  const [listening, setListening] = useState(false);
  const [showMicError, setShowMicError] = useState(false);
  const [typingMode, setTypingMode] = useState(false);
  const [repetitionCount, setRepetitionCount] = useState(0);

  const recognitionRef = useRef<any>(null);
  const startRef = useRef<number | null>(null);
  const transcriptRef = useRef('');

  const support = typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const wordsMatched = useMemo(() => {
    const lower = transcript.toLowerCase();
    return ['ich', 'bin', 'heute', 'mein', 'und', 'deutsch', 'lernen', 'studium', 'hallo'].filter((word) => lower.includes(word)).length;
  }, [transcript]);

  const sentenceComplete = useMemo(() => {
    const words = transcript.trim().split(/\s+/).filter(Boolean).length;
    return Math.min(5, Math.max(1, Math.round(words / 4)));
  }, [transcript]);

  const start = () => {
    if (!support || listening) return;
    setShowMicError(false);
    
    try {
      const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new Ctor();
      recognition.lang = 'de-DE';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognitionRef.current = recognition;
      startRef.current = Date.now();
      transcriptRef.current = '';
      setTranscript('');
      setListening(true);

      recognition.onresult = (event: any) => {
        const nextTranscript = Array.from(event.results).map((result: any) => result[0]?.transcript || '').join(' ');
        transcriptRef.current = nextTranscript;
        setTranscript(nextTranscript);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition capture error:', e);
        setListening(false);
        // Show diagnostics panel
        setShowMicError(true);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to boot SpeechRecognition Ctor:', err);
      setShowMicError(true);
    }
  };

  const stop = () => {
    recognitionRef.current?.stop?.();
    setListening(false);
    if (startRef.current) {
      const minutes = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
      logGermanSpeakingSession(minutes);
      
      // Award Speaking Practice XP
      awardXP(25);

      setHistory((current) => [
        {
          phrase: transcriptRef.current || transcript,
          minutes,
          confidence,
          mode: prompt,
          createdAt: new Date().toISOString()
        },
        ...current
      ].slice(0, 8));
      
      setRepetitionCount((count) => count + 1);
    }
  };

  const handleSubmitText = () => {
    if (!transcript.trim()) return;
    
    // Add text log as typing mode entry
    setHistory((current) => [
      {
        phrase: transcript,
        minutes: 1,
        confidence,
        mode: `${prompt} (Typing Mode)`,
        createdAt: new Date().toISOString()
      },
      ...current
    ].slice(0, 8));

    // Award partial XP for text practice
    awardXP(10);
    setRepetitionCount((count) => count + 1);
    setTranscript('');
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr] select-none">
      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-textMuted">Speaking Practice Dojo</p>
              <h3 className="mt-1 text-lg font-black text-textPrimary">Speaking Training Session</h3>
            </div>
            <Badge variant={typingMode ? 'warning' : 'success'}>
              {typingMode ? 'Typing Mode' : 'Mic Active'}
            </Badge>
          </div>

          <p className="text-xs text-textSecondary">
            Practice speaking German phrases aloud or toggle typing mode to write your responses.
          </p>

          {/* Practice prompts grid */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {prompts.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPrompt(item)}
                className={`px-3 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition ${
                  prompt === item
                    ? 'border-accentBlue bg-accentBlue/10 text-textPrimary'
                    : 'border-white/5 bg-white/[0.01] text-textSecondary hover:bg-white/5'
                }`}
              >
                {item.split(' ')[0]}
              </button>
            ))}
          </div>

          <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} label="Practice Topic / Prompt" />

          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={5}
            placeholder={typingMode ? "Type your German response here." : "Click 'Start speaking' and say your answer."}
            className="resize-none rounded-2xl border border-white/5 bg-black/45 px-4 py-3.5 text-xs text-textPrimary placeholder:text-textMuted/70 focus:border-accentBlue focus:outline-none"
            readOnly={!typingMode && !listening}
          />

          <div className="flex flex-wrap items-center gap-2 mt-1">
            {typingMode ? (
              <Button variant="primary" size="sm" onClick={handleSubmitText}>
                Submit Response
              </Button>
            ) : (
              <Button variant={listening ? 'danger' : 'primary'} size="sm" onClick={listening ? stop : start}>
                {listening ? 'Stop Speaking' : 'Start Speaking'}
              </Button>
            )}
            
            <button
              type="button"
              onClick={() => {
                setTranscript('');
                setRepetitionCount(0);
                setShowMicError(false);
              }}
              className="px-4 py-2 border border-white/5 rounded-xl text-xs hover:bg-white/5 text-textSecondary transition"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => {
                setTypingMode(!typingMode);
                setShowMicError(false);
              }}
              className="px-4 py-2 border border-white/5 rounded-xl text-xs hover:bg-white/5 text-textSecondary transition"
            >
              {typingMode ? 'Enable Microphone' : 'Enable Typing Mode'}
            </button>

            <span className="ml-auto text-[10px] text-textMuted font-bold uppercase">
              Streak: {speakingStreak} Days
            </span>
          </div>
        </Card>

        {/* Dynamic Diagnostics block */}
        {showMicError && (
          <MicrophoneHelpPanel
            onUseTypingMode={() => {
              setTypingMode(true);
              setShowMicError(false);
            }}
            onTryAgain={() => start()}
          />
        )}
      </div>

      <div className="grid gap-5">
        <GermanPronunciationFeedback
          confidenceRating={confidence}
          wordsMatched={wordsMatched}
          sentenceComplete={sentenceComplete}
          repetitionCount={repetitionCount}
        />
        
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-textMuted">Speaking Confidence Rating</span>
            <Badge variant="primary">{confidence} / 5</Badge>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="w-full accent-accentBlue"
          />
        </Card>

        <GermanSpeakingHistory items={history} />
      </div>
    </div>
  );
};
export default GermanSpeakingPractice;
