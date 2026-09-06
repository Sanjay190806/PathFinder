export type KnowledgeVaultCategory =
  | 'DSA notes'
  | 'CS notes'
  | 'SQL snippets'
  | 'German grammar'
  | 'Interview answers'
  | 'Project explanations';

export interface KnowledgeVaultEntry {
  id: string;
  title: string;
  category: KnowledgeVaultCategory;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
