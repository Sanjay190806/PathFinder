import React from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTodayDay } from '../../utils/dateUtils';
import { formatWeeklyProgressData } from '../../utils/chartUtils';
import { TrendingUp } from 'lucide-react';

export const WeeklyTrend: React.FC = () => {
  const userProfile = useCareerStore((s) => s.userProfile);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const currentDay = getTodayDay(userProfile.startDate);
  const weeklyData = formatWeeklyProgressData(dailyLogs, currentDay);

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Weekly Progress</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Momentum across the last seven days</h3>
        </div>
        <div className="topbar-chip text-[11px] text-textSecondary">
          <TrendingUp className="h-3.5 w-3.5 text-accentEmerald" />
          <span>Completion rate</span>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-around gap-3 pt-4">
        {weeklyData.map((data, index) => (
          <div key={index} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="relative w-full justify-center flex">
              <span className="absolute -top-7 rounded-full border border-border-subtle bg-bgSurface/90 px-2 py-0.5 text-[10px] font-semibold text-textPrimary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {data.completed}%
              </span>
            </div>
            <div
              className={`w-5 rounded-t-2xl shadow-sm transition-all duration-500 origin-bottom md:w-7 ${
                data.completed === 100 ? 'bg-accentEmerald' : data.completed > 0 ? 'bg-accentOrange' : 'bg-white/5'
              }`}
              style={{ height: `${Math.max(data.completed, 6)}%` }}
            />
            <span className="max-w-[52px] truncate text-[10px] font-medium text-textMuted">
              {data.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
