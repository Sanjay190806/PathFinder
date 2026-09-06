import React from 'react';
import { useMockInterviewOS } from '../../hooks/useMockInterviewOS';
import { Card } from '../ui/Card';
import { Calendar } from 'lucide-react';

export const SpeakingConfidenceTracker: React.FC = () => {
  const { speakingLogs } = useMockInterviewOS();

  return (
    <div className="flex flex-col gap-3 text-xs select-none">
      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider pl-1">Practice Drill Logs History</span>

      {speakingLogs.length === 0 ? (
        <p className="text-xs text-textMuted text-center py-6 bg-white/[0.01] border border-white/5 rounded-2xl">
          No speaking drills logged yet. Record your first pitch practice!
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {speakingLogs.map((log) => {
            const dateStr = new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return (
              <Card key={log.id} className="p-3 border-white/5 bg-black/45 hover:border-white/10 transition flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-black text-textPrimary truncate">{log.topic}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-[9px] text-textMuted">
                      <Calendar className="h-3.5 w-3.5" />
                      {dateStr}
                    </span>
                    {log.speakingPaceNotes && (
                      <span className="text-[9px] text-textMuted truncate max-w-[200px]">| Pacing: {log.speakingPaceNotes}</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-accentBlue">{log.overallScore}%</span>
                    <span className="text-[8px] text-textMuted uppercase tracking-wider font-bold">Clarity Rating</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default SpeakingConfidenceTracker;
