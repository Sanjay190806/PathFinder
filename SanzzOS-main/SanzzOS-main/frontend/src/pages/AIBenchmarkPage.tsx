import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { aiService } from '../services/aiService';
import { useAISettingsStore, AIProviderName } from '../app/store/useAISettingsStore';
import { useBenchmarkStore, BenchmarkResultItem } from '../app/store/useBenchmarkStore';
import { Play, Star, AlertTriangle, CheckCircle, BarChart3, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  'Java DSA explanation',
  'German A1 tutoring',
  'Resume review',
  'Project explanation',
  'Daily planning',
  'Motivation/accountability',
  'CS Core explanation',
  'SQL query help'
];

export const AIBenchmarkPage: React.FC = () => {
  const settings = useAISettingsStore();
  const { history, saveSession, rateCategory, deleteSession } = useBenchmarkStore();

  const [provider, setProvider] = useState<AIProviderName>(settings.activeProvider);
  const [model, setModel] = useState<string>(settings.activeModel);
  const [selectedCats, setSelectedCats] = useState<string[]>(CATEGORIES);
  const [loading, setLoading] = useState(false);
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number | null>(null); // expanded result details index

  const activeSession = history.find((s) => s.id === activeSessionId) || (history.length > 0 ? history[0] : null);

  const providerModels: Record<AIProviderName, string[]> = {
    groq: [
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'llama-3.1-8b-instant',
      'llama3-70b-8192',
      'mixtral-8x7b-32768'
    ],
    openrouter: [
      'meta-llama/llama-3-8b-instruct:free',
      'microsoft/phi-3-medium-128k-instruct:free',
      'google/gemma-2-9b-it:free'
    ],
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-5-sonnet-latest', 'claude-3-haiku-20240307'],
    gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    ollama: ['llama3', 'mistral', 'codellama'],
    lmstudio: ['local-model']
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextProv = e.target.value as AIProviderName;
    setProvider(nextProv);
    const list = providerModels[nextProv] || [];
    if (list.length > 0) setModel(list[0]);
  };

  const handleCatToggle = (cat: string) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter((c) => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleRun = async () => {
    if (selectedCats.length === 0) return;
    setLoading(true);
    setActiveTab(null);

    try {
      const response = await aiService.benchmark(provider, model, selectedCats);
      const resList: BenchmarkResultItem[] = response.results.map((res: any) => ({
        category: res.category,
        success: res.success,
        content: res.content || '',
        latencyMs: res.latencyMs || 0,
        tokenEstimate: res.tokenEstimate || 0,
        costEstimate: res.costEstimate || 0,
        scores: {
          received: res.scores.received || 0,
          format: res.scores.format || 0,
          ruleAdherence: res.scores.ruleAdherence || 0,
          latency: res.scores.latency || 0,
          total: res.scores.total || 0
        },
        error: res.error || null
      }));

      saveSession(provider, model, resList);
      
      // select the newly created session
      setTimeout(() => {
        const latest = useBenchmarkStore.getState().history[0];
        if (latest) setActiveSessionId(latest.id);
      }, 50);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="AI Model Benchmarking"
        subtitle="Benchmark model accuracy, compliance, latency, and response size against placement categories."
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Control Panel */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block border-b border-white/5 pb-2">
              Setup Benchmark Run
            </span>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-textMuted font-bold uppercase">Provider</label>
                <select
                  value={provider}
                  onChange={handleProviderChange}
                  className="rounded-lg border border-border-subtle bg-bgSurface px-3 py-2 text-xs text-textPrimary focus:outline-none"
                >
                  <option value="groq">Groq</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Gemini</option>
                  <option value="ollama">Ollama</option>
                  <option value="lmstudio">LM Studio</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-textMuted font-bold uppercase">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="rounded-lg border border-border-subtle bg-bgSurface px-3 py-2 text-xs text-textPrimary focus:outline-none"
                >
                  {(providerModels[provider] || []).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-textMuted font-bold uppercase">Select Categories</span>
              <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => {
                  const isChecked = selectedCats.includes(cat);
                  return (
                    <label key={cat} className="flex items-center gap-2 text-xs text-textSecondary cursor-pointer hover:text-textPrimary">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCatToggle(cat)}
                        className="rounded border-border-subtle text-accentBlue focus:ring-0"
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Button
              variant="primary"
              disabled={loading || selectedCats.length === 0}
              onClick={handleRun}
              className="w-full text-xs mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Run Benchmarks
                </>
              )}
            </Button>
          </Card>

          {/* Run History */}
          <Card className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block border-b border-white/5 pb-2">
              Benchmark History
            </span>

            {history.length === 0 ? (
              <span className="text-[10px] text-textMuted text-center py-4 block">No benchmarks run yet.</span>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => setActiveSessionId(sess.id)}
                    className={`p-2.5 rounded-xl border text-[11px] cursor-pointer transition flex flex-col gap-1.5 ${
                      activeSession?.id === sess.id
                        ? 'border-accentBlue bg-accentBlue/10'
                        : 'border-border-subtle bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-textPrimary truncate block max-w-[130px]">
                        {sess.model}
                      </span>
                      <Badge variant="primary">{sess.overallScore} / 100</Badge>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-textMuted">
                      <span>{new Date(sess.timestamp).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(sess.id);
                        }}
                        className="text-accentRed hover:underline font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Scoreboard & Details */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          {activeSession ? (
            <div className="flex flex-col gap-6">
              {/* Overall Session Score */}
              <Card className="flex flex-wrap items-center justify-between gap-6 border-accentPurple/20 bg-accentPurple/5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-accentPurple/10 border border-accentPurple/20 flex items-center justify-center text-accentPurple">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider">
                      Overall Model Benchmark Score
                    </span>
                    <h3 className="text-xl font-bold text-textPrimary">
                      {activeSession.model} ({activeSession.provider})
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-accentPurple">{activeSession.overallScore}%</span>
                  <span className="text-[9px] text-textMuted uppercase font-bold tracking-widest">
                    Placement Compliance Score
                  </span>
                </div>
              </Card>

              {/* Detailed Category Table */}
              <Card className="flex flex-col gap-4">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block border-b border-white/5 pb-2">
                  Category Score Breakdown
                </span>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] text-textMuted uppercase tracking-wider">
                        <th className="pb-3 pl-2">Category</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Latency</th>
                        <th className="pb-3">Adherence (Format / Rule / Latency)</th>
                        <th className="pb-3">User Rating</th>
                        <th className="pb-3 text-right pr-2">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activeSession.results.map((res, index) => {
                        const isExpanded = activeTab === index;
                        return (
                          <React.Fragment key={res.category}>
                            <tr
                              onClick={() => setActiveTab(isExpanded ? null : index)}
                              className="hover:bg-white/[0.02] cursor-pointer transition"
                            >
                              <td className="py-3.5 pl-2 font-semibold text-textPrimary flex items-center gap-1.5">
                                {isExpanded ? '▼' : '▶'} {res.category}
                              </td>
                              <td className="py-3.5">
                                {res.success ? (
                                  <Badge variant="success" className="flex items-center gap-1 font-bold w-fit">
                                    <CheckCircle className="h-3 w-3" /> Ready
                                  </Badge>
                                ) : (
                                  <Badge variant="danger" className="flex items-center gap-1 font-bold w-fit">
                                    <AlertTriangle className="h-3 w-3" /> Failed
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3.5 font-mono text-textSecondary">{res.latencyMs}ms</td>
                              <td className="py-3.5">
                                <div className="flex gap-1.5">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      res.scores.format > 0 ? 'bg-accentEmerald/10 text-accentEmerald' : 'bg-white/5 text-textMuted'
                                    }`}
                                  >
                                    Format
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      res.scores.ruleAdherence > 0 ? 'bg-accentBlue/10 text-accentBlue' : 'bg-white/5 text-textMuted'
                                    }`}
                                  >
                                    Rule
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      res.scores.latency > 0 ? 'bg-accentOrange/10 text-accentOrange' : 'bg-white/5 text-textMuted'
                                    }`}
                                  >
                                    Speed
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => rateCategory(activeSession.id, res.category, star)}
                                      className={`p-0.5 transition ${
                                        (res.userRating || 0) >= star
                                          ? 'text-accentYellow hover:text-accentYellow/80'
                                          : 'text-textMuted hover:text-textPrimary'
                                      }`}
                                    >
                                      <Star className="h-3.5 w-3.5 fill-current" />
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3.5 text-right font-mono font-bold text-textPrimary pr-2">
                                {res.scores.total} / {res.userRating ? 100 : 80}
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr>
                                <td colSpan={6} className="bg-white/[0.01] p-4 text-xs">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-textMuted border-b border-white/5 pb-1">
                                      <span>Model Response Output</span>
                                      <span className="font-mono text-[9px] text-textSecondary">
                                        Tokens: {res.tokenEstimate} | Cost: ${res.costEstimate.toFixed(6)}
                                      </span>
                                    </div>
                                    {res.error ? (
                                      <span className="text-accentRed font-semibold block">{res.error}</span>
                                    ) : (
                                      <div className="whitespace-pre-wrap font-sans text-textSecondary leading-relaxed py-2">
                                        {res.content}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="py-12 text-center text-textSecondary flex flex-col items-center justify-center">
              <span className="text-3xl mb-2">🎯</span>
              <span className="text-sm font-bold text-textPrimary">No active benchmark run</span>
              <p className="text-xs text-textMuted max-w-[280px] mt-1 leading-snug">
                Configure provider, model, and categories on the left pane and launch tests to populate benchmark compliance logs.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
