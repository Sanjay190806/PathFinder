import React, { useState, useMemo, useEffect } from 'react';
import { useDailyLogStore } from '../../app/store/useDailyLogStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useCalendarStore } from '../../app/store/useCalendarStore';
import { useNotificationStore } from '../../app/store/useNotificationStore';
import { DailyLog } from '../../types';
import { getDateForDay } from '../../utils/dateUtils';
import { canUseFreeze, getFreezesLeftForWeek } from '../../utils/streakFreezeUtils';
import { awardXPForLog, getLevel, getStreak } from '../../utils/xpUtils';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Flame,
  Snowflake,
  ShieldCheck,
  Zap,
  Clock,
  BookOpen,
  Calendar,
  BookOpenCheck,
  X,
  Sparkles
} from 'lucide-react';

import { agendaGenerator } from '../../utils/agendaGenerator';

export const TodayCommandCenter: React.FC = () => {
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);
  const useStreakFreeze = useCareerStore((s) => s.useStreakFreeze);
  const weeklyFreezeUsage = useCareerStore((s) => s.weeklyFreezeUsage || {});
  const xp = useCareerStore((s) => s.xp);
  const userProfile = useCareerStore((s) => s.userProfile);
  const setCareerState = useCareerStore.setState;
  const calendarEvents = useCalendarStore((s) => s.events);
  const notificationStore = useNotificationStore();

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
    freezeUsed: false,
    freezeReason: '',
    completionType: 'missed',
  };

  const currentCounts = currentLog.counts || { leetcode: 0, skillrack: 0, aptitude: 0, sql: 0, cscore: 0, german: 0, project: 0, resume: 0 };

  const [reflectionText, setReflectionText] = useState(currentLog.note || '');
  const [freezeReasonText, setFreezeReasonText] = useState(currentLog.freezeReason || '');

  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeConfirmText, setFreezeConfirmText] = useState('');
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebrationDetails, setCelebrationDetails] = useState<{ type: string; xp: number } | null>(null);

  // Generate and save agenda for selectedDay if it doesn't exist
  useEffect(() => {
    if (!notificationStore.agendas[selectedDay]) {
      const state = useCareerStore.getState();
      const generated = agendaGenerator.generateAgenda(selectedDay, state);
      notificationStore.saveDailyAgenda(selectedDay, generated);
    }
  }, [selectedDay, notificationStore.agendas]);

  const activeAgenda = useMemo(() => {
    return notificationStore.agendas[selectedDay] || null;
  }, [notificationStore.agendas, selectedDay]);

  // 1. Filter scheduled events for today
  const todayDateStr = useMemo(() => {
    const d = getDateForDay(selectedDay, userProfile.startDate);
    return d.toISOString().substring(0, 10);
  }, [selectedDay, userProfile.startDate]);

  const todayEvents = useMemo(() => {
    return calendarEvents.filter((evt) => evt.start.substring(0, 10) === todayDateStr);
  }, [calendarEvents, todayDateStr]);

  // Sum up durations for remaining time estimate
  const totalTimeEstimateMins = useMemo(() => {
    return todayEvents.reduce((sum, evt) => {
      const dur = new Date(evt.end).getTime() - new Date(evt.start).getTime();
      return sum + Math.round(dur / 60000);
    }, 0);
  }, [todayEvents]);

  // 2. Load Revision Queue due items
  const dueRevisions = useMemo(() => {
    try {
      const stored = localStorage.getItem('sanzz_os_revision_items_v1');
      if (stored) {
        const items = JSON.parse(stored);
        return items.filter((item: any) => item.status !== 'completed' && item.dueDate <= todayDateStr);
      }
    } catch {
      // Ignored
    }
    return [];
  }, [todayDateStr]);

  // 3. Spaced repetition completion check
  const handleCompleteRevision = (itemId: string) => {
    try {
      const stored = localStorage.getItem('sanzz_os_revision_items_v1');
      if (stored) {
        const items = JSON.parse(stored);
        const updated = items.map((item: any) =>
          item.id === itemId ? { ...item, status: 'completed', lastReviewedAt: new Date().toISOString() } : item
        );
        localStorage.setItem('sanzz_os_revision_items_v1', JSON.stringify(updated));
        // Add completion to counts
        updateDailyLog(selectedDay, {
          counts: {
            ...currentCounts,
            cscore: (currentCounts.cscore || 0) + 1,
          },
        });
      }
    } catch {
      // Ignored
    }
  };

  const getAgendaCountUpdate = (task: { id: string; text: string; source: string }) => {
    const text = task.text.toLowerCase();

    if (task.id.startsWith('skillrack') || text.includes('skillrack')) {
      return { key: 'skillrack' as const, value: 10 };
    }

    if (task.id.startsWith('apt') || text.includes('aptitude')) {
      return { key: 'aptitude' as const, value: 30 };
    }

    if (task.id.startsWith('proj') || text.includes('project')) {
      return { key: 'project' as const, value: 60 };
    }

    if (task.id.startsWith('german') || text.includes('german') || text.includes('vocabulary')) {
      return { key: 'german' as const, value: text.includes('vocabulary') ? 15 : 20 };
    }

    if (task.id.startsWith('resume') || text.includes('resume') || text.includes('linkedin')) {
      return { key: 'resume' as const, value: 1 };
    }

    return null;
  };

  const handleAgendaTaskToggle = (task: { id: string; text: string; completed: boolean; source: string }) => {
    notificationStore.toggleAgendaTask(selectedDay, task.id);

    if (task.completed) return;

    const countUpdate = getAgendaCountUpdate(task);
    if (!countUpdate) return;

    const latestLog = useCareerStore.getState().dailyLogs[selectedDay] || currentLog;
    const latestCounts = latestLog.counts || currentCounts;
    updateDailyLog(selectedDay, {
      counts: {
        ...latestCounts,
        [countUpdate.key]: Math.max(latestCounts[countUpdate.key] || 0, countUpdate.value),
      },
    });
  };

  // 4. Checklists & completions
  const minDayQualified = useMemo(() => {
    const lcSolved = currentLog.lcStatus?.length || 0;
    const skillrack = currentCounts.skillrack || 0;
    const aptitude = currentCounts.aptitude || 0;
    const sql = currentCounts.sql || 0;
    const cs = currentCounts.cscore || 0;

    const hasCoding = skillrack >= 5 || lcSolved >= 1 || (currentCounts.leetcode || 0) >= 1;
    const hasApt = aptitude >= 20;
    const hasSqlOrCs = sql >= 1 || cs >= 1;

    return hasCoding && hasApt && hasSqlOrCs;
  }, [currentLog, currentCounts]);

  const perfectDayQualified = useMemo(() => {
    const lcSolved = currentLog.lcStatus?.length || 0;
    const skillrack = currentCounts.skillrack || 0;
    const aptitude = currentCounts.aptitude || 0;
    const sql = currentCounts.sql || 0;
    const cs = currentCounts.cscore || 0;

    return lcSolved >= 2 && skillrack >= 10 && aptitude >= 30 && sql >= 5 && cs >= 1;
  }, [currentLog, currentCounts]);

  // XP goal tracking
  const currentXPProgress = currentLog.xpEarned || 0;
  const targetXP = perfectDayQualified ? 250 : minDayQualified ? 150 : 100;

  // 5. No Zero Day Rescue implementation
  const handleRescueComplete = () => {
    // Complete rescue: set logs status to completed minimum and award XP
    const calculatedXP = 50; // Special streak protection reward XP
    const previousXPForDay = currentLog.xpEarned || 0;
    const xpDelta = calculatedXP - previousXPForDay;
    updateDailyLog(selectedDay, {
      status: 'completed',
      completionType: 'minimum',
      rescueCompleted: true,
      xpEarned: calculatedXP,
      note: currentLog.note ? `${currentLog.note}\n[Rescued via No-Zero-Day challenge!]` : 'Rescued via No-Zero-Day challenge!',
      savedAt: new Date().toISOString(),
    });

    if (xpDelta !== 0) {
      setCareerState((state) => {
        const newCumulativeXP = Math.max(0, (state.xp || 0) + xpDelta);
        return {
          xp: newCumulativeXP,
          level: getLevel(newCumulativeXP).level,
        };
      });
    }

    notificationStore.addNotification({
      type: 'success',
      title: 'Streak Rescued!',
      message: 'Consistency streak protected successfully via No Zero Day Rescue Challenge. Keep up the grit!',
      priority: 'high',
    });
  };

  const handleApplyFreeze = () => {
    const dateObj = new Date(userProfile.startDate);
    dateObj.setDate(dateObj.getDate() + (selectedDay - 1));

    if (!canUseFreeze(dateObj, weeklyFreezeUsage)) {
      alert('Streak Freeze limit reached for this week!');
      return;
    }

    setShowFreezeModal(true);
    setFreezeConfirmText('');
  };

  const confirmApplyFreeze = () => {
    if (freezeConfirmText.toUpperCase() !== 'FREEZE') return;

    useStreakFreeze(selectedDay, freezeReasonText);
    notificationStore.addNotification({
      type: 'warning',
      title: 'Streak Frozen',
      message: `Day ${selectedDay} protected by Streak Freeze. Reason: ${freezeReasonText || 'None specified'}.`,
      priority: 'medium',
    });

    setShowFreezeModal(false);
  };

  const handleSave = () => {
    let type: DailyLog['completionType'] = 'missed';
    let newStatus: DailyLog['status'] = 'missed';

    if (currentLog.freezeUsed) {
      type = 'freeze';
      newStatus = 'recovery';
    } else if (perfectDayQualified) {
      type = 'perfect';
      newStatus = 'completed';
    } else if (minDayQualified || currentLog.rescueCompleted) {
      type = 'minimum';
      newStatus = 'completed';
    } else if (Object.values(currentCounts).some((v) => v > 0) || (currentLog.lcStatus?.length || 0) > 0) {
      type = 'partial';
      newStatus = 'partial';
    }

    const testLog: DailyLog = { ...currentLog, completionType: type, status: newStatus };
    const calculatedXP = awardXPForLog(selectedDay, testLog);
    const previousXPForDay = currentLog.xpEarned || 0;
    const xpDelta = calculatedXP - previousXPForDay;

    updateDailyLog(selectedDay, {
      status: newStatus,
      completionType: type,
      xpEarned: calculatedXP,
      note: reflectionText,
      savedAt: new Date().toISOString(),
    });

    if (xpDelta !== 0) {
      setCareerState((state) => {
        const newCumulativeXP = Math.max(0, (state.xp || 0) + xpDelta);
        return {
          xp: newCumulativeXP,
          level: getLevel(newCumulativeXP).level,
        };
      });
    }

    // Launch Confetti and sound fanfare
    if (type === 'perfect') {
      import('../../utils/confetti').then(m => m.launchConfetti(180));
      import('../../utils/timerSounds').then(m => m.playAchievementFanfare(0.65));
    } else if (type === 'minimum' || type === 'partial') {
      import('../../utils/confetti').then(m => m.launchConfetti(80));
      import('../../utils/timerSounds').then(m => m.playXPDing(0.55));
    }

    // Set celebration details and show modal
    setCelebrationDetails({ type, xp: Math.max(0, xpDelta) });
    setShowCelebrationModal(true);
  };

  const streakVal = getStreak(useCareerStore.getState());

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 select-none">
      {/* Dynamic Header XP Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl border border-white/5 bg-gradient-to-r from-accentBlue/10 to-transparent">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-accentBlue/10 p-3 text-accentBlue">
            <Zap className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black text-textMuted uppercase tracking-widest">Workspace Dashboard</span>
            <h1 className="text-xl font-black text-textPrimary mt-0.5">Today's OS Command Center</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-textSecondary">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-textMuted font-black">Streak Count</span>
            <span className="text-sm font-black text-accentOrange mt-0.5">{streakVal} Days active</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-textMuted font-black">Level Progress</span>
            <span className="text-sm font-black text-textPrimary mt-0.5">Level {getLevel(xp).level}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Schedule, Spaced Repetition, and No Zero Day Rescue */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Today's Generated Agenda Card */}
          {activeAgenda && (
            <Card className="p-5 border-white/5 flex flex-col gap-4 bg-gradient-to-br from-[#0a0a20] to-transparent">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="h-4.5 w-4.5 text-accentEmerald" />
                  <h3 className="text-sm font-black text-textPrimary uppercase tracking-widest">Smart Daily Agenda</h3>
                </div>
                <Badge variant="primary">Focus: {activeAgenda.focusTopic}</Badge>
              </div>

              <div className="flex flex-col gap-3">
                {/* Time Slots timeline */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-textMuted uppercase font-bold tracking-wider">Suggested Timeline</span>
                  <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                    {activeAgenda.timeSlots.map((slot, index) => (
                      <div key={index} className="p-2 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1">
                        <span className="font-mono text-[9px] text-accentBlue">{slot.time} ({slot.duration}m)</span>
                        <span className="text-[10px] font-bold text-textPrimary truncate">{slot.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks checklists */}
                <div className="flex flex-col gap-2 mt-1">
                  <span className="text-[9px] text-textMuted uppercase font-bold tracking-wider">Target Tasks</span>
                  <div className="flex flex-col gap-2">
                    {activeAgenda.tasks.map((task) => (
                      <label
                        key={task.id}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5 bg-black/30 cursor-pointer hover:bg-black/55 transition"
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleAgendaTaskToggle(task)}
                          className="rounded bg-black/45 border-white/5 text-accentBlue focus:ring-0 cursor-pointer"
                        />
                        <span className={`text-xs text-textSecondary ${task.completed ? 'line-through opacity-55 font-normal' : 'font-semibold text-textPrimary'}`}>
                          {task.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Today's Schedule Card */}
          <Card className="p-5 border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-accentBlue" />
                <h3 className="text-sm font-black text-textPrimary uppercase tracking-widest">Today's Schedule</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-textMuted font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>Est: {totalTimeEstimateMins} mins</span>
              </div>
            </div>

            {todayEvents.length === 0 ? (
              <p className="text-xs text-textMuted text-center py-4">No events scheduled on calendar for today. Enjoy a quiet recovery day!</p>
            ) : (
              <div className="flex flex-col gap-2">
                {todayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: evt.color || '#3B82F6' }} />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-textPrimary">{evt.title}</span>
                        {evt.description && <span className="text-[9px] text-textMuted truncate max-w-[200px]">{evt.description}</span>}
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-[9px] text-textSecondary">
                      {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Today's Learning: Spaced Repetition Due Queue */}
          <Card className="p-5 border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-accentPurple" />
                <h3 className="text-sm font-black text-textPrimary uppercase tracking-widest">Today's Spaced Repetition</h3>
              </div>
              <Badge variant={dueRevisions.length > 0 ? 'warning' : 'success'}>
                {dueRevisions.length} due
              </Badge>
            </div>

            {dueRevisions.length === 0 ? (
              <p className="text-xs text-textMuted text-center py-4">All revision items are fully cleared and mastered!</p>
            ) : (
              <div className="flex flex-col gap-2">
                {dueRevisions.map((rev: any) => (
                  <div
                    key={rev.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black text-textPrimary">{rev.topic}</span>
                      <span className="text-[9px] text-textMuted">Difficulty: {rev.difficulty} | Reason: {rev.reason}</span>
                    </div>

                    <Button size="sm" onClick={() => handleCompleteRevision(rev.id)} className="rounded-lg text-[9px] uppercase tracking-wider font-bold">
                      Mark Revised
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* No Zero Day Rescue Box */}
          {!minDayQualified && !currentLog.rescueCompleted && (
            <Card className="border-accentOrange/30 bg-accentOrange/5 p-5 flex flex-col gap-3.5 relative overflow-hidden">
              <div className="flex items-center gap-2 text-accentOrange">
                <Flame className="h-5 w-5 fill-current animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-widest">Streak Protection Active</h3>
              </div>
              
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-black text-textPrimary">Execute No-Zero-Day Rescue Checklist</h4>
                <p className="text-[10px] text-textSecondary leading-relaxed">
                  You haven't qualified for a completed minimum day yet. Select and complete one of the following short rescue options to save your daily streak:
                </p>
              </div>

              <div className="grid gap-2 text-[10px] font-bold uppercase tracking-wider text-textSecondary mt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-black/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-accentOrange" />
                  <span>15-Minute Spaced Repetition Session</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-black/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-accentOrange" />
                  <span>Solve 5 SQL Questions</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-black/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-accentOrange" />
                  <span>Solve 1 DSA/LeetCode Problem</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-black/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-accentOrange" />
                  <span>Review 10 German Words</span>
                </div>
              </div>

              <Button
                onClick={handleRescueComplete}
                className="w-full mt-3 bg-accentOrange text-white hover:bg-accentOrange/90 rounded-xl font-black uppercase tracking-widest text-[10px]"
              >
                Complete Rescue & Lock Streak
              </Button>
            </Card>
          )}

          {currentLog.rescueCompleted && (
            <Card className="border-accentEmerald/20 bg-accentEmerald/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-accentEmerald">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-wider">Streak protected via Rescue!</span>
              </div>
              <Badge variant="success">Completed</Badge>
            </Card>
          )}
        </div>

        {/* Right Column: Daily Target Checklists, Focus controls, Reflections, and Save Day */}
        <div className="flex flex-col gap-6">
          {/* Target checklist qualifications */}
          <Card className="p-4 border-white/5 bg-[#0a0a1a] flex flex-col gap-3">
            <h4 className="text-xs font-black text-textPrimary uppercase tracking-wider border-b border-white/5 pb-2">Daily Quests Status</h4>
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-2 mb-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-textSecondary uppercase">
                <span>XP Goal Progress</span>
                <span className="font-mono">{currentXPProgress} / {targetXP} XP</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accentBlue transition-all" style={{ width: `${Math.min((currentXPProgress / targetXP) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-textSecondary font-bold">Minimum Day checklist:</span>
                <Badge variant={minDayQualified ? 'success' : 'neutral'}>
                  {minDayQualified ? 'Qualified' : 'Pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-textSecondary font-bold">Perfect Day checklist:</span>
                <Badge variant={perfectDayQualified ? 'warning' : 'neutral'}>
                  {perfectDayQualified ? 'Perfect Day' : 'Pending'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Streak Freeze panel */}
          <Card className="border-accentBlue/20 bg-accentBlue/5 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-accentBlue">
              <Snowflake className="h-5 w-5" />
              <h3 className="text-base font-black text-textPrimary">Streak Freeze Protection</h3>
            </div>
            <p className="text-[10px] text-textSecondary leading-relaxed">
              Log reason to use one weekly freeze to secure streak.
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Reason (optional)..."
                value={freezeReasonText}
                onChange={(e) => setFreezeReasonText(e.target.value)}
                className="w-full h-8 px-2 rounded-lg border border-white/5 bg-black/45 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none"
              />
              <Button onClick={handleApplyFreeze} size="sm" className="w-full gap-1 text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                Use Freeze Today ({getFreezesLeftForWeek(new Date(), weeklyFreezeUsage)} left)
              </Button>
            </div>
          </Card>

          {/* Daily reflection */}
          <Card className="p-4 border-white/5 flex flex-col gap-2.5">
            <h4 className="text-xs font-black text-textPrimary uppercase tracking-wider">Daily reflection notes</h4>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What worked? What blocked you? What's your target for tomorrow?"
              className="w-full min-h-[75px] rounded-xl border border-white/5 bg-black/45 px-3 py-2 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none resize-none"
            />
          </Card>

          {/* Save Day action */}
          <Button
            onClick={handleSave}
            className="w-full h-11 bg-accentBlue text-white hover:bg-accentBlue/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-glow-blue/15"
          >
            Save Day Progress
          </Button>
        </div>
      </div>

      {/* ── STREAK FREEZE DRAMATIC MODAL ── */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn">
          {/* Faint drifting snowflakes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            {['❄️', '❄️', '❄️', '❄️', '❄️'].map((s, i) => (
              <div
                key={i}
                className="absolute text-3xl animate-bounce"
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${10 + (i % 2) * 50}%`,
                  animationDuration: `${3 + i}s`,
                }}
              >
                {s}
              </div>
            ))}
          </div>

          <div
            className="relative w-full max-w-md mx-4 p-6 rounded-3xl border border-cyan-500/30 bg-[#020b12] text-center shadow-[0_0_50px_rgba(6,182,212,0.25)]"
            style={{ backgroundImage: 'radial-gradient(circle at top, rgba(6,182,212,0.1), transparent 70%)' }}
          >
            <button
              onClick={() => setShowFreezeModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto h-14 w-14 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
              <Snowflake className="h-7 w-7 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            <h3 className="text-lg font-black text-white uppercase tracking-wider font-mono">
              Streak Freeze Chamber
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed mt-2.5">
              Warning: You are about to freeze Day {selectedDay}. Streak freezes are limited to 2 per week. Only use this if you are unable to log study hours today.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest text-left font-mono">
                Type "FREEZE" to confirm:
              </span>
              <input
                type="text"
                value={freezeConfirmText}
                onChange={(e) => setFreezeConfirmText(e.target.value)}
                placeholder="FREEZE"
                className="h-10 text-center rounded-xl border border-cyan-500/25 bg-black/60 font-mono text-sm tracking-widest text-white uppercase focus:outline-none focus:border-cyan-500/60"
              />

              <div className="grid grid-cols-2 gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFreezeModal(false)}
                  className="rounded-xl border-white/5 text-xs h-10"
                >
                  Cancel
                </Button>
                <Button
                  disabled={freezeConfirmText.toUpperCase() !== 'FREEZE'}
                  onClick={confirmApplyFreeze}
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider text-[10px] h-10 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-30 disabled:shadow-none"
                >
                  Freeze Day
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DAY COMPLETE CELEBRATION MODAL ── */}
      {showCelebrationModal && celebrationDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
          {/* Gold sparks overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            {['⭐', '✨', '⭐', '✨'].map((s, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-pulse"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${15 + (i % 2) * 50}%`,
                  animationDuration: `${2 + i}s`,
                }}
              >
                {s}
              </div>
            ))}
          </div>

          <div
            className={`relative w-full max-w-sm mx-4 p-6 rounded-3xl text-center shadow-2xl border ${
              celebrationDetails.type === 'perfect'
                ? 'border-yellow-500/30 bg-[#0f0a00] shadow-[0_0_40px_rgba(234,179,8,0.25)]'
                : 'border-accentBlue/30 bg-[#020b12] shadow-[0_0_40px_rgba(59,130,246,0.25)]'
            }`}
            style={{
              backgroundImage:
                celebrationDetails.type === 'perfect'
                  ? 'radial-gradient(circle at top, rgba(234,179,8,0.1), transparent 75%)'
                  : 'radial-gradient(circle at top, rgba(59,130,246,0.1), transparent 75%)',
            }}
          >
            <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 border bg-black/45">
              {celebrationDetails.type === 'perfect' ? (
                <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
              ) : (
                <ShieldCheck className="h-8 w-8 text-accentBlue" />
              )}
            </div>

            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-textMuted font-mono">
              Day quest compiled
            </span>

            <h3
              className={`text-xl font-black uppercase tracking-wider mt-1.5 ${
                celebrationDetails.type === 'perfect' ? 'text-yellow-400' : 'text-white'
              }`}
            >
              {celebrationDetails.type === 'perfect' ? '⭐ Perfect Day! ⭐' : '🔥 Consistency Gained'}
            </h3>

            <p className="text-xs text-textSecondary leading-relaxed mt-2.5 px-2">
              Outstanding work, Sanju! Your consistency streak is secure. Let's keep this momentum going for tomorrow's objectives.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-black/60 border border-white/5 inline-flex flex-col gap-1 min-w-[120px] font-mono">
              <span className="text-[10px] text-textMuted font-bold uppercase">Reward</span>
              <span
                className={`text-xl font-black ${
                  celebrationDetails.type === 'perfect' ? 'text-yellow-400' : 'text-accentBlue'
                }`}
              >
                +{celebrationDetails.xp} XP
              </span>
            </div>

            <Button
              onClick={() => setShowCelebrationModal(false)}
              className={`w-full rounded-2xl font-black uppercase tracking-widest text-xs h-11 ${
                celebrationDetails.type === 'perfect'
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                  : 'bg-accentBlue hover:bg-accentBlue/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              }`}
            >
              Back to Command Center
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default TodayCommandCenter;
