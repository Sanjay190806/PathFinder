import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { GERMAN_LESSONS } from '../../data/germanLessons';
import { Volume2, RefreshCw, Eye, Sparkles, Award } from 'lucide-react';
import { launchBurst } from '../../utils/confetti';

interface GermanSRSQueueProps {
  weakWords: string[];
}

export const GermanSRSQueue: React.FC<GermanSRSQueueProps> = ({ weakWords }) => {
  const vocabProgress = useCareerStore((s) => s.vocabulary || {});
  const submitWordReview = useCareerStore((s) => s.submitWordReview);

  // Retrieve vocabulary objects from lessons
  const allVocabItems = GERMAN_LESSONS.flatMap((lesson) => lesson.vocabulary || []);
  
  // A word is due if it has status 'review' or is marked as a weak word
  const dueItems = allVocabItems.filter((v) => {
    const progress = vocabProgress[v.id];
    return progress?.status === 'review' || weakWords.includes(v.id) || !progress;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const activeItem = dueItems[currentIndex];

  const handleRating = (rating: 1 | 2 | 3 | 4, event: React.MouseEvent<HTMLButtonElement>) => {
    const isCorrect = rating >= 2;
    
    // Play feedback sound and confetti burst on Easy
    if (rating === 4) {
      launchBurst(event.currentTarget, 15);
    }
    
    submitWordReview(activeItem.id, isCorrect, rating);
    
    // Slide transition to next card
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < dueItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 250);
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Calculate mastery details across all words
  const totalWords = allVocabItems.length;
  const knownWords = Object.values(vocabProgress).filter((v) => v.status === 'known').length;
  const masteryPct = totalWords > 0 ? Math.round((knownWords / totalWords) * 100) : 0;

  if (dueItems.length === 0) {
    return (
      <Card className="py-12 text-center text-textSecondary flex flex-col items-center justify-center relative overflow-hidden"
        style={{ border: '1px solid rgba(34,197,94,0.15)', background: 'rgba(5,15,5,0.7)' }}>
        <div className="absolute top-0 right-0 text-[64px] opacity-[0.02] pointer-events-none select-none">🇩🇪</div>
        <Award className="h-10 w-10 text-accentEmerald animate-pulse mb-3" />
        <span className="text-sm font-black text-white uppercase tracking-wider">All reviews caught up!</span>
        <p className="text-xs text-textMuted max-w-[320px] mt-2 leading-relaxed">
          Stunning focus! Your spaced repetition cards are fully cleared. Master more vocabulary items by unlocking new lessons in the Academy path.
        </p>
        <div className="mt-4 flex gap-4 items-center px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono text-white/40">Total Vocab</span>
            <span className="text-sm font-bold text-white">{totalWords}</span>
          </div>
          <div className="h-6 w-px bg-white/5" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono text-white/40">Mastered</span>
            <span className="text-sm font-bold text-accentEmerald">{knownWords}</span>
          </div>
          <div className="h-6 w-px bg-white/5" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono text-white/40">Mastery %</span>
            <span className="text-sm font-bold text-purple-400">{masteryPct}%</span>
          </div>
        </div>
      </Card>
    );
  }

  const progress = vocabProgress[activeItem.id] || { easeFactor: 2.5, reviewStage: 0 };
  const currentEF = progress.easeFactor !== undefined ? progress.easeFactor.toFixed(2) : '2.50';

  return (
    <Card className="flex flex-col gap-4 relative overflow-hidden"
      style={{ border: '1px solid rgba(168,85,247,0.15)', background: 'rgba(15,0,25,0.8)' }}>
      
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Badge variant="primary" className="bg-purple-950/40 text-purple-400 border border-purple-500/20 font-mono">
            Card {currentIndex + 1} of {dueItems.length}
          </Badge>
          <Badge variant="neutral" className="bg-white/5 text-white/40 border border-white/5 font-mono text-[9px]">
            EF: {currentEF}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[9px] font-mono font-black text-white/30 uppercase tracking-widest">Mastery: {masteryPct}%</div>
          <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-300" style={{ width: `${masteryPct}%` }} />
          </div>
        </div>
      </div>

      {/* Spaced Repetition Card Arena */}
      <div className="perspective-[1000px] py-2">
        <div className={`relative min-h-[190px] rounded-2xl border transition-all duration-500 transform-style-3d p-6 flex flex-col justify-between items-center ${
          isFlipped 
            ? 'border-emerald-500/25 bg-emerald-950/10 rotate-y-180' 
            : 'border-purple-500/20 bg-purple-950/10'
        }`}>
          {/* Card Front */}
          {!isFlipped ? (
            <div className="w-full flex flex-col justify-between items-center flex-1">
              <span className="text-[9px] font-black tracking-widest text-white/30 font-mono uppercase">German Word</span>
              
              <div className="text-center my-auto py-4">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2.5">
                  {activeItem.word}
                  <button
                    onClick={(e) => { e.stopPropagation(); speakWord(activeItem.word); }}
                    className="p-1.5 rounded-full hover:bg-white/5 text-purple-400 hover:text-purple-300 hover:scale-105 transition"
                    title="Pronounce word"
                  >
                    <Volume2 className="h-4.5 w-4.5" />
                  </button>
                </h2>
                <p className="text-[10px] text-purple-400/60 italic font-mono mt-1 tracking-wider">{activeItem.pronunciationHint}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFlipped(true)}
                className="w-full max-w-[200px] text-[10px] font-black uppercase tracking-widest border-purple-500/30 text-purple-400 bg-purple-950/20 hover:bg-purple-950/40 hover:text-white"
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" /> Show Meaning
              </Button>
            </div>
          ) : (
            /* Card Back */
            <div className="w-full flex flex-col justify-between items-center flex-1 transform-rotate-y-180">
              <span className="text-[9px] font-black tracking-widest text-white/30 font-mono uppercase">English Meaning</span>
              
              <div className="text-center my-auto py-2">
                <h3 className="text-2xl font-black text-accentEmerald tracking-tight">
                  {activeItem.meaning}
                </h3>
                <div className="mt-3 max-w-[360px] p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-white/70 leading-relaxed font-mono">
                  <div className="text-[8px] font-black text-white/30 tracking-widest uppercase mb-1">Context / Example</div>
                  "{activeItem.exampleSentence}"
                </div>
              </div>

              <div className="w-full flex items-center justify-between gap-1 border-t border-white/5 pt-3">
                <button
                  onClick={() => setIsFlipped(false)}
                  className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/5 border border-transparent transition"
                  title="Flip back to front"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono">Flip Card</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SM-2 Rating Controls */}
      {isFlipped && (
        <div className="flex flex-col gap-2 animate-fadeIn border-t border-white/5 pt-3">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-mono text-center mb-1">
            Choose your recall quality:
          </span>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={(e) => handleRating(1, e)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:border-red-500/40 hover:text-white transition active:scale-95 group"
            >
              <span className="text-xs font-black uppercase tracking-wider group-hover:scale-105 transition">Again</span>
              <span className="text-[8px] font-mono text-red-500/50 mt-0.5">1d</span>
            </button>
            <button
              onClick={(e) => handleRating(2, e)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-yellow-500/20 bg-yellow-950/20 text-yellow-400 hover:bg-yellow-950/40 hover:border-yellow-500/40 hover:text-white transition active:scale-95 group"
            >
              <span className="text-xs font-black uppercase tracking-wider group-hover:scale-105 transition">Hard</span>
              <span className="text-[8px] font-mono text-yellow-500/50 mt-0.5">2d</span>
            </button>
            <button
              onClick={(e) => handleRating(3, e)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-green-500/20 bg-green-950/20 text-green-400 hover:bg-green-950/40 hover:border-green-500/40 hover:text-white transition active:scale-95 group"
            >
              <span className="text-xs font-black uppercase tracking-wider group-hover:scale-105 transition">Good</span>
              <span className="text-[8px] font-mono text-green-500/50 mt-0.5">Varies</span>
            </button>
            <button
              onClick={(e) => handleRating(4, e)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/40 hover:border-cyan-500/40 hover:text-white transition active:scale-95 group"
            >
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-0.5 group-hover:scale-105 transition">
                Easy <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
              </span>
              <span className="text-[8px] font-mono text-cyan-500/50 mt-0.5">Varies</span>
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};
