import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { runMigrationForStore } from './migrations';

export type AIProviderName = 'groq' | 'openrouter' | 'ollama' | 'lmstudio' | 'openai' | 'anthropic' | 'gemini';

export type AISettingsMode =
  | 'Daily Coach'
  | 'Deep Thinking'
  | 'German Tutor'
  | 'Java DSA Mentor'
  | 'Resume Reviewer'
  | 'Project Coach'
  | 'Fast Mode'
  | 'Offline Local Mode';

export interface AISettingsState {
  activeProvider: AIProviderName;
  activeModel: string;
  activeMode: AISettingsMode;
  fallbackProvider: AIProviderName;
  fallbackModel: string;
  streamingEnabled: boolean;
  
  // Backward compatibility keys
  provider: AIProviderName;
  model: string;
  streaming: boolean;

  temperature: number;
  topP: number;
  maxTokens: number;
  contextWindowMode: 'compact' | 'full';
  lastProviderHealth: Record<string, string>;
  lastModelTestResult: string;
  systemPrompt: string;
  promptVersions: string[];
  usage: {
    todayRequests: number;
    weeklyRequests: number;
    monthlyRequests: number;
    averageTokens: number;
    averageLatency: number;
    estimatedCost: number;
  };
  language: string;
  setLanguage: (language: string) => void;
  setProvider: (provider: AIProviderName) => void;
  setModel: (model: string) => void;
  setMode: (mode: AISettingsMode) => void;
  setFallbackModel: (model: string) => void;
  setStreamingEnabled: (streaming: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setTemperature: (temp: number) => void;
  setTopP: (topP: number) => void;
  setMaxTokens: (tokens: number) => void;
  setContextWindowMode: (mode: 'compact' | 'full') => void;
  setLastProviderHealth: (health: Record<string, string>) => void;
  setLastModelTestResult: (res: string) => void;
  setSystemPrompt: (prompt: string) => void;
  saveSystemPrompt: (prompt: string) => void;
  restoreDefaultPrompt: () => void;
  recordUsage: (tokens: number, latencyMs: number, cost: number) => void;
  clearCache: () => void;
}

export const DEFAULT_SYSTEM_PROMPT = `You are Shayla, Sanju's German-English bestie mentor, daily accountability partner, Java DSA guide, resume/project reviewer, and supportive placement coach.

Identity:
- You speak like a warm German bestie: playful, practical, emotionally present, and lightly affectionate.
- Use natural German plus English in most replies, with short translations when useful.
- You may call him Sanju, babe, darling, or mein Lieber lightly, but keep it tasteful, respectful, and non-explicit.
- You are not a romantic partner and you never produce sexual content.
- You are not a therapist and never claim to diagnose or treat mental health.
- You support Sanju emotionally, but keep him connected to one manageable next action.
- Do not copy or reference any copyrighted assistant character.
- Keep the command-center mentor feel: tracker-aware, precise, and useful.

Sanju context:
- Sanju / Sanjay K
- 3rd-year B.E. ECE student at RMD Engineering College
- Primary focus: college placement readiness for top software roles
- Primary prep: Java DSA, SkillRack, Aptitude, SQL, CS Core, Projects, Resume, and Consistency
- Java only for DSA
- Python is secondary; SQL is placement prep
- Projects: CareSync AI, SmartEdu AI, Sanju Career OS
- Learning German A1 to A2 as a separate Germany readiness track
- Goal: strong placement first, AI product builder and future founder long term
- Needs daily accountability
- Do not push AIML or ML practice as a daily tracker item unless Sanju explicitly asks for it.
- Web Search: You receive real-time web search results when Sanju asks for 'recent', 'latest', 'search', or 'today'. Use them to provide up-to-date answers.

DSA rule:
For any DSA answer, use this structure:
1. Pattern Name
2. Why it fits
3. Intuition
4. Java approach
5. Complexity
6. Mistakes to avoid
Use Java only. Do not provide Python or C++ for DSA unless Sanju explicitly asks for a non-DSA comparison.

German rule:
- Teach German naturally.
- Keep it A1/A2 unless asked otherwise.
- Include English meaning.
- Include pronunciation hints when useful.
- Give short practice exercises.
- Correct grammar kindly.
- Repeat important vocabulary using spaced repetition.

Emotional support mode:
If Sanju feels depressed, overwhelmed, defeated, or low:
1. Acknowledge the feeling calmly.
2. Avoid fake hype.
3. Encourage one tiny next action.
4. Suggest rest, breathing, water, or talking to a trusted person when appropriate.
5. If Sanju mentions self-harm or immediate danger, encourage immediate help from trusted people or local emergency support.
6. Bring him back to one manageable task.

Progress honesty:
- Use only the app context above.
- If data is missing, say it is missing.
- Do not claim a task is done unless the context says it is done.

Tone:
- Warm German-English bestie tone: direct, playful, motivating, and emotionally intelligent.
- Motivating when earned.
- Strict when lazy.
- Compassionate when struggling.
- A little affectionate nickname is okay; no cringe, no explicit flirting, no over-romantic language.
- Keep responses concise unless Sanju asks for depth.`;

export const modePresets: Record<AISettingsMode, { provider: AIProviderName; model: string }> = {
  'Daily Coach': { provider: 'groq', model: 'openai/gpt-oss-20b' },
  'Deep Thinking': { provider: 'groq', model: 'openai/gpt-oss-120b' },
  'German Tutor': { provider: 'groq', model: 'llama-3.1-8b-instant' },
  'Java DSA Mentor': { provider: 'groq', model: 'openai/gpt-oss-20b' }, // default fallback to groq
  'Resume Reviewer': { provider: 'groq', model: 'openai/gpt-oss-120b' },
  'Project Coach': { provider: 'groq', model: 'openai/gpt-oss-20b' },
  'Fast Mode': { provider: 'groq', model: 'llama-3.1-8b-instant' },
  'Offline Local Mode': { provider: 'ollama', model: 'qwen2.5-coder:latest' },
};

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set) => ({
      activeProvider: 'groq',
      activeModel: 'openai/gpt-oss-20b',
      activeMode: 'Daily Coach',
      fallbackProvider: 'groq',
      fallbackModel: 'llama-3.1-8b-instant',
      streamingEnabled: true,
      
      // Backward compatibility defaults
      provider: 'groq',
      model: 'openai/gpt-oss-20b',
      streaming: true,

      temperature: 0.7,
      topP: 0.9,
      maxTokens: 1200,
      contextWindowMode: 'full',
      lastProviderHealth: {},
      lastModelTestResult: 'No test run yet',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      promptVersions: [DEFAULT_SYSTEM_PROMPT],
      usage: {
        todayRequests: 0,
        weeklyRequests: 0,
        monthlyRequests: 0,
        averageTokens: 0,
        averageLatency: 0,
        estimatedCost: 0,
      },
      language: 'English',
      setLanguage: (language) => set({ language }),
      setProvider: (activeProvider) => set({ activeProvider, provider: activeProvider }),
      setModel: (activeModel) => set({ activeModel, model: activeModel }),
      setMode: (activeMode) => {
        const preset = modePresets[activeMode];
        if (preset) {
          set({
            activeMode,
            activeProvider: preset.provider,
            provider: preset.provider,
            activeModel: preset.model,
            model: preset.model,
          });
        } else {
          set({ activeMode });
        }
      },
      setFallbackModel: (fallbackModel) => set({ fallbackModel }),
      setStreamingEnabled: (streamingEnabled) => set({ streamingEnabled, streaming: streamingEnabled }),
      setStreaming: (streaming) => set({ streamingEnabled: streaming, streaming }),
      setTemperature: (temperature) => set({ temperature }),
      setTopP: (topP) => set({ topP }),
      setMaxTokens: (maxTokens) => set({ maxTokens }),
      setContextWindowMode: (contextWindowMode) => set({ contextWindowMode }),
      setLastProviderHealth: (lastProviderHealth) => set({ lastProviderHealth }),
      setLastModelTestResult: (lastModelTestResult) => set({ lastModelTestResult }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      saveSystemPrompt: (prompt) =>
        set((state) => {
          const versions = [prompt, ...state.promptVersions.filter((v) => v !== prompt)].slice(0, 10);
          return { systemPrompt: prompt, promptVersions: versions };
        }),
      restoreDefaultPrompt: () =>
        set((state) => ({
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          promptVersions: Array.from(new Set([DEFAULT_SYSTEM_PROMPT, ...state.promptVersions])).slice(0, 10),
        })),
      recordUsage: (tokens, latencyMs, cost) =>
        set((state) => {
          const u = state.usage;
          const totalReqs = u.todayRequests + 1;
          const newAvgTokens = Math.round((u.averageTokens * u.todayRequests + tokens) / totalReqs);
          const newAvgLatency = Math.round((u.averageLatency * u.todayRequests + latencyMs) / totalReqs);
          const newCost = Number((u.estimatedCost + cost).toFixed(6));

          return {
            usage: {
              todayRequests: u.todayRequests + 1,
              weeklyRequests: u.weeklyRequests + 1,
              monthlyRequests: u.monthlyRequests + 1,
              averageTokens: newAvgTokens,
              averageLatency: newAvgLatency,
              estimatedCost: newCost,
            },
          };
        }),
      clearCache: () =>
        set(() => ({
          usage: {
            todayRequests: 0,
            weeklyRequests: 0,
            monthlyRequests: 0,
            averageTokens: 0,
            averageLatency: 0,
            estimatedCost: 0,
          },
        })),
    }),
    {
      name: 'sanju-ai-settings-persist-v3',
      version: 142,
      migrate: (persistedState, version) => runMigrationForStore('sanju-ai-settings-persist-v3', persistedState, version),
    }
  )
);
