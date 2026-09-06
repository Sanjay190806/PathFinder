import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIMessage } from '../../types';

interface AIStoreState {
  messages: AIMessage[];
  isThinking: boolean;
  pendingPrompt: string | null;
  addMessage: (msg: AIMessage) => void;
  updateMessage: (id: string, updates: Partial<AIMessage>) => void;
  setThinking: (isThinking: boolean) => void;
  queuePrompt: (prompt: string) => void;
  consumePendingPrompt: () => string | null;
  clearChat: () => void;
}

const STORAGE_KEY = 'shayla-ai-chat-v1';

const createId = (prefix = 'msg') => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const createIntroMessage = (): AIMessage => ({
  id: 'shayla-intro',
  role: 'assistant',
  content: "Hallo Sanju, ich bin Shayla - your German learning companion and career mentor. Ask me anything: Java DSA, German, resume, projects, roadmap, or placement prep.",
  status: 'complete',
  createdAt: new Date().toISOString()
});

const normalizeMessages = (messages: AIMessage[] | undefined | null): AIMessage[] => {
  const source = Array.isArray(messages) && messages.length > 0 ? messages : [createIntroMessage()];

  return source.map((message, index) => ({
    ...message,
    id: message.id || `${message.role}-${index}-${createId('legacy')}`,
    status: message.status || (message.role === 'assistant' ? (message.content ? 'complete' : 'streaming') : 'sent'),
    createdAt: message.createdAt || new Date().toISOString()
  }));
};

export const useAIStore = create<AIStoreState>()(
  persist(
    (set, get) => ({
      messages: [createIntroMessage()],
      isThinking: false,
      pendingPrompt: null as string | null,
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, normalizeMessages([msg])[0]] })),
      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((message) => (message.id === id ? { ...message, ...updates } : message))
        })),
      setThinking: (isThinking) => set({ isThinking }),
      queuePrompt: (prompt) => set({ pendingPrompt: prompt }),
      consumePendingPrompt: (): string | null => {
        const prompt = get().pendingPrompt;
        set({ pendingPrompt: null });
        return prompt;
      },
      clearChat: () => set({ messages: [createIntroMessage()], isThinking: false })
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ messages: state.messages }),
      version: 1,
      merge: (persisted, current) => {
        const saved = persisted as Partial<AIStoreState> | undefined;
        return {
          ...current,
          ...saved,
          pendingPrompt: null,
          isThinking: false,
          messages: normalizeMessages(saved?.messages)
        };
      }
    }
  )
);
