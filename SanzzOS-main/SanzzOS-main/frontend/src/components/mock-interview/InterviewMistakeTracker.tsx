import React, { useState } from 'react';
import { useMockInterviewOS } from '../../hooks/useMockInterviewOS';
import { ShieldCheck, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const InterviewMistakeTracker: React.FC = () => {
  const { mistakes, addMistake, incrementMistake, resolveMistake } = useMockInterviewOS();
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('Behavioral');
  const [showForm, setShowForm] = useState(false);
  const [resolutionPlan, setResolutionPlan] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    addMistake({
      category: cat,
      description: desc,
      resolved: false,
    });
    setDesc('');
    setShowForm(false);
  };

  const handleResolveSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    resolveMistake(id, resolutionPlan);
    setResolutionPlan('');
    setResolvingId(null);
  };

  const unresolved = mistakes.filter((m) => !m.resolved);
  const resolved = mistakes.filter((m) => m.resolved);

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Mistake Tracker</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">Interview Mistakes Logs</h3>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 bg-accentBlue text-white uppercase tracking-wider font-black text-[10px]"
        >
          <Plus className="h-3.5 w-3.5" />
          Log Mistake
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#0c0c1e] border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
          <h4 className="text-xs font-black uppercase text-textPrimary">Log Interview Mistake</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Mistake description</label>
              <input
                type="text"
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. Blanked out on SQL self joins query details"
                className="w-full h-9 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Category</label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full h-9 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              >
                <option value="Behavioral">Behavioral</option>
                <option value="Technical">Technical</option>
                <option value="Clarity">Clarity</option>
                <option value="Filler Words">Filler Words</option>
                <option value="Self Introduction">Self Introduction</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 self-end">
            <Button size="sm" variant="ghost" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Mistake
            </Button>
          </div>
        </form>
      )}

      {/* Unresolved Mistakes list */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider pl-1">Active Mistakes Checklist</span>
        {unresolved.length === 0 ? (
          <p className="text-xs text-textMuted text-center py-4 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
            Excellent! No unresolved mistakes. Keep up the high standard.
          </p>
        ) : (
          unresolved.map((m) => (
            <Card key={m.id} className="p-3 border-white/5 bg-black/45 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-bold text-textMuted uppercase tracking-wider">
                      {m.category}
                    </span>
                    <span className="text-[9px] text-accentOrange font-mono">{m.occurrenceCount} occurrences</span>
                  </div>
                  <h4 className="text-xs font-bold text-textPrimary mt-1.5">{m.description}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => incrementMistake(m.id)}
                    className="text-[9px] uppercase font-bold"
                  >
                    Occurred Again
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setResolvingId(m.id)}
                    className="bg-accentEmerald hover:bg-accentEmerald/90 text-white text-[9px] uppercase font-bold"
                  >
                    Resolve
                  </Button>
                </div>
              </div>

              {resolvingId === m.id && (
                <form onSubmit={(e) => handleResolveSubmit(e, m.id)} className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
                  <label className="block text-[9px] font-bold text-textMuted uppercase">Resolution Plan / Prevention Strategy</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={resolutionPlan}
                      onChange={(e) => setResolutionPlan(e.target.value)}
                      placeholder="How will you avoid this next time? (e.g. revise roadmap chapter 3)"
                      className="flex-1 h-8 px-2 rounded-lg border border-white/5 bg-black/35 text-textPrimary focus:outline-none"
                    />
                    <Button size="sm" type="submit">
                      Submit Resolution
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Resolved Mistakes List */}
      {resolved.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider pl-1">Resolved Mistakes History</span>
          <div className="flex flex-col gap-2">
            {resolved.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.01] opacity-75">
                <div className="flex flex-col gap-1">
                  <span className="text-textSecondary line-through font-semibold">{m.description}</span>
                  {m.resolutionPlan && (
                    <span className="text-[9px] text-accentEmerald font-medium italic">Plan: {m.resolutionPlan}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-accentEmerald">
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Resolved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default InterviewMistakeTracker;
