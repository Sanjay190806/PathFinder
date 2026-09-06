import { MemoryItem } from './MemoryStore.js';
import { MemorySummarizer } from './MemorySummarizer.js';
import { MemoryRetriever } from './MemoryRetriever.js';
import { MemoryRanker } from './MemoryRanker.js';

export class PromptComposer {
  static composeSystemPrompt(basePrompt: string, ctx: any): { fullPrompt: string; summaryBlock: string } {
    // 1. Generate state summary
    const stateSummary = MemorySummarizer.summarizeState(ctx);

    // 2. Retrieve and rank memories
    const activeMemories = MemoryRetriever.getActiveMemories();
    const rankedMemories = MemoryRanker.rankAndLimit(activeMemories, 12);

    // 3. Compile memory lines
    const memoryLines = rankedMemories.map((m) => {
      const pinTag = m.pinned ? '[📌]' : '';
      return `- [${m.category.toUpperCase()}] ${pinTag} ${m.content}`;
    });

    const memoryBlock = memoryLines.length > 0 
      ? memoryLines.join('\n') 
      : 'No active memories stored yet.';

    const summaryBlock = `=== SHAYLA PERSISTENT MEMORIES ===
${stateSummary}

Active Recollections:
${memoryBlock}
==================================`;

    // 4. Inject into system prompt
    const fullPrompt = `${basePrompt}

${summaryBlock}`;

    return { fullPrompt, summaryBlock };
  }
}
