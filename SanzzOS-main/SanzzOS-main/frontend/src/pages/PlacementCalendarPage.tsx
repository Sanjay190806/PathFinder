import React, { useState, useMemo } from 'react';
import { useCareerStore } from '../app/store/useCareerStore';
import { useDailyLogStore } from '../app/store/useDailyLogStore';
import { getTodayDay } from '../utils/dateUtils';
import { navigateToPath } from '../utils/navigation';
import { PLACEMENT_PLAN_DATA, PlacementDayPlan } from '../data/placementCalendar';
import { PlacementCalendarFilters } from '../components/placement-calendar/PlacementCalendarFilters';
import { PlacementCalendarGrid } from '../components/placement-calendar/PlacementCalendarGrid';
import { PlacementDayDrawer } from '../components/placement-calendar/PlacementDayDrawer';
import { CalendarFilters } from '../types/placementCalendar';
import { getCompletionType } from '../utils/placementCalendarUtils';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PhaseProgressCard } from '../components/placement-calendar/PhaseProgressCard';
import { Button } from '../components/ui/Button';

export const PlacementCalendarPage: React.FC = () => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);
  const startDate = useCareerStore((s) => s.userProfile.startDate);
  
  const todayDay = useMemo(() => getTodayDay(startDate), [startDate]);
  const setSelectedDayInStore = useDailyLogStore((s) => s.setSelectedDay);

  const handleGoToToday = () => {
    setSelectedDayInStore(todayDay);
    navigateToPath('/today');
  };

  const [filters, setFilters] = useState<CalendarFilters>({
    phase: 'all',
    keyword: '',
    status: 'all'
  });

  const [selectedDay, setSelectedDay] = useState<PlacementDayPlan | null>(null);

  // Filter plans based on search parameters
  const filteredDays = useMemo(() => {
    return PLACEMENT_PLAN_DATA.filter((day) => {
      // 1. Phase Filter
      if (filters.phase !== 'all' && day.phase !== filters.phase) return false;

      // 2. Keyword Filter
      if (filters.keyword.trim()) {
        const query = filters.keyword.toLowerCase();
        const matchesTitle = day.title.toLowerCase().includes(query);
        const matchesFocus = day.focus.toLowerCase().includes(query);
        const matchesTasks = day.tasks.some(t => t.toLowerCase().includes(query));
        const matchesProblems = day.leetcode && day.leetcode.some(p => p.name.toLowerCase().includes(query) || String(p.id).includes(query));
        
        if (!matchesTitle && !matchesFocus && !matchesTasks && !matchesProblems) {
          return false;
        }
      }

      // 3. Status Filter
      if (filters.status !== 'all') {
        const log = dailyLogs[day.day];
        const status = getCompletionType(log, day.day, todayDay);
        if (status !== filters.status) return false;
      }

      return true;
    });
  }, [filters, dailyLogs, todayDay]);

  // Aggregate completion counts
  const stats = useMemo(() => {
    let perfect = 0;
    let minimum = 0;
    let partial = 0;
    let missed = 0;
    let freeze = 0;

    PLACEMENT_PLAN_DATA.forEach((day) => {
      if (day.day > todayDay) return;
      const log = dailyLogs[day.day];
      const type = getCompletionType(log, day.day, todayDay);
      if (type === 'perfect') perfect++;
      else if (type === 'minimum') minimum++;
      else if (type === 'partial') partial++;
      else if (type === 'freeze') freeze++;
      else if (type === 'missed') missed++;
    });

    const totalTracked = perfect + minimum + partial + missed + freeze;
    const completed = perfect + minimum + partial;

    return { perfect, minimum, partial, missed, freeze, completed, totalTracked };
  }, [dailyLogs, todayDay]);

  return (
    <div className="fade-in flex flex-col gap-6 pb-6 select-none h-full min-h-0 relative z-10">
      <SectionHeader
        title="Placement Execution Roadmap"
        subtitle="Dynamic 180-day milestone execution roadmap mapping every focus topic, Java DSA target, aptitude task, and your custom study materials."
      />

      {/* Stats Quick-Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-bgCard border border-border-subtle p-4 rounded-2xl">
          <span className="block text-[9px] font-bold text-textMuted uppercase tracking-wider">Perfect Days</span>
          <span className="block text-xl font-black text-yellow-400 mt-1">{stats.perfect}</span>
        </div>
        <div className="bg-bgCard border border-border-subtle p-4 rounded-2xl">
          <span className="block text-[9px] font-bold text-textMuted uppercase tracking-wider">Minimum Days</span>
          <span className="block text-xl font-black text-emerald-400 mt-1">{stats.minimum}</span>
        </div>
        <div className="bg-bgCard border border-border-subtle p-4 rounded-2xl">
          <span className="block text-[9px] font-bold text-textMuted uppercase tracking-wider">Partial Days</span>
          <span className="block text-xl font-black text-blue-400 mt-1">{stats.partial}</span>
        </div>
        <div className="bg-bgCard border border-border-subtle p-4 rounded-2xl">
          <span className="block text-[9px] font-bold text-textMuted uppercase tracking-wider">Freezes Used</span>
          <span className="block text-xl font-black text-sky-400 mt-1">{stats.freeze}</span>
        </div>
        <div className="bg-bgCard border border-border-subtle p-4 rounded-2xl col-span-2 md:col-span-1">
          <span className="block text-[9px] font-bold text-textMuted uppercase tracking-wider">Missed Days</span>
          <span className="block text-xl font-black text-red-400 mt-1">{stats.missed}</span>
        </div>
      </div>

      <PhaseProgressCard />

      {/* Status Legend & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-border-subtle/50 bg-bgCard/60 rounded-3xl shrink-0">
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-textSecondary select-none">
          <span className="text-[9px] text-textMuted font-semibold tracking-normal">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <span>Perfect Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Minimum Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>Partial Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            <span>Streak Freeze</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span>Missed Day</span>
          </div>
        </div>

        <Button
          onClick={handleGoToToday}
          className="rounded-xl text-xs px-4 py-2 gap-2 bg-accentBlue text-white hover:bg-accentBlue/90 transition shadow-glow-blue/10 shrink-0"
        >
          Go to Today (Day {todayDay}) →
        </Button>
      </div>

      {/* Search & Filters */}
      <PlacementCalendarFilters filters={filters} onChange={setFilters} />

      {/* Calendar Grid Container */}
      <div className="flex-1 overflow-y-auto">
        <PlacementCalendarGrid
          filteredDays={filteredDays}
          dailyLogs={dailyLogs}
          todayDay={todayDay}
          onDayClick={setSelectedDay}
          getCompletionType={getCompletionType}
        />
      </div>

      {/* Drawer detailed overlay */}
      <PlacementDayDrawer
        dayPlan={selectedDay}
        log={selectedDay ? dailyLogs[selectedDay.day] : undefined}
        onClose={() => setSelectedDay(null)}
        onUpdateLog={updateDailyLog}
      />
    </div>
  );
};
