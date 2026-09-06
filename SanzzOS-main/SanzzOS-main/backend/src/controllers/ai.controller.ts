import { Request, Response } from 'express';
import { env } from '../config/env.js';
import { AIProviderError, AIMessage } from '../ai/interfaces/AIProvider.js';
import { providerRouter } from '../ai/router/providerRouter.js';
import { getShaylaSystemPrompt } from '../prompts/shayla.prompt.js';
import { aiChatRequestSchema } from '../validators/ai.schema.js';
import { MemoryStore } from '../memory/MemoryStore.js';
import { MemoryRetriever } from '../memory/MemoryRetriever.js';
import { PromptComposer } from '../memory/PromptComposer.js';
import { MemoryManager } from '../memory/MemoryManager.js';

function groqConfigured(): boolean {
  return Boolean(env.GROQ_API_KEY?.trim());
}

export async function handleAIStatus(_req: Request, res: Response): Promise<void> {
  const providerHealth = await providerRouter.health();
  const readyProvider = providerHealth.find((provider) => provider.status === 'ready') || providerHealth[0];
  res.status(200).json({
    backendOnline: true,
    groqConfigured: groqConfigured(),
    model: env.AI_MODEL || readyProvider?.defaultModel || 'openai/gpt-oss-20b',
    streamingSupported: Boolean(readyProvider?.streamingSupported),
    activeProvider: readyProvider?.provider || 'groq',
    providers: providerHealth
  });
}

export async function handleAITest(_req: Request, res: Response): Promise<void> {
  try {
    const result = await providerRouter.chat({
      messages: [
      { role: 'user', content: 'Say only OK.' }
      ],
      maxTokens: 20,
      temperature: 0
    });

    res.status(200).json({
      ok: true,
      message: 'AI provider router test successful.',
      model: result.model,
      provider: result.provider,
      metadata: result.metadata
    });
  } catch (error: any) {
    console.error('AI test error:', error);
    const status = error instanceof AIProviderError ? error.status : 500;
    const code = error instanceof AIProviderError ? error.code : 'ai_router_test_failed';
    res.status(status).json({
      ok: false,
      message: error?.message || 'AI provider router test failed.',
      code
    });
  }
}

export async function handleAIProviderHealth(_req: Request, res: Response): Promise<void> {
  const providers = await providerRouter.health();
  res.status(200).json({ providers });
}

export async function handleAIModels(_req: Request, res: Response): Promise<void> {
  const models = await providerRouter.listModels();
  res.status(200).json({ models });
}

async function searchWeb(query: string): Promise<string> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) return '';
    const html = await response.text();
    const matches = Array.from(html.matchAll(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g));
    const snippets = matches.map(m => {
      return m[1].replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim();
    });
    return snippets.slice(0, 3).join('\n\n');
  } catch (err) {
    console.error('Web search failed:', err);
    return '';
  }
}

export async function handleAIChat(req: Request, res: Response): Promise<void> {
  try {
    const parsed = aiChatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'This chat thread is too long. Start a new chat or clear history.',
        code: 'ai_payload_too_large'
      });
      return;
    }

    const { messages, context, provider, model, temperature, maxTokens, systemPrompt: clientSystemPrompt, language } = parsed.data;

    // Track events based on context updates
    if (context) {
      if (context.currentGermanLesson?.completed) {
        MemoryManager.trackEvent('german_lesson_completed', context.currentGermanLesson);
      }
      if (context.leetcodeSolved && context.leetcodeSolved % 10 === 0) {
        MemoryManager.trackEvent('leetcode_milestone', { solvedCount: context.leetcodeSolved });
      }
      if (context.currentStreak && context.currentStreak > 0) {
        MemoryManager.trackEvent('streak_milestone', { streak: context.currentStreak, longestStreak: context.longestStreak || context.currentStreak });
      }
      if (context.mood && context.energy) {
        MemoryManager.trackEvent('mood_logged', { mood: context.mood, energy: context.energy, distractions: context.distractions, note: context.moodNote });
      }
      if (context.energy <= 2 && context.distractions >= 4) {
        MemoryManager.trackEvent('burnout_detected', { energy: context.energy, distractions: context.distractions });
      }
    }

    // Web Search Trigger check
    let searchContext = '';
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      const content = lastUserMessage.content.toLowerCase();
      if (content.includes('search') || content.includes('latest') || content.includes('recent') || 
          content.includes('current') || content.includes('news') || content.includes('today') ||
          content.includes('weather') || content.includes('who is') || content.includes('what is')) {
        const searchResults = await searchWeb(lastUserMessage.content);
        if (searchResults) {
          searchContext = `\n\n[Recent Web Search Results for "${lastUserMessage.content}"]:\n${searchResults}\n(Use the search results above to answer the user's query with recent facts.)\n`;
        }
      }
    }

    const chosenLanguage = language || context?.language || context?.selectedLanguage || 'English';
    const effectiveContext = { ...(context || {}), language: chosenLanguage };
    const baseSystemPrompt = (clientSystemPrompt && !clientSystemPrompt.includes("German-English bestie"))
      ? clientSystemPrompt
      : getShaylaSystemPrompt(effectiveContext);
    const langMandate = `\n\n[STRICT LANGUAGE DIRECTIVE: The user has selected "${chosenLanguage}". You must write your entire response ONLY in "${chosenLanguage}". Do not output any other language.]\n`;
    const systemPrompt = baseSystemPrompt + searchContext + langMandate;
    const { fullPrompt } = PromptComposer.composeSystemPrompt(systemPrompt, effectiveContext);

    const fullMessages: AIMessage[] = [
      { role: 'system', content: fullPrompt },
      ...messages,
      { role: 'system', content: `[STRICT OUTPUT LANGUAGE MANDATE: You MUST formulate your entire response in "${chosenLanguage}". Every single sentence, greeting, explanation, and next step MUST be in "${chosenLanguage}". Do NOT reply in English or German unless the chosen language is English or German.]` }
    ];

    const result = await providerRouter.chat({
      messages: fullMessages,
      preferredProvider: provider as any,
      model,
      temperature,
      maxTokens
    });
    const replyText = result.reply || (result as any).content || '';
    res.status(200).json({
      ...result,
      reply: replyText,
      content: replyText,
      metadata: {
        ...result.metadata,
        providerUsed: result.metadata.provider,
        modelUsed: result.metadata.model,
        fallbackUsed: result.metadata.fallbackUsed,
        latencyMs: result.metadata.latencyMs
      }
    });
  } catch (error: any) {
    console.error('AI controller error:', error);
    const status = error instanceof AIProviderError ? error.status : 500;
    const code = error instanceof AIProviderError ? error.code : 'ai_request_failed';
    res.status(status).json({
      error: error?.message || 'An unknown error occurred during AI provider routing.',
      code
    });
  }
}

export async function handleAIChatStream(req: Request, res: Response): Promise<void> {
  try {
    const parsed = aiChatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'This chat thread is too long. Start a new chat or clear history.',
        code: 'ai_payload_too_large'
      });
      return;
    }

    const { messages, context, provider, model, temperature, maxTokens, systemPrompt: clientSystemPrompt, language } = parsed.data;

    // Track events based on context updates
    if (context) {
      if (context.currentGermanLesson?.completed) {
        MemoryManager.trackEvent('german_lesson_completed', context.currentGermanLesson);
      }
      if (context.leetcodeSolved && context.leetcodeSolved % 10 === 0) {
        MemoryManager.trackEvent('leetcode_milestone', { solvedCount: context.leetcodeSolved });
      }
      if (context.currentStreak && context.currentStreak > 0) {
        MemoryManager.trackEvent('streak_milestone', { streak: context.currentStreak, longestStreak: context.longestStreak || context.currentStreak });
      }
      if (context.mood && context.energy) {
        MemoryManager.trackEvent('mood_logged', { mood: context.mood, energy: context.energy, distractions: context.distractions, note: context.moodNote });
      }
      if (context.energy <= 2 && context.distractions >= 4) {
        MemoryManager.trackEvent('burnout_detected', { energy: context.energy, distractions: context.distractions });
      }
    }

    // Web Search Trigger check
    let searchContext = '';
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      const content = lastUserMessage.content.toLowerCase();
      if (content.includes('search') || content.includes('latest') || content.includes('recent') || 
          content.includes('current') || content.includes('news') || content.includes('today') ||
          content.includes('weather') || content.includes('who is') || content.includes('what is')) {
        const searchResults = await searchWeb(lastUserMessage.content);
        if (searchResults) {
          searchContext = `\n\n[Recent Web Search Results for "${lastUserMessage.content}"]:\n${searchResults}\n(Use the search results above to answer the user's query with recent facts.)\n`;
        }
      }
    }

    const chosenLanguage = language || context?.language || context?.selectedLanguage || 'English';
    const effectiveContext = { ...(context || {}), language: chosenLanguage };
    const baseSystemPrompt = (clientSystemPrompt && !clientSystemPrompt.includes("German-English bestie"))
      ? clientSystemPrompt
      : getShaylaSystemPrompt(effectiveContext);
    const langMandate = `\n\n[STRICT LANGUAGE DIRECTIVE: The user has selected "${chosenLanguage}". You must write your entire response ONLY in "${chosenLanguage}". Do not output any other language.]\n`;
    const systemPrompt = baseSystemPrompt + searchContext + langMandate;
    const { fullPrompt } = PromptComposer.composeSystemPrompt(systemPrompt, effectiveContext);

    const fullMessages: AIMessage[] = [
      { role: 'system', content: fullPrompt },
      ...messages,
      { role: 'system', content: `[STRICT OUTPUT LANGUAGE MANDATE: You MUST formulate your entire response in "${chosenLanguage}". Every single sentence, greeting, explanation, and next step MUST be in "${chosenLanguage}". Do NOT reply in English or German unless the chosen language is English or German.]` }
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const result = await providerRouter.stream({
      messages: fullMessages,
      preferredProvider: provider as any,
      model,
      temperature,
      maxTokens
    }, (token) => {
      res.write(`event: token\ndata: ${JSON.stringify({ token })}\n\n`);
    });

    res.write(`event: done\ndata: ${JSON.stringify({
      done: true,
      metadata: {
        ...result.metadata,
        providerUsed: result.metadata.provider,
        modelUsed: result.metadata.model,
        fallbackUsed: result.metadata.fallbackUsed,
        latencyMs: result.metadata.latencyMs
      }
    })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('AI stream controller error:', error);
    const status = error instanceof AIProviderError ? error.status : 500;
    const code = error instanceof AIProviderError ? error.code : 'ai_stream_failed';

    if (!res.headersSent) {
      res.status(status).json({
        error: error?.message || 'Completions stream interrupted.',
        code
      });
      return;
    }

    res.write(`event: error\ndata: ${JSON.stringify({ message: error?.message || 'Completions stream interrupted.', code })}\n\n`);
    res.end();
  }
}

// Memory Controllers
export async function handleGetMemory(_req: Request, res: Response): Promise<void> {
  try {
    const memories = MemoryStore.getAll();
    res.status(200).json({
      success: true,
      memories,
      lastPromptSummary: MemoryStore.lastPromptSummary || 'No prompt composed yet.'
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function handleAddMemory(req: Request, res: Response): Promise<void> {
  try {
    const { category, content } = req.body;
    if (!category || !content) {
      res.status(400).json({ success: false, error: 'Category and content are required.' });
      return;
    }
    const item = MemoryStore.add({ category, content });
    res.status(201).json({ success: true, memory: item });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function handleUpdateMemory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { pinned, ignored, content } = req.body;
    const updated = MemoryStore.update(id, { pinned, ignored, content });
    if (!updated) {
      res.status(404).json({ success: false, error: 'Memory not found.' });
      return;
    }
    res.status(200).json({ success: true, memory: updated });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function handleDeleteMemory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const success = MemoryStore.delete(id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Memory not found.' });
      return;
    }
    res.status(200).json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function handleResetMemory(_req: Request, res: Response): Promise<void> {
  try {
    MemoryStore.clear();
    res.status(200).json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function handleAICompare(req: Request, res: Response): Promise<void> {
  try {
    const { prompt, models, temperature, maxTokens } = req.body;
    if (!prompt || !Array.isArray(models)) {
      res.status(400).json({ error: 'Prompt and models list are required.' });
      return;
    }

    const temp = typeof temperature === 'number' ? temperature : 0.7;
    const tokens = typeof maxTokens === 'number' ? maxTokens : 800;

    const promises = models.map(async (m: { provider: string; model: string }) => {
      const startTime = Date.now();
      try {
        const responsePromise = providerRouter.chat({
          messages: [{ role: 'user', content: prompt }],
          preferredProvider: m.provider as any,
          model: m.model,
          temperature: temp,
          maxTokens: tokens
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout after 15s')), 15000)
        );

        const result = await Promise.race([responsePromise, timeoutPromise]);
        const latencyMs = Date.now() - startTime;
        
        const tokenEstimate = Math.round((result.reply || '').length / 4);
        
        let ratePerMillion = 0.15;
        if (m.model.includes('gpt-oss-120b') || m.model.includes('gpt-4')) {
          ratePerMillion = 2.0;
        } else if (m.model.includes('gpt-oss-20b') || m.model.includes('claude')) {
          ratePerMillion = 0.8;
        } else if (m.provider === 'ollama' || m.provider === 'lmstudio') {
          ratePerMillion = 0.0;
        }
        const costEstimate = (tokenEstimate / 1000000) * ratePerMillion;

        return {
          provider: m.provider,
          model: m.model,
          content: result.reply,
          latencyMs,
          tokenEstimate,
          costEstimate,
          error: null
        };
      } catch (err: any) {
        return {
          provider: m.provider,
          model: m.model,
          content: '',
          latencyMs: Date.now() - startTime,
          tokenEstimate: 0,
          costEstimate: 0,
          error: err?.message || 'Failed to get response'
        };
      }
    });

    const results = await Promise.all(promises);
    res.status(200).json({ results });
  } catch (error: any) {
    console.error('AI compare controller error:', error);
    res.status(500).json({ error: error?.message || 'Failed to process comparison.' });
  }
}

export async function handleAIBenchmark(req: Request, res: Response): Promise<void> {
  try {
    const { provider, model, categories } = req.body;
    if (!provider || !model || !Array.isArray(categories)) {
      res.status(400).json({ error: 'Provider, model, and categories list are required.' });
      return;
    }

    const categoryPrompts: Record<string, string> = {
      'Java DSA explanation': 'Explain Two Sum using Java and start with Pattern Name.',
      'German A1 tutoring': 'Teach 5 German A1 college words.',
      'Resume review': 'Review this resume summary: Sanjay K, ECE college student, EMD Engineering, Java developer.',
      'Project explanation': 'Explain CareSync AI project architecture simply.',
      'Daily planning': 'Create today\'s placement plan.',
      'Motivation/accountability': 'Give Sanju honest motivation to study Java DSA.',
      'CS Core explanation': 'Explain OS deadlock simply.',
      'SQL query help': 'Write a SQL query to find second highest salary.'
    };

    const runPromises = categories.map(async (category: string) => {
      const prompt = categoryPrompts[category] || `Explain this topic: ${category}`;
      const startTime = Date.now();
      try {
        const response = await providerRouter.chat({
          messages: [{ role: 'user', content: prompt }],
          preferredProvider: provider,
          model,
          temperature: 0.2,
          maxTokens: 800
        });
        const latencyMs = Date.now() - startTime;
        const reply = response.reply || '';
        const tokenEstimate = Math.round(reply.length / 4);

        let ratePerMillion = 0.15;
        if (model.includes('gpt-oss-120b') || model.includes('gpt-4')) {
          ratePerMillion = 2.0;
        } else if (model.includes('gpt-oss-20b') || model.includes('claude')) {
          ratePerMillion = 0.8;
        } else if (provider === 'ollama' || provider === 'lmstudio') {
          ratePerMillion = 0.0;
        }
        const costEstimate = (tokenEstimate / 1000000) * ratePerMillion;

        let formatAdherenceScore = 0;
        let dsaJavaRuleScore = 0;
        let behaviorScore = 0;

        if (reply.length > 100 && (reply.includes('#') || reply.includes('-') || reply.includes('1.'))) {
          formatAdherenceScore = 20;
        }

        if (category === 'Java DSA explanation') {
          if (reply.toLowerCase().includes('pattern name') && reply.toLowerCase().includes('java')) {
            dsaJavaRuleScore = 20;
          }
        } else if (category === 'German A1 tutoring') {
          if (reply.toLowerCase().includes('german') || reply.toLowerCase().includes('deutsch')) {
            dsaJavaRuleScore = 20;
          }
        } else {
          if (reply.length > 50) {
            dsaJavaRuleScore = 20;
          }
        }

        if (latencyMs < 5000) {
          behaviorScore = 20;
        }

        const totalScore = 20 + formatAdherenceScore + dsaJavaRuleScore + behaviorScore;

        return {
          category,
          success: true,
          content: reply,
          latencyMs,
          tokenEstimate,
          costEstimate,
          scores: {
            received: 20,
            format: formatAdherenceScore,
            ruleAdherence: dsaJavaRuleScore,
            latency: behaviorScore,
            total: totalScore
          },
          error: null
        };
      } catch (err: any) {
        return {
          category,
          success: false,
          content: '',
          latencyMs: Date.now() - startTime,
          tokenEstimate: 0,
          costEstimate: 0,
          scores: {
            received: 0,
            format: 0,
            ruleAdherence: 0,
            latency: 0,
            total: 0
          },
          error: err?.message || 'Failed to complete benchmark'
        };
      }
    });

    const results = await Promise.all(runPromises);
    res.status(200).json({ results });
  } catch (error: any) {
    console.error('Benchmark controller error:', error);
    res.status(500).json({ error: error?.message || 'Failed to execute benchmarks.' });
  }
}
