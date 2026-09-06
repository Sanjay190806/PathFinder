import React, { useMemo, useState } from 'react';
import { createKnowledgeVaultEntry, loadKnowledgeVault, saveKnowledgeVault } from '../../services/knowledgeVaultService';
import { KnowledgeVaultCategory, KnowledgeVaultEntry } from '../../types/knowledgeVault';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const categories: KnowledgeVaultCategory[] = ['DSA notes', 'CS notes', 'SQL snippets', 'German grammar', 'Interview answers', 'Project explanations'];

export const KnowledgeVaultPanel: React.FC = () => {
  const [entries, setEntries] = useState<KnowledgeVaultEntry[]>(() => loadKnowledgeVault());
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState({
    title: '',
    category: 'DSA notes' as KnowledgeVaultCategory,
    body: '',
    tags: ''
  });

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return entries;
    return entries.filter((entry) =>
      [entry.title, entry.category, entry.body, entry.tags.join(' ')].join(' ').toLowerCase().includes(q)
    );
  }, [entries, query]);

  const addEntry = () => {
    if (!draft.title.trim() || !draft.body.trim()) return;
    const next = [createKnowledgeVaultEntry(draft), ...entries];
    setEntries(next);
    saveKnowledgeVault(next);
    setDraft({ title: '', category: draft.category, body: '', tags: '' });
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Knowledge Vault</p>
          <h3 className="mt-1 text-xl font-semibold text-textPrimary">Searchable notes and explanations</h3>
          <p className="mt-1 text-sm text-textSecondary">Store DSA notes, CS notes, SQL snippets, German grammar, interview answers, and project explanations.</p>
        </div>
        <Badge variant="primary">{entries.length} entries</Badge>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <div className="grid gap-2">
            <input
              className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary outline-none"
              placeholder="Title"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
            <select
              className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary outline-none"
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value as KnowledgeVaultCategory })}
            >
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <textarea
              className="min-h-[120px] rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary outline-none"
              placeholder="Write the note, snippet, answer, or explanation..."
              value={draft.body}
              onChange={(event) => setDraft({ ...draft, body: event.target.value })}
            />
            <input
              className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary outline-none"
              placeholder="tags comma separated"
              value={draft.tags}
              onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
            />
            <Button onClick={addEntry} size="sm" variant="primary">Save vault entry</Button>
          </div>
        </div>

        <div>
          <input
            className="mb-3 w-full rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary outline-none"
            placeholder="Search vault..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1">
            {filtered.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-textPrimary">{entry.title}</p>
                  <Badge>{entry.category}</Badge>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-textSecondary">{entry.body}</p>
                {entry.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.tags.map((tag) => <Badge key={tag} variant="neutral" className="text-[8px]">{tag}</Badge>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
