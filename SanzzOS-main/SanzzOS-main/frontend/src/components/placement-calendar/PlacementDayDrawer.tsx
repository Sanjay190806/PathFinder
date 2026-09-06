import React, { useState, useMemo } from 'react';
import { X, Calendar, Sparkles, CheckCircle2, ArrowRight, Plus, Trash2, ExternalLink, BookOpen, CheckSquare, Square } from 'lucide-react';
import { PlacementDayPlan } from '../../data/placementCalendar';
import { DailyLog } from '../../types';
import { useAIStore } from '../../app/store/useAIStore';
import { useUIStore } from '../../app/store/useUIStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getDateForDay, formatDate } from '../../utils/dateUtils';
import { Button } from '../ui/Button';

interface PlacementDayDrawerProps {
  dayPlan: PlacementDayPlan | null;
  log: DailyLog | undefined;
  onClose: () => void;
  onUpdateLog: (day: number, updates: Partial<DailyLog>) => void;
}

export const PlacementDayDrawer: React.FC<PlacementDayDrawerProps> = ({
  dayPlan,
  log,
  onClose,
  onUpdateLog
}) => {
  if (!dayPlan) return null;

  const [note, setNote] = useState(log?.note || '');
  const { setCurrentDay, setActiveSection } = useUIStore();
  const queuePrompt = useAIStore((s) => s.queuePrompt);
  const { userProfile, addCustomStudyMaterial, toggleCustomStudyMaterial, deleteCustomStudyMaterial } = useCareerStore();

  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matCategory, setMatCategory] = useState('DSA');
  const [matUrl, setMatUrl] = useState('');
  const [matNotes, setMatNotes] = useState('');

  const dateObj = getDateForDay(dayPlan.day, userProfile.startDate);
  const dateFormatted = formatDate(dateObj);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, string[]> = {};
    dayPlan.tasks.forEach((task) => {
      const parts = task.split(':');
      if (parts.length > 1) {
        const cat = parts[0].trim();
        const content = parts.slice(1).join(':').trim();
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(content);
      } else {
        const cat = 'General Prep';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(task.trim());
      }
    });
    return groups;
  }, [dayPlan.tasks]);

  const handleSaveNote = () => {
    onUpdateLog(dayPlan.day, { note });
  };

  const handleToggleComplete = () => {
    const isCompleted = log?.status === 'completed';
    onUpdateLog(dayPlan.day, {
      status: isCompleted ? 'not_started' : 'completed',
      completionType: isCompleted ? 'missed' : 'perfect'
    });
  };

  const handleAskShayla = () => {
    const prompt = `Give me placement preparation advice and code strategy for Day ${dayPlan.day} (${dayPlan.title}). Focus: ${dayPlan.focus}. Linked tasks: ${dayPlan.tasks.join(', ')}`;
    queuePrompt(prompt);
    setActiveSection('ai');
    onClose();
  };

  const handleOpenToday = () => {
    setCurrentDay(dayPlan.day);
    setActiveSection('today');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Content panel */}
      <div className="relative w-full max-w-lg bg-bgCard border-l border-border-subtle h-full flex flex-col shadow-2xl animate-slideOver overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border-subtle p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accentBlue/10 flex items-center justify-center text-accentBlue">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-textPrimary uppercase">Day {dayPlan.day} Details</h3>
              <p className="text-[11px] text-blue-400 font-medium tracking-wide">
                {dateFormatted} • <span className="text-textMuted uppercase font-mono text-[10px]">{dayPlan.phase}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-textMuted hover:text-textPrimary rounded-lg hover:bg-white/5 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto min-h-0">
          {/* Main Focus */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2">Topic & Focus</h4>
            <div className="p-4 rounded-xl border border-white/5 bg-bgSurface/40">
              <p className="text-sm font-bold text-textPrimary">{dayPlan.title}</p>
              <p className="text-xs text-textSecondary mt-2 leading-relaxed">{dayPlan.focus}</p>
            </div>
          </div>

          {/* Grouped Targets */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2.5">Today's Placement Targets</h4>
            <div className="flex flex-col gap-3">
              {Object.entries(groupedTasks).map(([category, items]) => (
                <div key={category} className="rounded-xl border border-white/5 bg-white/[0.01] p-3 flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold text-accentBlue uppercase tracking-wider">{category}</span>
                  <ul className="flex flex-col gap-1 text-xs">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-textSecondary leading-normal">
                        <span className="h-1 w-1 rounded-full bg-accentBlue/70 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* LeetCode Targets */}
          {dayPlan.leetcode && dayPlan.leetcode.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2">Linked DSA Problems</h4>
              <div className="flex flex-col gap-2">
                {dayPlan.leetcode.map((problem, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border-subtle bg-bgSurface/20 hover:bg-bgSurface/40 transition">
                    <div>
                      <span className="text-xs font-bold text-textPrimary">
                        {problem.id}. {problem.name}
                      </span>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-[9px] font-bold uppercase ${
                          problem.difficulty === 'Easy' ? 'text-accentEmerald' : problem.difficulty === 'Medium' ? 'text-accentOrange' : 'text-accentRed'
                        }`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-[9px] text-textMuted uppercase font-mono">
                          Pattern: {problem.pattern}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placement Prep Spotlight */}
          {dayPlan.placementPrep && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2">Prep Center Spotlight</h4>
              <div className="p-4 rounded-xl border border-accentPurple/20 bg-accentPurple/5">
                <div className="flex items-center gap-2 text-accentPurple mb-2">
                  <Sparkles className="h-4 w-4 fill-current" />
                  <span className="text-xs font-bold">{dayPlan.placementPrep.type}</span>
                </div>
                <p className="text-xs text-textSecondary leading-relaxed">{dayPlan.placementPrep.details}</p>
                {dayPlan.placementPrep.what && (
                  <p className="text-xs text-textMuted mt-2 whitespace-pre-line bg-black/20 p-2.5 rounded-lg border border-white/5 font-mono">
                    {dayPlan.placementPrep.what}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Custom Study Materials */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                Custom Study Materials ({log?.customMaterials?.length || 0})
              </h4>
              <button
                onClick={() => setShowAddMaterial(!showAddMaterial)}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                {showAddMaterial ? 'Cancel' : 'Add Material'}
              </button>
            </div>

            {showAddMaterial && (
              <div className="mb-3 p-3 rounded-xl border border-blue-500/20 bg-blue-950/20 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Material title or topic..."
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 flex-1"
                  >
                    <option value="DSA">DSA</option>
                    <option value="System Design">System Design</option>
                    <option value="Web Dev">Web Dev</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="German">German</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="url"
                    placeholder="URL (optional)"
                    value={matUrl}
                    onChange={(e) => setMatUrl(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500 flex-1"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Notes / key takeaway (optional)"
                  value={matNotes}
                  onChange={(e) => setMatNotes(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    if (!matTitle.trim()) return;
                    addCustomStudyMaterial(dayPlan.day, {
                      title: matTitle.trim(),
                      category: matCategory,
                      url: matUrl.trim() || undefined,
                      notes: matNotes.trim() || undefined,
                    });
                    setMatTitle('');
                    setMatUrl('');
                    setMatNotes('');
                    setShowAddMaterial(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white self-end transition"
                >
                  Save Study Material
                </button>
              </div>
            )}

            {log?.customMaterials && log.customMaterials.length > 0 ? (
              <div className="flex flex-col gap-2">
                {log.customMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className={`flex items-start justify-between p-2.5 rounded-xl border transition ${
                      mat.completed
                        ? 'bg-emerald-950/20 border-emerald-500/20'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button
                        onClick={() => toggleCustomStudyMaterial(dayPlan.day, mat.id)}
                        className="mt-0.5 text-white/40 hover:text-emerald-400 transition shrink-0"
                      >
                        {mat.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold truncate ${
                              mat.completed ? 'line-through text-white/40' : 'text-white'
                            }`}
                          >
                            {mat.title}
                          </span>
                          {mat.category && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 shrink-0">
                              {mat.category}
                            </span>
                          )}
                        </div>
                        {mat.notes && (
                          <p className="text-[10px] text-white/50 mt-0.5">{mat.notes}</p>
                        )}
                        {mat.url && (
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:underline mt-1"
                          >
                            <span>Open Resource</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCustomStudyMaterial(dayPlan.day, mat.id)}
                      className="text-white/30 hover:text-red-400 p-1 rounded transition shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-textMuted italic bg-white/[0.01] border border-white/5 rounded-xl p-3">
                No custom materials added yet for Day {dayPlan.day}. Click "+ Add Material" to customize your study path.
              </p>
            )}
          </div>

          {/* Note Input */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2">Daily Execution Log / Note</h4>
            <div className="flex flex-col gap-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log your notes, lessons, or difficulties for today..."
                className="w-full h-24 rounded-xl border border-border-subtle bg-bgSurface p-3 text-xs text-textPrimary focus:outline-none focus:border-accentBlue resize-none"
              />
              <Button onClick={handleSaveNote} size="sm" variant="outline" className="self-end rounded-lg">
                Save Note
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border-subtle p-5 bg-bgSurface/20 flex flex-wrap gap-2.5 shrink-0">
          <Button
            onClick={handleToggleComplete}
            variant={log?.status === 'completed' ? 'outline' : 'primary'}
            className="flex-1 rounded-xl h-11 text-xs"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {log?.status === 'completed' ? 'Mark Incomplete' : 'Mark Completed'}
          </Button>

          <Button
            onClick={handleAskShayla}
            variant="outline"
            className="flex-1 rounded-xl h-11 text-xs border-accentPurple/30 text-accentPurple hover:bg-accentPurple/10"
          >
            <Sparkles className="h-4 w-4 mr-2 fill-current" />
            Ask Shayla
          </Button>

          <Button
            onClick={handleOpenToday}
            variant="ghost"
            className="w-full rounded-xl h-11 text-xs text-textSecondary hover:text-textPrimary bg-white/5 flex items-center justify-center"
          >
            Open Today Dashboard
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
