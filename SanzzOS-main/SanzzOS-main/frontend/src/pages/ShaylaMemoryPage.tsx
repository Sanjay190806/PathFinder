import React, { useEffect, useState } from 'react';
import {
  Brain,
  Pin,
  EyeOff,
  Trash2,
  Plus,
  FileDown,
  FileUp,
  RefreshCw,
  Clock,
  Sparkles,
  Info,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';

interface MemoryItem {
  id: string;
  category: 'study' | 'german' | 'projects' | 'resume' | 'applications' | 'mood';
  content: string;
  pinned: boolean;
  ignored: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ShaylaMemoryPage: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [lastPromptSummary, setLastPromptSummary] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states for manually adding a memory
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'study' | 'german' | 'projects' | 'resume' | 'applications' | 'mood'>('study');
  const [showAddForm, setShowAddForm] = useState(false);

  // Tab state: 'active' | 'pinned' | 'forgotten' | 'timeline'
  const [activeTab, setActiveTab] = useState<'active' | 'pinned' | 'forgotten' | 'timeline'>('active');

  // Global memory enable/disable (persists locally in settings)
  const [memoryEnabled, setMemoryEnabled] = useState(() => {
    const saved = localStorage.getItem('shayla-memory-enabled');
    return saved !== 'false';
  });

  const getApiUrl = (path: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    return `${baseUrl}${path}`;
  };

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/ai/memory'));
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
        setLastPromptSummary(data.lastPromptSummary || '');
      }
    } catch (e) {
      console.error('Failed to fetch memories', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleToggleMemoryEngine = () => {
    const next = !memoryEnabled;
    setMemoryEnabled(next);
    localStorage.setItem('shayla-memory-enabled', String(next));
  };

  // Add Memory
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    try {
      const res = await fetch(getApiUrl('/ai/memory'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory, content: newContent.trim() }),
      });
      if (res.ok) {
        setNewContent('');
        setShowAddForm(false);
        fetchMemories();
      }
    } catch (e) {
      console.error('Failed to add memory', e);
    }
  };

  // Update Memory (Pin/Ignore)
  const handleUpdateMemory = async (id: string, updates: Partial<Pick<MemoryItem, 'pinned' | 'ignored'>>) => {
    try {
      const res = await fetch(getApiUrl(`/ai/memory/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchMemories();
      }
    } catch (e) {
      console.error('Failed to update memory', e);
    }
  };

  // Delete Memory
  const handleDeleteMemory = async (id: string) => {
    if (!window.confirm('Delete this memory permanently?')) return;
    try {
      const res = await fetch(getApiUrl(`/ai/memory/${id}`), { method: 'DELETE' });
      if (res.ok) {
        fetchMemories();
      }
    } catch (e) {
      console.error('Failed to delete memory', e);
    }
  };

  // Reset Memory Store
  const handleResetMemory = async () => {
    if (!window.confirm('Are you absolutely sure you want to clear all Shayla memory? This cannot be undone.')) return;
    try {
      const res = await fetch(getApiUrl('/ai/memory/reset'), { method: 'POST' });
      if (res.ok) {
        fetchMemories();
      }
    } catch (e) {
      console.error('Failed to reset memory store', e);
    }
  };

  // Export JSON
  const handleExportMemories = () => {
    const blob = new Blob([JSON.stringify(memories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shayla-memories-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportMemories = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Send them sequentially to add them to store
          for (const item of parsed) {
            if (item.category && item.content) {
              await fetch(getApiUrl('/ai/memory'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: item.category, content: item.content }),
              });
            }
          }
          fetchMemories();
          alert('Memories imported successfully!');
        } else {
          alert('Invalid format. File must contain a JSON array of memory records.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filters for Tabs
  const activeMemories = memories.filter((m) => !m.ignored);
  const pinnedMemories = memories.filter((m) => m.pinned && !m.ignored);
  const forgottenMemories = memories.filter((m) => m.ignored);

  const getFilteredList = () => {
    switch (activeTab) {
      case 'pinned':
        return pinnedMemories;
      case 'forgotten':
        return forgottenMemories;
      case 'timeline':
      case 'active':
      default:
        return activeMemories;
    }
  };

  const currentList = getFilteredList();

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'study':
        return 'text-accentBlue bg-accentBlue/10 border-accentBlue/20';
      case 'german':
        return 'text-accentYellow bg-accentYellow/10 border-accentYellow/20';
      case 'projects':
        return 'text-accentPurple bg-accentPurple/10 border-accentPurple/20';
      case 'resume':
        return 'text-accentRed bg-accentRed/10 border-accentRed/20';
      case 'applications':
        return 'text-accentEmerald bg-accentEmerald/10 border-accentEmerald/20';
      case 'mood':
      default:
        return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
    }
  };

  return (
    <div className="fade-in flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Shayla Memory Panel"
        subtitle="Manage Shayla's persistent recollections, review prompt context summaries, and edit privacy constraints"
      />

      {/* Global Status & Quick Controls */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
            <h3 className="text-sm font-semibold text-textPrimary">Memory Engine Status</h3>
            <Brain className="h-4 w-4 text-accentYellow" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Persistent Learning</span>
            <button
              onClick={handleToggleMemoryEngine}
              className="flex items-center gap-1.5 focus:outline-none"
            >
              {memoryEnabled ? (
                <div className="flex items-center text-accentEmerald">
                  <ToggleRight className="h-6 w-6" />
                  <span className="font-semibold">Enabled</span>
                </div>
              ) : (
                <div className="flex items-center text-textMuted">
                  <ToggleLeft className="h-6 w-6" />
                  <span className="font-semibold">Disabled</span>
                </div>
              )}
            </button>
          </div>
          <p className="text-[10px] text-textMuted leading-relaxed">
            When enabled, Shayla reads active recollections and appends them to her system context prompt to adapt advice.
          </p>
        </Card>

        <Card className="flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
            <h3 className="text-sm font-semibold text-textPrimary">Diagnostics & Memory Backup</h3>
            <Clock className="h-4 w-4 text-accentYellow" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant="outline" onClick={fetchMemories} className="text-xs h-9">
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Memories
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportMemories} className="text-xs h-9">
              <FileDown className="mr-1.5 h-3.5 w-3.5" />
              Export Records
            </Button>
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-border-subtle bg-bgSurface/40 px-3 py-1.5 text-xs font-bold text-textPrimary hover:bg-white/[0.05] transition h-9">
              <FileUp className="mr-1.5 h-3.5 w-3.5" />
              Import Records
              <input type="file" accept=".json" onChange={handleImportMemories} className="hidden" />
            </label>
            <Button size="sm" variant="danger" onClick={handleResetMemory} className="text-xs h-9">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear Brain
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recollection List Panel */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="flex flex-col gap-4 min-h-[500px]">
            <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-accentYellow" />
                <h3 className="text-base font-semibold text-textPrimary">Memory timeline</h3>
              </div>
              <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="text-xs">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add custom memory
              </Button>
            </div>

            {/* Quick manual insert form */}
            {showAddForm && (
              <form onSubmit={handleAddMemory} className="rounded-xl border border-border-subtle bg-white/[0.02] p-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-textMuted uppercase" htmlFor="custom-category">Category</label>
                    <select
                      id="custom-category"
                      value={newCategory}
                      onChange={(e: any) => setNewCategory(e.target.value)}
                      className="rounded-lg border border-border-subtle bg-bgSurface px-3 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="study">Study / DSA</option>
                      <option value="german">German Path</option>
                      <option value="projects">Projects</option>
                      <option value="resume">Resume / ATS</option>
                      <option value="applications">Applications</option>
                      <option value="mood">Mood / Streak</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-textMuted uppercase" htmlFor="custom-content">Memory content</label>
                    <input
                      id="custom-content"
                      type="text"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="e.g. Sanju prepared LlamaIndex tutorial milestones."
                      className="rounded-lg border border-border-subtle bg-bgSurface px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-accentYellow"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  <Button type="submit" size="sm">Save Custom Recall</Button>
                </div>
              </form>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/5 pb-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'active' ? 'bg-white/10 text-textPrimary' : 'text-textMuted hover:text-textSecondary'
                }`}
              >
                Active ({activeMemories.length})
              </button>
              <button
                onClick={() => setActiveTab('pinned')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'pinned' ? 'bg-white/10 text-textPrimary' : 'text-textMuted hover:text-textSecondary'
                }`}
              >
                📌 Pinned ({pinnedMemories.length})
              </button>
              <button
                onClick={() => setActiveTab('forgotten')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'forgotten' ? 'bg-white/10 text-textPrimary' : 'text-textMuted hover:text-textSecondary'
                }`}
              >
                👁️ Forgotten ({forgottenMemories.length})
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'timeline' ? 'bg-white/10 text-textPrimary' : 'text-textMuted hover:text-textSecondary'
                }`}
              >
                📅 Timeline View
              </button>
            </div>

            {/* List */}
            {currentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-textMuted py-12">
                <Info className="h-6 w-6 mb-2" />
                <p className="text-xs italic">No recollections found in this filter.</p>
              </div>
            ) : activeTab === 'timeline' ? (
              <div className="flex flex-col gap-4 pl-4 border-l border-white/10 mt-3 flex-1">
                {currentList.map((m) => (
                  <div key={m.id} className="relative flex flex-col gap-1">
                    <span className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full border border-bgBase bg-accentYellow shadow" />
                    <div className="flex items-center gap-2 text-[10px] text-textMuted">
                      <span>{new Date(m.createdAt).toLocaleString()}</span>
                      <span className={`px-1.5 py-0.5 rounded border text-[8px] uppercase tracking-wider font-semibold ${getCategoryColor(m.category)}`}>
                        {m.category}
                      </span>
                    </div>
                    <p className="text-xs text-textSecondary">{m.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3 flex-1">
                {currentList.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border-subtle bg-white/[0.02] hover:bg-white/[0.04] transition"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider font-bold ${getCategoryColor(m.category)}`}>
                          {m.category}
                        </span>
                        <span className="text-[10px] text-textMuted font-mono">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-textPrimary leading-relaxed">{m.content}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Pin button */}
                      <button
                        title={m.pinned ? 'Unpin recollection' : 'Pin recollection'}
                        onClick={() => handleUpdateMemory(m.id, { pinned: !m.pinned })}
                        className={`p-1.5 rounded-lg border transition ${
                          m.pinned 
                            ? 'border-accentYellow/30 bg-accentYellow/10 text-accentYellow' 
                            : 'border-white/5 hover:border-white/10 text-textMuted hover:text-textSecondary'
                        }`}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>

                      {/* Ignore (Forget) Button */}
                      <button
                        title={m.ignored ? 'Recall memory (remember)' : 'Ignore memory (forget)'}
                        onClick={() => handleUpdateMemory(m.id, { ignored: !m.ignored })}
                        className="p-1.5 rounded-lg border border-white/5 hover:border-white/10 text-textMuted hover:text-textSecondary transition"
                      >
                        {m.ignored ? <Eye className="h-3.5 w-3.5 text-accentEmerald" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>

                      {/* Delete */}
                      <button
                        title="Delete permanently"
                        onClick={() => handleDeleteMemory(m.id)}
                        className="p-1.5 rounded-lg border border-white/5 hover:border-white/10 text-textMuted hover:text-accentRed transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* AI System Context Diagnostics */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card className="flex flex-col gap-4 flex-1">
            <div className="border-b border-border-subtle/50 pb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accentYellow" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">AI Context</span>
                <h3 className="text-base font-semibold text-textPrimary">Last composed prompt</h3>
              </div>
            </div>

            <p className="text-xs text-textSecondary leading-relaxed">
              This panel shows the exact structured context block sent to the AI router on the most recent chat interaction:
            </p>

            <pre className="flex-1 p-3 bg-black/40 rounded-xl font-mono text-[10px] text-textSecondary leading-relaxed overflow-x-auto whitespace-pre-wrap border border-border-subtle max-h-[500px] overflow-y-auto">
              {lastPromptSummary || 'No prompt has been composed yet. Open Shayla AI chat and send a message to trigger memory integration.'}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
};
