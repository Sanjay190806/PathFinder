import React from 'react';
import { useMockInterviewOS } from '../../hooks/useMockInterviewOS';
import { Card } from '../ui/Card';
import { TrendingUp } from 'lucide-react';

export const CommunicationTrendPanel: React.FC = () => {
  const { speakingLogs } = useMockInterviewOS();

  const averageScores = React.useMemo(() => {
    if (speakingLogs.length === 0) return { overall: 70, pace: 'Normal', drillCount: 0 };
    const sum = speakingLogs.reduce((total, log) => total + log.overallScore, 0);
    return {
      overall: Math.round(sum / speakingLogs.length),
      drillCount: speakingLogs.length,
      pace: speakingLogs[0]?.speakingPaceNotes || 'Balanced',
    };
  }, [speakingLogs]);

  return (
    <Card className="p-4 border-white/5 bg-[#0a0a1a]/55 flex flex-col gap-3 select-none">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <TrendingUp className="h-4.5 w-4.5 text-accentBlue" />
        <span className="text-[10px] font-black uppercase tracking-wider text-textPrimary">Speaking Metrics Trend</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1 text-center">
        <div className="p-3 bg-black/45 border border-white/5 rounded-2xl flex flex-col gap-0.5">
          <span className="text-[8px] text-textMuted uppercase font-bold">Averaged Score</span>
          <span className="text-base font-black text-accentBlue mt-0.5">{averageScores.overall}%</span>
        </div>
        <div className="p-3 bg-black/45 border border-white/5 rounded-2xl flex flex-col gap-0.5">
          <span className="text-[8px] text-textMuted uppercase font-bold">Total Drills</span>
          <span className="text-base font-black text-accentEmerald mt-0.5">{averageScores.drillCount} Logs</span>
        </div>
      </div>

      {speakingLogs.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-2">
          <span className="text-[9px] text-textMuted uppercase font-bold tracking-wider pl-1">Recent speaking progression</span>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
            {speakingLogs.slice(0, 5).reverse().map((log, idx) => (
              <div
                key={log.id}
                className="h-full bg-accentBlue border-r border-[#0a0a1a]"
                style={{ width: '20%', opacity: 0.4 + idx * 0.15 }}
                title={`Drill ${idx + 1}: ${log.overallScore}%`}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
export default CommunicationTrendPanel;
