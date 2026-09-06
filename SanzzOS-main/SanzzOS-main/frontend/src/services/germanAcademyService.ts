import { request } from './apiClient';
import { useAISettingsStore } from '../app/store/useAISettingsStore';
import { GermanStory } from '../data/germanStories';

export type GermanConversationMode =
  | 'English + German help'
  | 'German only beginner'
  | 'Interview German'
  | 'College German'
  | 'Daily life German'
  | 'Correct my sentence';

export interface GermanConversationResponse {
  reply: string;
  corrections: string[];
  vocabulary: string[];
  nextPrompt: string;
  mode: GermanConversationMode;
  level: string;
  providerUsed?: string;
  modelUsed?: string;
}

const getAISettings = () => {
  const settings = useAISettingsStore.getState();
  return { provider: settings.activeProvider, model: settings.activeModel };
};

export async function askGermanConversation(payload: {
  mode: GermanConversationMode;
  level: string;
  userMessage: string;
  context: Record<string, unknown>;
}): Promise<GermanConversationResponse> {
  try {
    return await request<GermanConversationResponse>('/german/conversation', {
      method: 'POST',
      body: {
        ...payload,
        aiSettings: getAISettings(),
      },
    });
  } catch {
    const simpleReply = payload.mode === 'Correct my sentence'
      ? `Klar. Eine sanfte Korrektur fuer "${payload.userMessage}": Halte den Satz kurz und einfach.`
      : `Gerne. Auf ${payload.level} antworte ich einfach: ${payload.userMessage}.`;
    return {
      reply: simpleReply,
      corrections: ['Keep it short.', 'Use simple verb order.', 'Add English meaning if helpful.'],
      vocabulary: ['Hallo', 'bitte', 'danke'],
      nextPrompt: 'Moechtest du noch eine einfachere Version?',
      mode: payload.mode,
      level: payload.level,
      providerUsed: 'local',
      modelUsed: 'rule-based',
    };
  }
}

export async function explainGermanStory(story: GermanStory): Promise<GermanConversationResponse> {
  return askGermanConversation({
    mode: 'English + German help',
    level: story.level === 'A1' ? 'A1.1' : 'A2.1',
    userMessage: `Explain this German story simply: ${story.german}`,
    context: { storyId: story.id, title: story.title, english: story.english },
  });
}

