import React from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';
import { CalendarDays } from 'lucide-react';
import { getTodayDay } from '../../utils/dateUtils';

export const JourneyHeatmap: React.FC = () => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const userProfile = useCareerStore((s) => s.userProfile);
  const todayDay = getTodayDay(userProfile.startDate);
  const cells = Array.from({ length: 184 }, (_, i) => i + 1); // 184 days total

  const getCellColorClass = (day: number) => {
    const log = dailyLogs[day];
    
    // Future cells
    if (day > todayDay) {
      return 'bg-white/[0.02] border-white/5 opacity-30 hover:opacity-55';
    }

    if (!log) {
      // Past day with no log -> Missed
      if (day < todayDay) {
        return 'bg-red-500/10 border-red-500/20 hover:bg-red-500/25';
      }
      // Today (unlogged)
      return 'bg-white/5 border border-white/10 hover:border-white/20 animate-pulse';
    }

    if (log.freezeUsed) {
      return 'bg-accentBlue border-accentBlue/40 shadow-glow-blue';
    }

    if (log.completionType === 'perfect') {
      return 'bg-accentGold border-accentGold/40 shadow-glow-yellow';
    }

    if (log.completionType === 'minimum' || log.status === 'completed') {
      // Show density based on XP
      const xp = log.xpEarned || 0;
      if (xp >= 200) return 'bg-accentEmerald border-accentEmerald/50 shadow-glow-emerald';
      return 'bg-accentEmerald/80 border-accentEmerald/30';
    }

    if (log.status === 'partial') {
      return 'bg-accentOrange/80 border-accentOrange/40';
    }

    if (log.status === 'missed') {
      return 'bg-red-500/20 border-red-500/30';
    }

    return 'bg-white/[0.04] border-white/5';
  };

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Journey Heatmap</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">184-day placement timeline</h3>
        </div>
        <div className="topbar-chip text-[11px] text-textSecondary flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5 text-accentBlue" />
          <span>Perfect / Min / Freeze / Missed</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid min-w-[320px] gap-1.5" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
          {cells.map((day) => {
            const log = dailyLogs[day];
            const dateObj = new Date(userProfile.startDate);
            dateObj.setDate(dateObj.getDate() + (day - 1));
            const dateStr = dateObj.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

            let tooltip = `Day ${day} (${dateStr})\nStatus: Not Started\nXP: 0 XP`;
            if (day > todayDay) {
              tooltip = `Day ${day} (${dateStr})\nStatus: Future`;
            } else if (day === todayDay && !log) {
              tooltip = `Day ${day} (${dateStr})\nStatus: Today (Pending)\nXP: 0 XP`;
            } else if (log) {
              const status = log.freezeUsed
                ? 'Frozen'
                : log.completionType === 'perfect'
                ? 'Perfect Day'
                : log.completionType === 'minimum'
                ? 'Minimum Day'
                : log.status === 'partial'
                ? 'Partial Work'
                : 'Missed';
              
              const counts = log.counts || { leetcode: 0, skillrack: 0, aptitude: 0, sql: 0, cscore: 0, german: 0, project: 0, resume: 0 };
              
              tooltip = [
                `Day ${day} (${dateStr})`,
                `Status: ${status}`,
                `XP: +${log.xpEarned || 0} XP`,
                `--------------------`,
                `LeetCode: ${counts.leetcode || 0} solved`,
                `SkillRack: ${counts.skillrack || 0} solved`,
                `Aptitude: ${counts.aptitude || 0} min`,
                `SQL: ${counts.sql || 0} min`,
                `CS Core: ${counts.cscore || 0} topics`,
                `German: ${counts.german || 0} min`,
                `--------------------`,
                `Note: "${log.note || 'No note written'}"`
              ].join('\n');
            } else if (day < todayDay) {
              tooltip = `Day ${day} (${dateStr})\nStatus: Missed (No work logged)\nXP: 0 XP`;
            }

            return (
              <div
                key={day}
                title={tooltip}
                aria-label={tooltip}
                className={`aspect-square cursor-pointer rounded-[6px] transition-all duration-200 ${getCellColorClass(day)}`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3.5 border-t border-border-subtle/50 pt-3 text-[10px] text-textMuted">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-[3px] bg-white/[0.02] border border-white/5 opacity-30" />
          <span>Future</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-[3px] bg-accentOrange/80" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-[3px] bg-accentEmerald/80" />
          <span>Min Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-[3px] bg-accentGold" />
          <span>Perfect Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-[3px] bg-accentBlue" />
          <span>Frozen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-[3px] bg-red-500/20 border border-red-500/30" />
          <span>Missed</span>
        </div>
      </div>
    </Card>
  );
};
