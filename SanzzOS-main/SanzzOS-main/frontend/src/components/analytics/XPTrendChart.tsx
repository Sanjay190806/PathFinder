import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';

export const XPTrendChart: React.FC = () => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs || {});

  // Calculate cumulative XP across logged days
  const chartData = useMemo(() => {
    let runningXP = 0;
    const dataPoints: { day: number; xp: number }[] = [];

    // Sort days numerically
    const sortedDays = Object.keys(dailyLogs)
      .map(Number)
      .sort((a, b) => a - b);

    if (sortedDays.length === 0) {
      // Return empty series placeholder
      return Array.from({ length: 7 }, (_, i) => ({ day: i + 1, xp: 0 }));
    }

    sortedDays.forEach((day) => {
      const log = dailyLogs[day];
      const xpEarned = log?.xpEarned || 0;
      runningXP += xpEarned;
      dataPoints.push({ day, xp: runningXP });
    });

    // Make sure we have at least 2 data points for a line
    if (dataPoints.length === 1) {
      dataPoints.unshift({ day: 0, xp: 0 });
    }

    return dataPoints;
  }, [dailyLogs]);

  // SVG Chart bounds
  const width = 500;
  const height = 150;
  const padding = 20;

  const minX = chartData[0]?.day || 0;
  const maxX = chartData[chartData.length - 1]?.day || 7;
  const minY = 0;
  const maxY = Math.max(100, Math.max(...chartData.map((d) => d.xp)) * 1.15);

  const getX = (val: number) => padding + ((val - minX) / (maxX - minX)) * (width - padding * 2);
  const getY = (val: number) => height - padding - ((val - minY) / (maxY - minY)) * (height - padding * 2);

  // Build SVG Path points
  const pointsStr = chartData.map((d) => `${getX(d.day)},${getY(d.xp)}`).join(' ');
  const fillPointsStr = `${getX(minX)},${height - padding} ${pointsStr} ${getX(maxX)},${height - padding}`;

  const currentTotalXP = chartData[chartData.length - 1]?.xp || 0;

  return (
    <Card className="flex flex-col gap-4 relative overflow-hidden"
      style={{ border: '1px solid rgba(249,115,22,0.15)', background: 'rgba(15,8,0,0.8)' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🍥</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
            XP Power Accumulation Curve
          </span>
        </div>
        <div className="text-[10px] font-black font-mono text-orange-400">
          Power: {currentTotalXP.toLocaleString()} XP
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden py-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={getY(minY)} x2={width - padding} y2={getY(minY)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
          <line x1={padding} y1={getY(maxY / 2)} x2={width - padding} y2={getY(maxY / 2)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
          <line x1={padding} y1={getY(maxY)} x2={width - padding} y2={getY(maxY)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />

          {/* Fill under the line */}
          <polygon points={fillPointsStr} fill="url(#xpGradient)" />

          {/* Trend line */}
          <polyline
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            points={pointsStr}
            style={{ filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.4))' }}
          />

          {/* Interactive dots */}
          {chartData.map((d, idx) => (
            <g key={idx} className="group/dot cursor-pointer">
              <circle
                cx={getX(d.day)}
                cy={getY(d.xp)}
                r="3.5"
                fill="#f97316"
                stroke="#000"
                strokeWidth="1"
                className="transition-all duration-200 hover:r-6 hover:fill-white"
              />
              <title>{`Day ${d.day}: ${d.xp} Total XP`}</title>
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
};
export default XPTrendChart;
