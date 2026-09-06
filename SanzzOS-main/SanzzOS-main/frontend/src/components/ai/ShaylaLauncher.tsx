import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Trash2 } from 'lucide-react';
import { useAIStore } from '../../app/store/useAIStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { aiService } from '../../services/aiService';
import { ApiError } from '../../services/apiClient';
import { buildAIContext } from '../../utils/aiContextUtils';
import { AIMessage } from '../../types';

const createId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const ShaylaLauncher: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<{ backendOnline: boolean; groqConfigured: boolean; streamingSupported: boolean } | null>(null);
  const messages = useAIStore((s) => s.messages);
  const isThinking = useAIStore((s) => s.isThinking);
  const addMessage = useAIStore((s) => s.addMessage);
  const updateMessage = useAIStore((s) => s.updateMessage);
  const setThinking = useAIStore((s) => s.setThinking);
  const careerState = useCareerStore((s) => s);
  
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  
  const [size, setSize] = useState({ width: 360, height: 520 });
  const [resizing, setResizing] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; width: number; height: number; dir: string } | null>(null);

  const startResize = (dir: string, e: React.MouseEvent) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY, width: size.width, height: size.height, dir };
    setResizing(dir);
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const { x, y, width, height, dir } = dragStartRef.current;
      let newWidth = width;
      let newHeight = height;

      if (dir.includes('n')) {
        const deltaY = e.clientY - y;
        newHeight = Math.max(300, Math.min(height - deltaY, window.innerHeight - 40));
      }
      if (dir.includes('w')) {
        const deltaX = e.clientX - x;
        newWidth = Math.max(280, Math.min(width - deltaX, window.innerWidth - 40));
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setResizing(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  useEffect(() => {
    if (!open) return;
    aiService.getStatus()
      .then(setStatus)
      .catch(() => setStatus({ backendOnline: false, groqConfigured: false, streamingSupported: false }));
  }, [open]);

  const scrollToBottom = (force = false) => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (force || nearBottom) {
        chatContainerRef.current.scrollTop = scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || isThinking) return;
    setInput('');

    const userMsg: AIMessage = { id: createId('launcher-user'), role: 'user', content: prompt, status: 'sent', createdAt: new Date().toISOString() };
    const assistantId = createId('launcher-assistant');
    const outbound = [...useAIStore.getState().messages.filter((message) => message.status !== 'failed' && message.status !== 'streaming'), userMsg];
    addMessage(userMsg);
    addMessage({ id: assistantId, role: 'assistant', content: '', status: 'streaming', prompt, createdAt: new Date().toISOString() });
    setThinking(true);

    // Force scroll to bottom for the new message
    setTimeout(() => scrollToBottom(true), 50);

    try {
      let reply = '';
      await aiService.sendMessageStream(outbound, buildAIContext(careerState), (token) => {
        reply += token;
        updateMessage(assistantId, { content: reply, status: 'streaming' });
      });
      updateMessage(assistantId, { content: reply, status: 'complete' });
    } catch (streamError) {
      if (streamError instanceof ApiError && (streamError.code === 'groq_rate_limited' || streamError.code === 'ai_rate_limited' || streamError.code === 'provider_rate_limited' || streamError.status === 429)) {
        const message = 'Groq is rate-limited right now. Wait 1-2 minutes or switch to a lighter model.';
        updateMessage(assistantId, { content: message, status: 'failed', error: message });
        setThinking(false);
        return;
      }

      try {
        const response = await aiService.sendMessage(outbound, buildAIContext(careerState));
        updateMessage(assistantId, { content: response.reply, status: 'complete' });
      } catch (error: any) {
        const message = error instanceof ApiError && (error.code === 'groq_rate_limited' || error.code === 'ai_rate_limited' || error.code === 'provider_rate_limited')
          ? 'Groq is rate-limited right now. Wait 1-2 minutes or switch to a lighter model.'
          : error instanceof ApiError && error.code === 'ai_payload_too_large'
            ? 'This chat thread is too long. Start a new chat or clear history.'
            : error instanceof ApiError
              ? error.message
              : error?.message || 'Shayla backend is not reachable.';
        updateMessage(assistantId, { content: message, status: 'failed', error: message });
      }
    } finally {
      setThinking(false);
    }
  };

  const statusText = !status
    ? 'Checking'
    : !status.backendOnline
      ? 'Backend offline'
      : !status.groqConfigured
        ? 'Groq missing'
        : isThinking
          ? 'Streaming active'
          : 'Groq ready';

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 select-none">
      {open && (
        <div
          style={{ width: size.width, height: size.height }}
          className="mb-3 flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bgSurface shadow-2xl relative"
        >
          {/* Resize handles */}
          <div
            onMouseDown={(e) => startResize('n', e)}
            className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-accentBlue/40 transition z-50"
            title="Resize height"
          />
          <div
            onMouseDown={(e) => startResize('w', e)}
            className="absolute top-0 bottom-0 left-0 w-1.5 cursor-ew-resize hover:bg-accentBlue/40 transition z-50"
            title="Resize width"
          />
          <div
            onMouseDown={(e) => startResize('nw', e)}
            className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize hover:bg-accentBlue/60 transition z-50"
            title="Resize all directions"
          />

          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-textPrimary">Shayla</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-textMuted">{statusText}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const activeMessages = useAIStore.getState().messages;
                  if (activeMessages.length > 1) {
                    const firstUserMsg = activeMessages.find(m => m.role === 'user');
                    const title = firstUserMsg ? (firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '')) : 'Chat Session';
                    const saveChat = useCareerStore.getState().saveChatSession;
                    if (saveChat) {
                      saveChat({
                        id: `chat-${Date.now()}`,
                        title,
                        messages: activeMessages,
                        savedAt: new Date().toISOString()
                      });
                    }
                  }
                  useAIStore.getState().clearChat();
                }}
                className="rounded-lg p-2 text-textSecondary hover:bg-white/[0.06] hover:text-textPrimary"
                aria-label="Save and clear chat"
                title="Save & Clear"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-textSecondary hover:bg-white/[0.06] hover:text-textPrimary" aria-label="Close Shayla">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3">
            {messages.slice(-8).map((message, idx) => (
              <div key={message.id || idx} className={`mb-2 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-5 ${message.role === 'user' ? 'bg-accentBlue text-white' : 'bg-white/[0.06] text-textSecondary'}`}>
                  {message.content || (message.status === 'streaming' ? 'Typing...' : '')}
                </div>
              </div>
            ))}
          </div>

          <form
            className="flex items-end gap-2 border-t border-border-subtle p-3"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder="Ask from this page..."
              className="flex-1 resize-none rounded-xl border border-border-subtle bg-bgBase px-3 py-2 text-xs text-textPrimary focus:border-accentBlue focus:outline-none"
            />
            <button type="submit" disabled={!input.trim() || isThinking} className="rounded-xl bg-accentBlue p-2.5 text-white disabled:opacity-50" aria-label="Send to Shayla">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="ml-auto flex h-12 w-12 items-center justify-center rounded-full border border-accentPurple/30 bg-accentPurple text-white shadow-glow-purple transition hover:scale-105"
        aria-label="Open Shayla launcher"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  );
};
