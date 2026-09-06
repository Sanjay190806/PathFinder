import React, { useState } from 'react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useAIMentorStore } from '../../app/store/useAIMentorStore';
import { mockInterviewService } from '../../services/mockInterviewService';
import { Button } from '../ui/Button';
import { BarChart3 } from 'lucide-react';

export const WeeklyReviewGenerator: React.FC = () => {
  const careerState = useCareerStore.getState();
  const { reviews, addReview } = useAIMentorStore();
  const [activeReview, setActiveReview] = useState<any>(reviews.find((r) => r.type === 'weekly') || null);

  const handleGenerate = () => {
    const logs = Object.values(careerState.dailyLogs || {});
    if (logs.length === 0) {
      alert('Insufficient checklist data to compile weekly performance summary!');
      return;
    }

    // Sum up stats from last 7 logs
    const last7 = logs.slice(-7);
    const xpGained = last7.reduce((sum, l) => sum + (l.xpEarned || 0), 0);
    const tasksCompleted = last7.filter((l) => l.status === 'completed').length;
    
    const mockStats = mockInterviewService.compileMockStats();
    const weakestArea = mockStats.weakestArea || 'SQL databases Joins';

    const recommendation = mockStats.avgConfidenceAnswers >= 4.0
      ? 'Outstanding mock performance. Polish recruiter project pitches and clean up GitHub readmes.'
      : 'Focus on STAR behavioral templates. Spend 30 minutes on quantitative aptitude sprint patterns.';

    const newRev = {
      type: 'weekly' as const,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      endDate: new Date().toISOString().substring(0, 10),
      xpGained,
      tasksCompleted,
      blockersDetected: [weakestArea],
      recommendation,
    };

    addReview(newRev);
    setActiveReview({ ...newRev, id: `rev-${Date.now()}`, savedAt: new Date().toISOString() });
    alert('Weekly performance review compiled successfully!');
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none bg-black/45 border border-white/5 p-5 rounded-2xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4.5 w-4.5 text-accentBlue" />
          <span className="text-[10px] font-black uppercase tracking-wider text-textPrimary">Weekly Performance Review</span>
        </div>
        <Button size="sm" onClick={handleGenerate}>Compile Review</Button>
      </div>

      {activeReview ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-0.5">
              <span className="text-[8px] text-textMuted uppercase font-bold">XP Gained</span>
              <span className="text-base font-black text-accentBlue mt-0.5">+{activeReview.xpGained} XP</span>
            </div>
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-0.5">
              <span className="text-[8px] text-textMuted uppercase font-bold">Study Days Completed</span>
              <span className="text-base font-black text-accentEmerald mt-0.5">{activeReview.tasksCompleted} / 7 days</span>
            </div>
          </div>

          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-1 text-[10px] text-textSecondary font-semibold">
            <p>• Strongest Prep Segment: <span className="text-accentBlue">Mock Answers Drafting</span></p>
            <p>• Primary Prep Blocker: <span className="text-accentOrange">{activeReview.blockersDetected.join(', ')}</span></p>
          </div>

          <div className="p-3 bg-accentBlue/5 border border-accentBlue/20 rounded-xl text-[10px] text-textSecondary leading-relaxed">
            <span className="text-[9px] text-accentBlue font-black uppercase tracking-wider block">AI Mentor Recommendation</span>
            <p className="mt-1">{activeReview.recommendation}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-textMuted text-center py-6 bg-white/[0.01] border border-white/5 rounded-2xl">
          No weekly summaries compiled. Click compile above to review study parameters.
        </p>
      )}
    </div>
  );
};
export default WeeklyReviewGenerator;
