import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useDailyLogStore } from '../../app/store/useDailyLogStore';
import { useUIStore } from '../../app/store/useUIStore';

export const MobileQuickCheckIn: React.FC = () => {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);
  const currentDay = useDailyLogStore((s) => s.selectedDay);
  const setActiveSection = useUIStore((s) => s.setActiveSection);

  const save = () => {
    updateDailyLog(currentDay, { mood, energy, status: 'partial' } as any);
  };

  return (
    <Card className="md:hidden flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Quick check-in</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">How are you today?</h3>
        </div>
        <Badge variant="primary">Mobile</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
          Mood {mood}/5
          <input type="range" min={1} max={5} value={mood} onChange={(e) => setMood(Number(e.target.value))} />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
          Energy {energy}/5
          <input type="range" min={1} max={5} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} />
        </label>
      </div>
      <Button onClick={save} className="w-full">Save quick check-in</Button>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => setActiveSection('today')}>Focus timer</Button>
        <Button variant="outline" size="sm" onClick={() => setActiveSection('german')}>German cards</Button>
        <Button variant="outline" size="sm" onClick={() => setActiveSection('applications')}>Application update</Button>
        <Button variant="outline" size="sm" onClick={() => setActiveSection('ai')}>Ask Shayla</Button>
      </div>
    </Card>
  );
};
