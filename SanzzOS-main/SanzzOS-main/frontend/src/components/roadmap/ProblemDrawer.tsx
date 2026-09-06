import React from 'react';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { RoadmapProblem, ProblemLog } from '../../types';
import { useCareerStore } from '../../app/store/useCareerStore';
import { ShaylaPromptButton } from '../ai/ShaylaPromptButton';

interface ProblemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  problem: RoadmapProblem;
  day: number;
  problemIndex: number;
}

export const ProblemDrawer: React.FC<ProblemDrawerProps> = ({
  isOpen,
  onClose,
  problem,
  day,
  problemIndex
}) => {
  const problemLogs = useCareerStore((s) => s.problemLogs);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const updateProblemLog = useCareerStore((s) => s.updateProblemLog);
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);

  const logKey = `d_${day}_${problemIndex}`;
  const log: ProblemLog = problemLogs[logKey] || {
    solved: false,
    confidence: 3,
    solveTime: 0,
    attempts: 0,
    notes: '',
    mistakeLog: '',
    revisitFlag: false
  };

  const dayLog = dailyLogs[day] || { lcStatus: [], counts: { leetcode: 0 } };

  const handleSolvedToggle = (val: boolean) => {
    updateProblemLog(logKey, { solved: val });

    let newLcStatus = [...(dayLog.lcStatus || [])];
    if (val) {
      if (!newLcStatus.includes(problemIndex)) newLcStatus.push(problemIndex);
    } else {
      newLcStatus = newLcStatus.filter(idx => idx !== problemIndex);
    }

    updateDailyLog(day, {
      lcStatus: newLcStatus,
      counts: {
        ...(dayLog.counts || {}),
        leetcode: newLcStatus.length
      } as any
    });
  };

  const getDiffColor = (diff: string) => {
    if (diff === 'Easy') return 'success';
    if (diff === 'Medium') return 'warning';
    return 'danger';
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Day ${day} • Problem Details`}>
      <div className="flex flex-col gap-6 select-none">
        {/* Title Section */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-textMuted font-mono">#{problem.number}</span>
            <h4 className="text-lg font-bold text-textPrimary leading-tight">{problem.title}</h4>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant={getDiffColor(problem.difficulty)}>{problem.difficulty}</Badge>
            <Badge variant="primary">{problem.topic}</Badge>
          </div>
        </div>

        {/* Solver Toggles */}
        <div className="bg-bgSurface/60 border border-border-subtle p-4 rounded-xl flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-textPrimary">Solved Status</span>
            <span className="text-[10px] text-textSecondary block mt-0.5">Toggle to sync overall progress stats</span>
          </div>
          <input
            type="checkbox"
            checked={log.solved}
            onChange={(e) => handleSolvedToggle(e.target.checked)}
            className="w-5 h-5 rounded-md border-border-subtle bg-bgSurface text-accentBlue focus:ring-accentBlue/30 focus:ring-1 transition cursor-pointer shrink-0"
          />
        </div>

        {/* Java Intuition Helper approach */}
        <div>
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block mb-2 pl-0.5">DSA Pattern & Context</span>
          <div className="p-4 bg-bgSurface/40 border border-border-subtle rounded-xl text-xs flex flex-col gap-2">
            <p className="font-semibold text-accentBlue">Pattern: {problem.pattern}</p>
            <p className="text-textSecondary leading-relaxed mt-1">
              For this problem, {problem.pattern} is optimal. In Java, this maps to using standard structures like HashMap or Arrays. Keep track of index limits carefully to avoid Off-By-One errors.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bgSurface/40 p-4">
          <span className="mb-3 block text-[10px] font-bold uppercase tracking-wider text-textSecondary">Ask Shayla AI Mentor</span>
          <div className="grid gap-2">
            <ShaylaPromptButton
              prompt={`Help me understand this roadmap problem: Day ${day}, ${problem.title}. Explain the pattern ${problem.pattern} in Java only. Give intuition, complexity, and mistakes to avoid.`}
              variant="outline"
            >
              Ask Shayla about selected problem
            </ShaylaPromptButton>
            <ShaylaPromptButton
              prompt={`Explain the DSA pattern ${problem.pattern} for ${problem.title}. Use Java only and keep it interview-focused.`}
              variant="ghost"
            >
              Explain pattern in Java
            </ShaylaPromptButton>
            <ShaylaPromptButton
              prompt={`Give me a hint only for ${problem.title}. Do not reveal the full solution. Use Java-oriented reasoning.`}
              variant="ghost"
            >
              Give hint only
            </ShaylaPromptButton>
          </div>
        </div>

        {/* Solved fields logs */}
        {log.solved && (
          <div className="flex flex-col gap-4 border-t border-border-subtle/50 pt-4 fade-in">
            {/* Confidence */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-textSecondary uppercase pl-0.5">Confidence Rating (1-5)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={log.confidence}
                  onChange={(e) => updateProblemLog(logKey, { confidence: parseInt(e.target.value) })}
                  className="w-full h-1 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-accentBlue"
                />
                <span className="text-xs font-bold text-textPrimary font-mono w-4">{log.confidence}</span>
              </div>
            </div>

            {/* Revisit Toggles */}
            <div className="flex items-center justify-between gap-4 p-3 bg-bgSurface/40 border border-border-subtle rounded-xl text-xs">
              <div>
                <span className="font-bold text-textPrimary">Flag for Revision</span>
                <span className="text-[10px] text-textSecondary block mt-0.5">Marks this problem for revision later</span>
              </div>
              <input
                type="checkbox"
                checked={log.revisitFlag}
                onChange={(e) => updateProblemLog(logKey, { revisitFlag: e.target.checked })}
                className="w-4 h-4 rounded-md border-border-subtle bg-bgSurface text-accentBlue focus:ring-accentBlue/30 cursor-pointer"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-textSecondary uppercase pl-0.5">Mistake Logs / Approach Notes</label>
              <textarea
                placeholder="Note down any complexities, bottlenecks, or Java reference syntax here..."
                value={log.notes}
                onChange={(e) => updateProblemLog(logKey, { notes: e.target.value, mistakeLog: e.target.value })}
                className="w-full bg-bgSurface border border-border-subtle text-textPrimary text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-accentBlue h-28 resize-none"
              />
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border-subtle/50 flex gap-2">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-accentBlue text-white hover:bg-blue-600 text-xs font-bold rounded-xl text-center shadow-glow-blue transition"
          >
            Solve on LeetCode ↗
          </a>
        </div>
      </div>
    </Drawer>
  );
};
