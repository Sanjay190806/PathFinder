import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { aiService } from '../services/aiService';
import { useComparisonStore, ComparisonResult } from '../app/store/useComparisonStore';
import { useAIStore } from '../app/store/useAIStore';
import { useUIStore } from '../app/store/useUIStore';
import { Play, Copy, Send, Trash2, Check, RefreshCw } from 'lucide-react';

const PRESETS = [
  { provider: 'groq', model: 'openai/gpt-oss-20b', label: 'GPT OSS 20B (Groq)' },
  { provider: 'groq', model: 'openai/gpt-oss-120b', label: 'GPT OSS 120B (Groq)' },
  { provider: 'groq', model: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Groq)' },
  { provider: 'openai', model: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { provider: 'anthropic', model: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
  { provider: 'gemini', model: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { provider: 'ollama', model: 'llama3', label: 'Llama 3 (Ollama)' }
];

export const AIPlaygroundPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<typeof PRESETS>([
    PRESETS[0],
    PRESETS[2]
  ]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { history, saveComparison, deleteComparison, clearHistory } = useComparisonStore();
  const addMessage = useAIStore((s) => s.addMessage);
  const setActiveSection = useUIStore((s) => s.setActiveSection);

  const handleToggleModel = (preset: typeof PRESETS[0]) => {
    const exists = selectedModels.some(
      (m) => m.provider === preset.provider && m.model === preset.model
    );
    if (exists) {
      setSelectedModels(
        selectedModels.filter(
          (m) => !(m.provider === preset.provider && m.model === preset.model)
        )
      );
    } else {
      setSelectedModels([...selectedModels, preset]);
    }
  };

  const handleCompare = async () => {
    if (!prompt.trim()) return;
    if (selectedModels.length === 0) return;

    setLoading(true);
    setResults([]);

    try {
      const response = await aiService.compare(
        prompt,
        selectedModels.map((m) => ({ provider: m.provider, model: m.model }))
      );
      
      const comparisonResults: ComparisonResult[] = response.results.map((res: any) => ({
        provider: res.provider,
        model: res.model,
        content: res.content || '',
        latencyMs: res.latencyMs || 0,
        tokenEstimate: res.tokenEstimate || 0,
        costEstimate: res.costEstimate || 0,
        error: res.error || null
      }));

      setResults(comparisonResults);
      saveComparison(prompt, comparisonResults);
    } catch (error: any) {
      console.error('Comparison error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSendToShayla = (content: string) => {
    addMessage({
      id: `msg-${Date.now()}`,
      role: 'user',
      content: `Here is a compared model response I want to import:\n\n${content}`
    });
    setActiveSection('ai');
  };

  const handleExport = (session: any) => {
    let md = `# AI Model Comparison: "${session.prompt}"\n`;
    md += `Date: ${new Date(session.timestamp).toLocaleString()}\n\n`;
    
    session.results.forEach((r: any) => {
      md += `## Model: ${r.model} (${r.provider})\n`;
      md += `- Latency: ${r.latencyMs}ms\n`;
      md += `- Token Estimate: ${r.tokenEstimate}\n`;
      md += `- Cost: $${r.costEstimate.toFixed(5)}\n\n`;
      if (r.error) {
        md += `**Error**: ${r.error}\n\n`;
      } else {
        md += `${r.content}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-comparison-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ambient particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const parent = canvas.parentElement;
    let w = (canvas.width = parent?.offsetWidth || window.innerWidth);
    let h = (canvas.height = parent?.offsetHeight || window.innerHeight);
    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    const colors = ['#22c55e', '#a855f7', '#eab308', '#ec4899'];
    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.5 + 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.12 + 0.03
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 5; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
  }, []);

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader
          title="🃏 Joker Arkham AI Chaos Arena // Multi-Model Battleground"
          subtitle="Pit LLM neural networks against each other! Compare response madness, latencies, tokens, and model costs side-by-side in real-time."
        />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Settings Panel */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
              1. Choose Models to Compare
            </span>
            <div className="flex flex-col gap-2">
              {PRESETS.map((preset) => {
                const isSelected = selectedModels.some(
                  (m) => m.provider === preset.provider && m.model === preset.model
                );
                return (
                  <button
                    key={`${preset.provider}-${preset.model}`}
                    onClick={() => handleToggleModel(preset)}
                    className={`p-3 rounded-xl border text-left text-xs transition flex flex-col gap-1 ${
                      isSelected
                        ? 'border-accentBlue bg-accentBlue/10 text-textPrimary'
                        : 'border-border-subtle bg-bgSurface/20 text-textSecondary hover:bg-bg-glass-hover'
                    }`}
                  >
                    <span className="font-semibold block">{preset.label}</span>
                    <span className="text-[9px] text-textMuted uppercase">{preset.provider}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Prompt History */}
          <Card className="flex flex-col gap-3 max-h-[350px] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">
                Comparison History
              </span>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-[9px] text-accentOrange hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <span className="text-[10px] text-textMuted text-center py-4 block">No history saved.</span>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((session) => (
                  <div
                    key={session.id}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-border-subtle hover:border-white/10 transition text-[11px] flex flex-col gap-1.5"
                  >
                    <span className="text-textPrimary font-medium truncate block">{session.prompt}</span>
                    <div className="flex justify-between items-center text-[9px] text-textMuted">
                      <span>{new Date(session.timestamp).toLocaleTimeString()}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPrompt(session.prompt);
                            setResults(session.results);
                          }}
                          className="text-accentBlue hover:underline font-semibold"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleExport(session)}
                          className="text-accentEmerald hover:underline font-semibold"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => deleteComparison(session.id)}
                          className="text-accentRed hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Lab Panel */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <Card className="flex flex-col gap-4 border-accentBlue/20 bg-accentBlue/5">
            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
              2. Lab Prompt Input
            </span>
            <div className="flex flex-col gap-2">
              <textarea
                placeholder="Ask anything (e.g. Write a quicksort implementation in Java with patterns, teach me the German word for University...)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 rounded-xl border border-border-subtle bg-bgSurface/40 px-4 py-3 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accentBlue"
              />
              <div className="flex justify-between items-center gap-4 mt-1">
                <span className="text-[10px] text-textMuted font-mono">
                  {selectedModels.length} models selected for comparison
                </span>
                <div className="flex gap-2">
                  {results.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPrompt('');
                        setResults([]);
                      }}
                      className="text-xs"
                    >
                      Reset
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={loading || !prompt.trim() || selectedModels.length === 0}
                    onClick={handleCompare}
                    className="text-xs"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-1.5 h-3.5 w-3.5" />
                        Compare Models
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Grid Side by Side Responses */}
          {results.length > 0 && (
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(results.length, 3)} gap-6`}>
              {results.map((res, index) => (
                <Card
                  key={index}
                  className={`flex flex-col h-full border ${
                    res.error ? 'border-accentRed/30 bg-accentRed/5' : 'border-border-subtle'
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-textPrimary truncate max-w-[150px]">{res.model}</h4>
                      <span className="text-[9px] text-textMuted uppercase font-bold tracking-wider">
                        {res.provider}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleCopy(res.content, index)}
                        className="p-1 rounded hover:bg-white/5 text-textMuted hover:text-textPrimary transition"
                        title="Copy Response"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-3.5 w-3.5 text-accentEmerald" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      {!res.error && (
                        <button
                          onClick={() => handleSendToShayla(res.content)}
                          className="p-1 rounded hover:bg-white/5 text-textMuted hover:text-textPrimary transition"
                          title="Import into Shayla Chat"
                        >
                          <Send className="h-3.5 w-3.5 text-accentBlue" />
                        </button>
                      )}
                    </div>
                  </div>

                  {res.error ? (
                    <div className="flex-1 py-6 flex flex-col justify-center items-center text-center">
                      <span className="text-2xl mb-2">⚠️</span>
                      <span className="text-xs text-accentRed font-bold">Failed to load</span>
                      <p className="text-[10px] text-textMuted max-w-[180px] mt-1 leading-snug">{res.error}</p>
                    </div>
                  ) : (
                    <div className="flex-1 py-4 text-xs text-textSecondary overflow-y-auto max-h-[400px] whitespace-pre-wrap font-sans leading-relaxed">
                      {res.content}
                    </div>
                  )}

                  <div className="border-t border-border-subtle/50 pt-3 mt-auto flex flex-col gap-2 text-[10px] font-mono text-textMuted">
                    <div className="flex justify-between">
                      <span>Latency:</span>
                      <span className="text-textPrimary font-bold">{res.latencyMs}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token Estimate:</span>
                      <span className="text-textPrimary font-bold">{res.tokenEstimate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost Est:</span>
                      <span className="text-accentEmerald font-bold">${res.costEstimate.toFixed(6)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
