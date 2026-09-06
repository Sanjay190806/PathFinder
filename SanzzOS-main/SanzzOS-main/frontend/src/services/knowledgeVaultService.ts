import { KnowledgeVaultCategory, KnowledgeVaultEntry } from '../types/knowledgeVault';
import { safeGetJSON, safeSetJSON } from './learningService';

export const KNOWLEDGE_VAULT_STORAGE_KEY = 'sanzz_os_knowledge_vault_v1';

const starterEntries: KnowledgeVaultEntry[] = [
  {
    id: 'vault-dsa-template',
    title: 'DSA mistake review template',
    category: 'DSA notes',
    body: 'Problem:\nPattern:\nMistake:\nCorrect intuition:\nComplexity:\nRedo date:',
    tags: ['dsa', 'mistakes', 'revision'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vault-interview-project-story',
    title: 'Project explanation skeleton',
    category: 'Project explanations',
    body: 'Context:\nProblem:\nMy role:\nTech stack:\nTradeoff:\nImpact:\nWhat I would improve:',
    tags: ['project', 'interview'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function loadKnowledgeVault(): KnowledgeVaultEntry[] {
  const entries = safeGetJSON<KnowledgeVaultEntry[]>(KNOWLEDGE_VAULT_STORAGE_KEY, []);
  return entries.length ? entries : starterEntries;
}

export function saveKnowledgeVault(entries: KnowledgeVaultEntry[]): void {
  safeSetJSON(KNOWLEDGE_VAULT_STORAGE_KEY, entries);
}

export function createKnowledgeVaultEntry(input: {
  title: string;
  category: KnowledgeVaultCategory;
  body: string;
  tags: string;
}): KnowledgeVaultEntry {
  const now = new Date().toISOString();
  return {
    id: `vault-${Date.now()}`,
    title: input.title,
    category: input.category,
    body: input.body,
    tags: input.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    createdAt: now,
    updatedAt: now
  };
}
