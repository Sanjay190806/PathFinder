import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { RoadmapProblem } from '../../types';
import { getPhaseName, getDateForDay, formatDate } from '../../utils/dateUtils';
import { getTopicColor } from '../../utils/colorUtils';
import { useCareerStore } from '../../app/store/useCareerStore';

interface RoadmapDayCardProps {
  day: number;
  startDate: string;
  problems: RoadmapProblem[];
  onProblemClick: (prob: RoadmapProblem, index: number) => void;
}

export const RoadmapDayCard: React.FC<RoadmapDayCardProps> = ({
  day,
  startDate,
  problems,
  onProblemClick
}) => {
  const problemLogs = useCareerStore((s) => s.problemLogs);
  
  const dateObj = getDateForDay(day, startDate);
  const dateStr = formatDate(dateObj);
  const phase = getPhaseName(day);
  const topic = problems[0]?.topic || "Revision Phase";
  const topicColor = getTopicColor(topic);

  // Compute solved problems counts
  const solvedCount = problems.reduce((count, _, idx) => {
    const key = `d_${day}_${idx}`;
    return count + (problemLogs[key]?.solved ? 1 : 0);
  }, 0);

  const getDiffColor = (diff: string) => {
    if (diff === 'Easy') return 'success';
    if (diff === 'Medium') return 'warning';
    return 'danger';
  };

  return (
    <Card hoverable className="flex flex-col gap-4 border-l-4" style={{ borderLeftColor: topicColor }}>
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-textPrimary">Day {day}</span>
            <Badge variant="neutral">{phase}</Badge>
          </div>
          <span className="text-[10px] text-textSecondary mt-0.5 block">{dateStr}</span>
        </div>
        
        <Badge variant={solvedCount === problems.length && problems.length > 0 ? "success" : "neutral"}>
          {solvedCount}/{problems.length} solved
        </Badge>
      </div>

      {/* Problems list */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle/50">
        {problems.map((p, idx) => {
          const isSolved = problemLogs[`d_${day}_${idx}`]?.solved;
          return (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                onProblemClick(p, idx);
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-bgSurface/40 border border-border-subtle hover:border-border-accent hover:bg-bgSurface/80 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className={`w-3.5 h-3.5 rounded-full border border-border-subtle flex items-center justify-center text-[8px] ${
                  isSolved ? 'bg-accentEmerald border-accentEmerald text-white font-bold' : ''
                }`}>
                  {isSolved && '✓'}
                </div>
                <span className={`text-xs font-semibold truncate ${isSolved ? 'text-textSecondary line-through' : 'text-textPrimary'}`}>
                  {p.title}
                </span>
              </div>
              <Badge variant={getDiffColor(p.difficulty)} className="shrink-0">{p.difficulty}</Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
