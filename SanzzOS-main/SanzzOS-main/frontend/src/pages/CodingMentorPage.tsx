import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChatMessage } from '../components/ai/ChatMessage';
import { aiService } from '../services/aiService';
import { buildAIContext } from '../utils/aiContextUtils';
import { useCareerStore } from '../app/store/useCareerStore';
import { useAIStore } from '../app/store/useAIStore';
import { useAISettingsStore } from '../app/store/useAISettingsStore';
import { AIMessage } from '../types';
import { ApiError } from '../services/apiClient';
import { AlertTriangle, Bot, Code2, Loader2, Sparkles } from 'lucide-react';

const quickActions = [
  'Explain this Java DSA idea in simple terms.',
  'Find bugs in my code and suggest fixes.',
  'Convert this brute-force approach to an optimal one.',
  'Give me a mock coding interview question.',
];

function createId(prefix = 'msg') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const CodingMentorPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const settings = useAISettingsStore((s) => s);
  const messages = useAIStore((s) => s.messages);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const sendLockRef = useRef(false);

  const [input, setInput] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'Java' | 'JavaScript'>('Java');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicHint = useMemo(() => buildAIContext(careerState).currentTopic, [careerState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || loading || sendLockRef.current) return;

    setLoading(true);
    sendLockRef.current = true;
    setError(null);

    const userMessage: AIMessage = {
      id: createId('user'),
      role: 'user',
      content: prompt,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    const assistantMessageId = createId('assistant');
    const outbound = [
      ...messages.filter((message) => message.status !== 'failed' && message.status !== 'streaming').slice(-8),
      userMessage,
    ];

    useAIStore.getState().addMessage(userMessage);
    useAIStore.getState().addMessage({
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      prompt,
      createdAt: new Date().toISOString(),
    });
    useAIStore.getState().setThinking(true);

    const context = {
      ...buildAIContext(careerState),
      codingFocus: {
        language,
        currentTopic: topicHint,
        code: code.trim() ? code.slice(0, 1800) : 'No code attached.',
      },
    };

    try {
      let reply = '';
      await aiService.sendMessageStream(outbound, context, (token) => {
        reply += token;
        useAIStore.getState().updateMessage(assistantMessageId, { content: reply, status: 'streaming' });
      });

      useAIStore.getState().updateMessage(assistantMessageId, { content: reply, status: 'complete' });
    } catch (streamError) {
      const rateLimited = streamError instanceof ApiError && (streamError.status === 429 || streamError.code === 'groq_rate_limited' || streamError.code === 'provider_rate_limited');
      const message = rateLimited
        ? 'Groq is rate-limited right now. Wait 1-2 minutes or switch to a lighter model.'
        : streamError instanceof ApiError && streamError.code === 'ai_payload_too_large'
          ? 'This chat thread is too long. Start a new chat or clear history.'
          : 'Coding mentor request failed. Try again with a smaller prompt.';

      useAIStore.getState().updateMessage(assistantMessageId, { content: message, status: 'failed', error: message });
      setError(message);
      try {
        const fallback = await aiService.sendMessage(outbound, context);
        useAIStore.getState().updateMessage(assistantMessageId, { content: fallback.reply, status: 'complete' });
        setError(null);
      } catch {
        // keep the visible error, but leave the input usable
      }
    } finally {
      setLoading(false);
      sendLockRef.current = false;
      useAIStore.getState().setThinking(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-6 pb-10 fade-in">
      <SectionHeader
        title="Coding Mentor"
        subtitle="Java-first help for DSA, code review, debugging, and interview practice."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="gap-1"><Bot className="h-3.5 w-3.5" />Java only</Badge>
            <Badge variant="neutral">{settings.activeProvider.toUpperCase()}</Badge>
            <Badge variant="warning">{topicHint}</Badge>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Mentor chat</p>
              <h3 className="mt-1 text-lg font-semibold text-textPrimary">Ask Shayla about Java or DSA</h3>
            </div>
            <Badge variant="success" className="gap-1"><Sparkles className="h-3.5 w-3.5" />Streaming ready</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickActions.map((prompt) => (
              <Button key={prompt} variant="outline" size="sm" onClick={() => handleQuickAction(prompt)} disabled={loading}>
                {prompt}
              </Button>
            ))}
          </div>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={5}
            placeholder="Ask a free coding question, request a code review, or paste a problem statement..."
            className="resize-none rounded-2xl border border-border-subtle bg-white/[0.03] px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted/70 focus:border-accentBlue focus:outline-none"
          />

          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            rows={8}
            placeholder="Optional Java code or pseudocode here..."
            className="min-h-40 resize-y rounded-2xl border border-border-subtle bg-[#07111f] px-4 py-3 font-mono text-sm text-textPrimary placeholder:text-textMuted/70 focus:border-accentBlue focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => send(input)} disabled={loading || !input.trim()} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code2 className="h-4 w-4" />}
              Send
            </Button>
            <Button variant="outline" onClick={() => { setInput(''); setCode(''); }} disabled={loading}>
              Clear
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant={language === 'Java' ? 'primary' : 'outline'} onClick={() => setLanguage('Java')}>
                Java
              </Button>
              <Button size="sm" variant={language === 'JavaScript' ? 'primary' : 'outline'} onClick={() => setLanguage('JavaScript')}>
                JavaScript
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Conversation</p>
              <h3 className="mt-1 text-lg font-semibold text-textPrimary">Live mentor thread</h3>
            </div>
            <Badge variant="neutral">{messages.length} messages</Badge>
          </div>
          <div className="flex max-h-[620px] flex-col overflow-y-auto pr-1">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onRetry={(msg) => send(msg.prompt || msg.content)}
              />
            ))}
            <div ref={chatEndRef} />
          </div>
        </Card>
      </div>
    </div>
  );
};
