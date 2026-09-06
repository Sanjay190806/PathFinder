import React, { useMemo } from 'react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useUIStore } from '../../app/store/useUIStore';
import { getTotalLCSolved } from '../../utils/xpUtils';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

export const WeeklyReviewDashboard: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);
  const currentDay = useUIStore((s) => s.currentDay);

  const review = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => currentDay - (6 - index)).filter((day) => day > 0);
    const logs = days.map((day) => ({ day, log: careerState.dailyLogs[day] }));
    const completed = logs.filter(({ log }) => log?.status === 'completed' || log?.completionType === 'perfect' || log?.completionType === 'minimum');
    const missed = logs.filter(({ log }) => !log || log.status === 'missed' || log.status === 'not_started');
    const focusMinutes = logs.reduce((sum, { log }) => sum + (log?.focusMinutes || 0), 0);
    const dsaCount = logs.reduce((sum, { log }) => sum + (log?.counts?.leetcode || 0), 0);
    const germanMinutes = logs.reduce((sum, { log }) => sum + (log?.counts?.german || 0), 0);
    const highLoadDays = logs.filter(({ log }) => (log?.focusMinutes || 0) > 180).length;
    const lowEnergyDays = logs.filter(({ log }) => (log?.energy || 3) <= 2).length;
    const noRestDays = logs.length >= 7 && logs.every(({ log }) => (log?.focusMinutes || 0) > 30);
    const completionTrend = Math.round((completed.length / Math.max(1, logs.length)) * 100);
    const dsaSolved = getTotalLCSolved(careerState);
    const applications = careerState.applications?.length || 0;
    const readinessMovement = Math.min(100, Math.round(dsaSolved * 0.12 + applications * 4 + (careerState.resume?.atsScore || 0) * 0.25));
    const burnoutSignals = [
      ...(missed.length >= 3 ? ['Too many missed tasks this week'] : []),
      ...(highLoadDays >= 3 ? ['Too many high-load days'] : []),
      ...(noRestDays ? ['No rest day detected'] : []),
      ...(completionTrend < 45 ? ['Low completion trend'] : []),
      ...(lowEnergyDays >= 2 ? ['Low energy repeated'] : []),
    ];
    const momentumScore = Math.min(100, Math.round(completionTrend * 0.35 + Math.min(100, dsaCount * 10) * 0.2 + Math.min(100, applications * 8) * 0.2 + Math.min(100, focusMinutes / 6) * 0.15 + (burnoutSignals.length ? 45 : 80) * 0.1));

    return {
      wins: completed.length,
      missed: missed.length,
      focusHours: Number((focusMinutes / 60).toFixed(1)),
      dsaCount,
      germanMinutes,
      applications,
      readinessMovement,
      burnoutSignals,
      momentumScore,
      nextWeekPriorities: [
        dsaCount < 5 ? 'Solve 5 focused DSA problems' : 'Keep DSA rhythm stable',
        applications < 3 ? 'Add or update 3 company applications' : 'Follow up with active companies',
        germanMinutes < 90 ? 'Complete 90 German minutes' : 'Practice German speaking prompts',
      ],
    };
  }, [careerState, currentDay]);

  const switchRecovery = () => {
    updateDailyLog(currentDay, { status: 'recovery', focusMinutes: 15, note: 'Recovery day suggested by weekly burnout signals.' } as any);
  };

  return (
    <Card className="p-5" style={{ border: '1px solid rgba(34,197,94,0.14)', background: 'rgba(0,16,10,0.72)' }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-textMuted">Weekly Review Dashboard</p>
          <h3 className="mt-1 text-xl font-black text-textPrimary">Wins, misses, burnout, momentum</h3>
        </div>
        <Badge variant={review.burnoutSignals.length ? 'warning' : 'success'}>{review.burnoutSignals.length ? 'Watch load' : 'Stable'}</Badge>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Metric label="Wins" value={review.wins} />
        <Metric label="Missed goals" value={review.missed} />
        <Metric label="Focus hours" value={review.focusHours} />
        <Metric label="DSA count" value={review.dsaCount} />
        <Metric label="German min" value={review.germanMinutes} />
        <Metric label="Applications" value={review.applications} />
        <Metric label="Readiness move" value={`${review.readinessMovement}%`} />
        <Metric label="Momentum" value={`${review.momentumScore}%`} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Momentum score</p>
          <div className="mt-3"><ProgressBar value={review.momentumScore} color="#22c55e" /></div>
          <p className="mt-2 text-xs text-textSecondary">Blends consistency, skill progress, placement actions, learning depth, and routine health.</p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Burnout signals</p>
          <div className="mt-3 grid gap-2">
            {review.burnoutSignals.length ? review.burnoutSignals.map((signal) => <Badge key={signal} variant="warning">{signal}</Badge>) : <Badge variant="success">No major burnout signal</Badge>}
          </div>
          {review.burnoutSignals.length > 0 && <Button size="sm" variant="outline" className="mt-3 h-8 text-xs" onClick={switchRecovery}>Switch to Recovery Day</Button>}
        </div>
        <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Next week priorities</p>
          <div className="mt-3 grid gap-2">
            {review.nextWeekPriorities.map((priority) => <p key={priority} className="text-sm text-textSecondary">{priority}</p>)}
          </div>
        </div>
      </div>
    </Card>
  );
};

const Metric: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
    <p className="text-[10px] uppercase tracking-widest text-textMuted">{label}</p>
    <p className="mt-1 text-lg font-black text-textPrimary">{value}</p>
  </div>
);
