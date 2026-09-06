import React, { useState } from 'react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useAIMentorStore } from '../../app/store/useAIMentorStore';
import { Button } from '../ui/Button';
import { Calendar } from 'lucide-react';

export const MonthlyReviewGenerator: React.FC = () => {
  const careerState = useCareerStore.getState();
  const { reviews, addReview } = useAIMentorStore();
  const [activeReview, setActiveReview] = useState<any>(reviews.find((r) => r.type === 'monthly') || null);

  const handleGenerate = () => {
    const logs = Object.values(careerState.dailyLogs || {});
    if (logs.length === 0) {
      alert('Insufficient checklist data to compile monthly performance summary!');
      return;
    }

    const xpGained = logs.reduce((sum, l) => sum + (l.xpEarned || 0), 0);
    const tasksCompleted = logs.filter((l) => l.status === 'completed').length;

    const newRev = {
      type: 'monthly' as const,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      endDate: new Date().toISOString().substring(0, 10),
      xpGained,
      tasksCompleted,
      blockersDetected: ['German Grammar', 'Java DSA algorithms complexity rules'],
      recommendation: 'Excellent monthly consistency. Ready to apply to Zoho and schedule high difficulty mock rounds.',
    };

    addReview(newRev);
    setActiveReview({ ...newRev, id: `rev-${Date.now()}`, savedAt: new Date().toISOString() });
    alert('Monthly performance review compiled successfully!');
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none bg-black/45 border border-white/5 p-5 rounded-2xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-accentBlue" />
          <span className="text-[10px] font-black uppercase tracking-wider text-textPrimary">Monthly Milestone Review</span>
        </div>
        <Button size="sm" onClick={handleGenerate}>Compile Review</Button>
      </div>

      {activeReview ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-0.5">
              <span className="text-[8px] text-textMuted uppercase font-bold">Total Month XP</span>
              <span className="text-base font-black text-accentBlue mt-0.5">+{activeReview.xpGained} XP</span>
            </div>
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-0.5">
              <span className="text-[8px] text-textMuted uppercase font-bold">Productive Study Days</span>
              <span className="text-base font-black text-accentEmerald mt-0.5">{activeReview.tasksCompleted} days</span>
            </div>
          </div>

          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-[10px] text-textSecondary font-semibold leading-relaxed">
            <p>• Major Blocking Hurdles: <span className="text-accentOrange">{activeReview.blockersDetected.join(', ')}</span></p>
          </div>

          <div className="p-3 bg-accentBlue/5 border border-accentBlue/20 rounded-xl text-[10px] text-textSecondary leading-relaxed">
            <span className="text-[9px] text-accentBlue font-black uppercase tracking-wider block">AI Mentor Milestone Suggestion</span>
            <p className="mt-1">{activeReview.recommendation}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-textMuted text-center py-6 bg-white/[0.01] border border-white/5 rounded-2xl">
          No monthly milestones reviews generated.
        </p>
      )}
    </div>
  );
};
export default MonthlyReviewGenerator;
