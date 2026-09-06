import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { askGermanConversation, GermanConversationMode } from '../../services/germanAcademyService';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useAISettingsStore } from '../../app/store/useAISettingsStore';
import { GERMAN_LESSONS } from '../../data/germanLessons';
import { GERMAN_STORIES } from '../../data/germanStories';
import { Loader2, MessageCircle, Sparkles } from 'lucide-react';

const MODE_OPTIONS: { value: GermanConversationMode; label: string }[] = [
  { value: 'English + German help', label: 'English + German help' },
  { value: 'German only beginner', label: 'German only beginner' },
  { value: 'Interview German', label: 'Interview German' },
  { value: 'College German', label: 'College German' },
  { value: 'Daily life German', label: 'Daily life German' },
  { value: 'Correct my sentence', label: 'Correct my sentence' },
];

const QUICK_PROMPTS = [
  'Introduce yourself in simple German.',
  'Help me describe my college and project.',
  'Correct my last German sentence gently.',
  'Give me one short daily-life German answer.',
];

type ConversationItem = {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

function trim(value: string, limit = 160) {
  return value.length <= limit ? value : `${value.slice(0, Math.max(0, limit - 12)).trimEnd()}...[trimmed]`;
}

export const GermanConversationPanel: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const activeLesson = useMemo(
    () => GERMAN_LESSONS.find((lesson) => lesson.id === careerState.currentLessonId) || GERMAN_LESSONS[0],
    [careerState.currentLessonId]
  );
  const mode = useAISettingsStore((s) => (s.activeMode === 'German Tutor' ? 'German only beginner' : 'English + German help'));
  const [selectedMode, setSelectedMode] = useState<GermanConversationMode>(mode);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ConversationItem[]>([
    {
      role: 'assistant',
      content: 'Ask Shayla anything about German, and she will answer in a simple, friendly way.',
      createdAt: new Date().toISOString(),
    },
  ]);

  const level = careerState.germanLevel || 'A1 Beginner';
  const storyContext = GERMAN_STORIES[0];

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || loading) return;

    setLoading(true);
    setError(null);
    setItems((current) => [...current, { role: 'user', content: trim(prompt, 240), createdAt: new Date().toISOString() }]);

    try {
      const response = await askGermanConversation({
        mode: selectedMode,
        level: level === 'B1 Preview' ? 'A2.2' : 'A1.2',
        userMessage: prompt,
        context: {
          currentLesson: {
            id: activeLesson.id,
            title: activeLesson.title,
            objective: activeLesson.objective,
            level: activeLesson.level,
            vocabulary: activeLesson.vocabulary.slice(0, 3).map((word) => word.word),
          },
          story: {
            title: storyContext.title,
            summary: trim(storyContext.english, 140),
          },
          speakingSessions: careerState.germanSpeakingSessions,
          listeningSessions: careerState.germanListeningSessions,
          weakWords: careerState.weakWords.slice(0, 6),
          lessonCount: (Object.values(careerState.completedLessons || {}) as { completed: boolean }[]).filter((item) => item.completed).length,
        },
      });

      setItems((current) => [
        ...current,
        {
          role: 'assistant',
          content: response.reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (requestError: any) {
      const message = requestError?.message || 'Conversation request failed.';
      setError(message);
      setItems((current) => [
        ...current,
        {
          role: 'assistant',
          content: message,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Conversation</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">Free German questions with Shayla</h3>
          </div>
          <Badge variant="primary" className="gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            ChatGPT-style
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedMode(option.value)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                selectedMode === option.value
                  ? 'border-accentBlue/30 bg-accentBlue/10 text-accentBlue'
                  : 'border-border-subtle bg-white/[0.03] text-textSecondary hover:text-textPrimary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {QUICK_PROMPTS.map((prompt) => (
            <Button key={prompt} variant="outline" size="sm" onClick={() => send(prompt)} disabled={loading} className="justify-start text-left">
              {prompt}
            </Button>
          ))}
        </div>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={6}
          placeholder="Ask a free German question, request a correction, or say what you want to practice..."
          className="resize-none rounded-2xl border border-border-subtle bg-white/[0.03] px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted/70 focus:border-accentBlue focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => send(input)} disabled={loading || !input.trim()} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Send
          </Button>
          <Button variant="outline" onClick={() => setInput('')} disabled={loading}>
            Clear
          </Button>
          {error && <span className="text-xs text-accentRed">{error}</span>}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Thread</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">Current conversation</h3>
          </div>
          <Badge variant="neutral">{items.length} turns</Badge>
        </div>

        <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div
              key={`${item.createdAt}-${index}`}
              className={`rounded-2xl border p-3 text-sm leading-6 ${
                item.role === 'assistant'
                  ? 'border-border-subtle bg-white/[0.03] text-textSecondary'
                  : 'ml-6 border-accentBlue/25 bg-accentBlue/10 text-textPrimary'
              }`}
            >
              {item.content}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3 text-xs text-textSecondary">
          Shayla only gets the last part of your context here, so the thread stays light and responsive.
        </div>
      </Card>
    </div>
  );
};
