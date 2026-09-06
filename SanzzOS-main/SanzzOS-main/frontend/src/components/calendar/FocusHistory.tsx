import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTodayDay } from '../../utils/dateUtils';

export const FocusHistory: React.FC = () => {
  const userProfile = useCareerStore((s) => s.userProfile);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);

  const currentDay = getTodayDay(userProfile.startDate);
  const currentLog = dailyLogs[currentDay] || { focusMinutes: 0 };

  // Timer specific settings
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(25); // Target in minutes
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleSelectDuration = (mins: number) => {
    setIsActive(false);
    setDuration(mins);
    setSeconds(mins * 60);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(duration * 60);
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            
            // Add focus minutes to Today's logs
            const currentFocus = currentLog.focusMinutes || 0;
            updateDailyLog(currentDay, {
              focusMinutes: currentFocus + duration
            });

            alert(`Congrats! You completed a ${duration} minutes focus session.`);
            return duration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, duration, currentDay, currentLog.focusMinutes, updateDailyLog]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Compute focus stats
  const totalFocusMinutes = Object.values(dailyLogs).reduce((sum, l) => sum + (l.focusMinutes || 0), 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      {/* Pomodoro Timer Controls */}
      <Card className="flex flex-col items-center justify-center p-6 text-center border-border-accent/15">
        <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-2">Focus Mode Study Workspace</span>
        
        {/* Toggle choices */}
        <div className="flex gap-2 w-full mb-4">
          {[25, 50, 90].map((mins) => (
            <button
              key={mins}
              onClick={() => handleSelectDuration(mins)}
              className={`flex-1 py-1 rounded-lg border text-[10px] font-bold transition ${
                duration === mins && !isActive
                  ? 'bg-accentBlue/20 border-accentBlue text-textPrimary'
                  : 'bg-bgSurface border-border-subtle hover:bg-bg-glass-hover text-textSecondary'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        <div className="text-4xl font-extrabold text-textPrimary font-mono my-2 tracking-widest">
          {formatTime(seconds)}
        </div>

        <div className="flex gap-2 mt-4 w-full">
          <Button
            onClick={toggleTimer}
            variant={isActive ? "outline" : "primary"}
            className="flex-1 text-xs py-2 rounded-xl"
          >
            {isActive ? "Pause Session" : "Start Session"}
          </Button>
          <Button
            onClick={resetTimer}
            variant="ghost"
            className="px-3 border border-border-subtle rounded-xl text-xs"
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Focus statistics list */}
      <Card className="flex flex-col gap-3">
        <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block pl-0.5">Focus Statistics</span>
        
        <div className="grid grid-cols-2 gap-4 text-xs bg-bgSurface/30 border border-border-subtle p-3 rounded-xl">
          <div>
            <span className="text-textMuted block font-bold uppercase text-[9px]">Total Focus Time</span>
            <span className="font-bold text-textPrimary font-mono text-sm">{totalFocusHours} hrs</span>
          </div>
          <div>
            <span className="text-textMuted block font-bold uppercase text-[9px]">Today Study Time</span>
            <span className="font-bold text-accentOrange font-mono text-sm">{currentLog.focusMinutes || 0} mins</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
