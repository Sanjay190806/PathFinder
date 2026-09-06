export type AIMessageStatus = 'sending' | 'sent' | 'failed' | 'streaming' | 'complete';

export interface AIMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status?: AIMessageStatus;
  error?: string;
  prompt?: string;
  createdAt?: string;
}

export interface SavedChatSession {
  id: string;
  title: string;
  messages: AIMessage[];
  savedAt: string;
}

