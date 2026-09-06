import React, { useEffect } from 'react';
import { MockInterviewSession } from '../../types/mockInterview';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useDailyLogStore } from '../../app/store/useDailyLogStore';
import { getLevel } from '../../utils/xpUtils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Award, AlertTriangle } from 'lucide-react';

interface MockSessionSummaryProps {
  session: MockInterviewSession;
  onClose: () => void;
}

export const MockSessionSummary: React.FC<MockSessionSummaryProps> = ({ session, onClose }) => {
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);
  const xp = useCareerStore((s) => s.xp);
  const setCareerState = useCareerStore.setState;

  // Award XP (+100 XP) and increment mock technical or mock HR counters in daily logs!
  useEffect(() => {
    if (!session.id) return;

    const currentLog = dailyLogs[selectedDay] || {
      counts: { leetcode: 0, skillrack: 0, aptitude: 0, sql: 0, cscore: 0, german: 0, project: 0, resume: 0 },
      lcStatus: [],
      note: '',
      mood: 3,
      energy: 3,
      distractions: 0,
      focusMinutes: 0,
      status: 'not_started',
      savedAt: '',
      xpEarned: 0,
    };

    const isHr = session.sessionType.toLowerCase().includes('hr');
    const counts = currentLog.counts || { leetcode: 0, skillrack: 0, aptitude: 0, sql: 0, cscore: 0, german: 0, project: 0, resume: 0 };

    const updatedCounts = {
      ...counts,
      mockTechnical: isHr ? (counts.mockTechnical || 0) : (counts.mockTechnical || 0) + 1,
      mockHR: isHr ? (counts.mockHR || 0) + 1 : (counts.mockHR || 0),
    };

    const awardXP = 100;
    updateDailyLog(selectedDay, {
      counts: updatedCounts,
      xpEarned: (currentLog.xpEarned || 0) + awardXP,
      status: 'completed',
    });

    const newCumulativeXP = xp + awardXP;
    setCareerState({
      xp: newCumulativeXP,
      level: getLevel(newCumulativeXP).level,
    });
  }, [session.id]);

  return (
    <div className="flex flex-col gap-5 text-xs select-none max-w-lg mx-auto bg-black/45 border border-white/5 p-6 rounded-3xl">
      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
        <div className="rounded-2xl bg-accentEmerald/10 p-2.5 text-accentEmerald">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Simulator Finished</span>
          <h3 className="text-base font-black text-textPrimary mt-0.5">Mock Session Summary</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <Card className="p-3 bg-white/[0.01] border-white/5 flex flex-col gap-1">
          <span className="text-[9px] text-textMuted uppercase font-bold">Average Confidence</span>
          <span className="text-lg font-black text-accentBlue">{session.avgConfidence} / 5</span>
        </Card>
        <Card className="p-3 bg-white/[0.01] border-white/5 flex flex-col gap-1">
          <span className="text-[9px] text-textMuted uppercase font-bold">XP Awarded</span>
          <span className="text-lg font-black text-accentEmerald">+100 XP</span>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        {/* Questions attempted */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] text-textMuted uppercase font-bold tracking-wider pl-1">Questions Attempted ({session.questionsAttempted.length})</span>
          <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto scrollbar-thin">
            {session.questionsAttempted.map((q, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded-xl border border-white/5 bg-black/45">
                <span className="text-[10px] text-textSecondary font-medium truncate max-w-[200px]">{q.questionText}</span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-textPrimary font-mono">Conf: {q.confidenceScore}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Areas alert */}
        {session.weakAreas.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-xl border border-accentOrange/20 bg-accentOrange/5 p-3 text-accentOrange">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block">Identified weak categories</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {session.weakAreas.map((cat) => (
                  <Badge key={cat} variant="warning">{cat}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Recommendation */}
        <div className="rounded-xl border border-accentBlue/20 bg-accentBlue/5 p-3 text-textSecondary">
          <span className="font-bold uppercase text-[9px] text-accentBlue tracking-wider block">Shayla Coaching Suggestion</span>
          <p className="mt-1 leading-relaxed text-[10px]">{session.recommendation}</p>
        </div>
      </div>

      <Button
        onClick={onClose}
        className="w-full h-10 bg-accentBlue text-white hover:bg-accentBlue/90 rounded-xl font-black uppercase tracking-widest text-[10px] mt-2"
      >
        Close Summary
      </Button>
    </div>
  );
};
export default MockSessionSummary;
