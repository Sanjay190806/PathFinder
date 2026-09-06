import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DailyLog } from '../../types';
import { ROADMAP } from '../../data/roadmap';

interface DayInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  log: DailyLog | null;
  dateStr: string;
}

export const DayInspector: React.FC<DayInspectorProps> = ({
  isOpen,
  onClose,
  day,
  log,
  dateStr
}) => {
  if (!isOpen) return null;

  const todayProblems = ROADMAP[String(day)] || [];
  const topic = todayProblems[0]?.topic || "Revision Focus";

  const getStatusVariant = (status: string) => {
    if (status === 'completed') return 'success';
    if (status === 'partial') return 'warning';
    if (status === 'missed') return 'danger';
    return 'neutral';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none">
      <Card className="w-full max-w-md p-6 border border-border-subtle bg-bgSurface/95">
        <div className="flex justify-between items-center border-b border-border-subtle/50 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-textPrimary uppercase tracking-wider">Day {day} Reflection</h3>
            <span className="text-[10px] text-textMuted font-mono block mt-0.5">{dateStr}</span>
          </div>
          {log && <Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>}
        </div>

        {!log ? (
          <div className="text-center py-8 text-xs text-textSecondary flex flex-col items-center gap-2">
            <span>📭</span>
            <span>No study reflection recorded for this day.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-xs text-textSecondary">
            {/* Topic details */}
            <div className="bg-bgSurface/40 border border-border-subtle p-3 rounded-xl flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-textMuted font-bold block">Topic syllabus</span>
                <span className="text-xs font-bold text-textPrimary">{topic}</span>
              </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-bgSurface/20 border border-border-subtle/55 p-3 rounded-xl">
              <div>
                <span className="text-textMuted block uppercase text-[9px] font-bold">LeetCode Solved</span>
                <span className="font-bold text-textPrimary font-mono text-sm">{log.lcStatus?.length || 0} problems</span>
              </div>
              <div>
                <span className="text-textMuted block uppercase text-[9px] font-bold">Focus Study Time</span>
                <span className="font-bold text-textPrimary font-mono text-sm">{log.focusMinutes || 0} minutes</span>
              </div>
            </div>

            {/* Mood Energy */}
            <div className="flex justify-around items-center bg-bgSurface/20 border border-border-subtle/55 p-2 rounded-xl text-center">
              <div>
                <span className="text-[9px] text-textMuted uppercase font-bold block mb-1">Mood</span>
                <span className="text-base">
                  {['😴', '😐', '🙂', '😊', '🔥'][(log.mood || 3) - 1]}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-textMuted uppercase font-bold block mb-1">Energy</span>
                <span className="font-bold text-textPrimary font-mono text-xs">{log.energy || 3}/5</span>
              </div>
              <div>
                <span className="text-[9px] text-textMuted uppercase font-bold block mb-1">XP Earned</span>
                <span className="font-bold text-accentOrange font-mono text-xs">+{log.xpEarned || 0} XP</span>
              </div>
            </div>

            {/* Reflection Note */}
            <div>
              <span className="text-[9px] text-textMuted uppercase font-bold block mb-1 pl-0.5">Reflection Notes</span>
              <p className="p-3 bg-bgSurface/40 border border-border-subtle rounded-xl leading-relaxed text-textPrimary text-[11px] min-h-[60px] max-h-[100px] overflow-y-auto">
                {log.note || "No notes logged for today."}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-border-subtle/50 mt-4">
          <Button onClick={onClose} className="w-full rounded-xl">Close Inspector</Button>
        </div>
      </Card>
    </div>
  );
};
