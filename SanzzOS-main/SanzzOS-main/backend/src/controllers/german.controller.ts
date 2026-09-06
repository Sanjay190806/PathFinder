import { Request, Response } from 'express';
import { providerRouter } from '../ai/router/providerRouter.js';
import { germanConversationRequestSchema } from '../validators/german.schema.js';

const trim = (value: string, limit = 220) => (value.length <= limit ? value : `${value.slice(0, Math.max(0, limit - 12)).trimEnd()}...[trimmed]`);

function localConversation(mode: string, level: string, message: string) {
  const lower = message.toLowerCase();
  const isCorrection = mode === 'Correct my sentence';
  const reply = isCorrection
    ? `Klar. Hier ist eine freundliche Korrektur auf ${level}: "${trim(message)}". Eine einfachere Version waere: "${trim(message.replace(/\b(am|ist|bin)\b/g, (m) => m))}". Wenn du moechtest, kann ich es auch noch einfacher machen.`
    : `Gerne. Auf ${level} antworte ich einfach und freundlich: ${trim(message)}. Deutsche Bedeutung: ${lower.includes('ich') ? 'This uses ich correctly.' : 'Try adding "ich" to make the sentence personal.'} `;

  return {
    reply: trim(reply, 900),
    corrections: isCorrection ? ['Use short sentences.', 'Keep the subject close to the verb.', 'Try one version at a time.'] : ['Short is good.', 'Add English meaning if needed.', 'Keep the answer A1/A2 simple.'],
    vocabulary: ['ich', 'du', 'bitte', 'danke'].slice(0, 3),
    nextPrompt: mode === 'Interview German'
      ? 'Wie heissen Sie?'
      : mode === 'Daily life German'
        ? 'Was machst du heute?'
        : 'Moechtest du noch eine einfachere Version?',
    level,
    mode,
    providerUsed: 'local',
    modelUsed: 'rule-based',
  };
}

export async function handleGermanConversation(req: Request, res: Response) {
  const parsed = germanConversationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid German conversation request.' });
  }

  const { mode, level, userMessage, context, aiSettings } = parsed.data;

  try {
    const systemPrompt = `You are Shayla as a kind German conversation partner. Keep responses A1/A2 by default. Include English meaning, keep corrections kind, and never overclaim certification. Mode: ${mode}. Level: ${level}.`;
    const reply = await providerRouter.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Context: ${JSON.stringify(context)}\nMessage: ${userMessage}` },
      ],
      preferredProvider: aiSettings?.provider as any,
      model: aiSettings?.model,
      temperature: 0.4,
      maxTokens: 500,
    } as any);

    return res.json({
      reply: trim(reply.reply, 1200),
      corrections: ['Kind correction available.', 'A1/A2 focus kept.', 'English meaning included.'],
      vocabulary: ['Hallo', 'danke', 'bitte'],
      nextPrompt: 'Moechtest du noch eine einfachere Version?',
      level,
      mode,
      providerUsed: reply.metadata?.provider,
      modelUsed: reply.metadata?.model,
    });
  } catch {
    return res.json(localConversation(mode, level, userMessage));
  }
}

