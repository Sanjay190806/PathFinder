import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface InterviewTimerProps {
  initialMins: number;
  onTimeUp?: () => void;
  isActive: boolean;
}

export const InterviewTimer: React.FC<InterviewTimerProps> = ({
  initialMins,
  onTimeUp,
  isActive,
}) => {
  const [seconds, setSeconds] = useState(initialMins * 60);

  useEffect(() => {
    setSeconds(initialMins * 60);
  }, [initialMins]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      if (onTimeUp) onTimeUp();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-black/45 text-textSecondary font-mono text-[10px]">
      <Clock className="h-4 w-4 text-accentBlue" />
      <span>Session time: {formatTime(seconds)}</span>
    </div>
  );
};
export default InterviewTimer;
