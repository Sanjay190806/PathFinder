import React, { useState } from 'react';
import { useCompanyIntelligence } from '../../hooks/useCompanyIntelligence';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ShieldAlert, Plus } from 'lucide-react';

export const OAAttemptForm: React.FC = () => {
  const { oaAttempts, addOAAttempt } = useCompanyIntelligence();

  const [company, setCompany] = useState('');
  const [platform, setPlatform] = useState<'HackerRank' | 'CodeChef' | 'LeetCode' | 'Mettl' | 'Custom'>('HackerRank');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedSections, setSelectedSections] = useState<string[]>(['Coding']);
  const [qCount, setQCount] = useState(5);
  const [solved, setSolved] = useState(4);
  const [score, setScore] = useState(80);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [mistakes, setMistakes] = useState('');
  const [result, setResult] = useState<'passed' | 'failed' | 'pending'>('passed');

  const [showForm, setShowForm] = useState(false);

  const handleToggleSection = (sec: string) => {
    if (selectedSections.includes(sec)) {
      setSelectedSections(selectedSections.filter((s) => s !== sec));
    } else {
      setSelectedSections([...selectedSections, sec]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;

    addOAAttempt({
      companyName: company,
      date,
      platform,
      sections: selectedSections,
      qCount,
      solvedCount: solved,
      score,
      difficulty,
      mistakeLog: mistakes || undefined,
      result,
    });

    alert('OA attempt logged successfully!');
    setCompany('');
    setMistakes('');
    setShowForm(false);
  };

  const SECTIONS = ['Coding', 'Aptitude', 'SQL', 'MCQ', 'Logical Reasoning', 'Pseudocode'];

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">OA Assessment Tracker</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">OA Attempt & Mistake Logs</h3>
        </div>

        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 bg-accentBlue text-white uppercase tracking-wider font-black text-[10px]"
        >
          <Plus className="h-3.5 w-3.5" />
          Log OA Attempt
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#0c0c1e] border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
          <h4 className="text-xs font-black uppercase text-textPrimary">Log Assessment Attempt</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Company</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Zoho, Fractal"
                className="w-full h-8 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              >
                <option value="HackerRank">HackerRank</option>
                <option value="CodeChef">CodeChef</option>
                <option value="LeetCode">LeetCode</option>
                <option value="Mettl">Mettl</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Questions</label>
              <input
                type="number"
                min={1}
                value={qCount}
                onChange={(e) => setQCount(Number(e.target.value))}
                className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Solved</label>
              <input
                type="number"
                min={0}
                value={solved}
                onChange={(e) => setSolved(Number(e.target.value))}
                className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Score %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Sections</label>
            <div className="flex flex-wrap gap-1.5">
              {SECTIONS.map((sec) => {
                const isSelected = selectedSections.includes(sec);
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => handleToggleSection(sec)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition ${
                      isSelected ? 'bg-accentBlue text-white' : 'bg-white/5 text-textSecondary hover:bg-white/10'
                    }`}
                  >
                    {sec}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Result</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as any)}
                className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
              >
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Mistakes Notes</label>
            <input
              type="text"
              value={mistakes}
              onChange={(e) => setMistakes(e.target.value)}
              placeholder="e.g. Blanked on matrix rotation algorithms space limits"
              className="w-full h-8 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>

          <div className="flex gap-2 self-end">
            <Button size="sm" variant="ghost" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Log Attempt
            </Button>
          </div>
        </form>
      )}

      {/* Attempts log history */}
      <div className="flex flex-col gap-2.5">
        {oaAttempts.map((attempt) => (
          <Card key={attempt.id} className="p-3 bg-black/45 border-white/5 flex flex-col gap-2.5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-textPrimary">{attempt.companyName}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-textMuted font-mono">
                    {attempt.platform}
                  </span>
                </div>
                <span className="text-[8px] text-textMuted font-mono mt-0.5">{attempt.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-textPrimary font-mono">{attempt.score}%</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                  attempt.result === 'passed' ? 'bg-accentEmerald/10 text-accentEmerald' : 'bg-red-500/10 text-red-400'
                }`}>
                  {attempt.result}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {attempt.sections.map((sec) => (
                <span key={sec} className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-textSecondary uppercase">
                  {sec}
                </span>
              ))}
            </div>

            {attempt.mistakeLog && (
              <div className="flex items-start gap-1 text-[9px] text-textMuted border-t border-white/5 pt-2 italic">
                <ShieldAlert className="h-3.5 w-3.5 text-accentOrange shrink-0" />
                <span>Mistake: {attempt.mistakeLog}</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
export default OAAttemptForm;
