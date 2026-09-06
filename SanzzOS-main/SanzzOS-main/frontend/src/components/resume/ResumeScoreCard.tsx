import React from 'react';
import { Card } from '../ui/Card';
import { CircularProgress } from '../ui/CircularProgress';
import { useCareerStore } from '../../app/store/useCareerStore';
import { calcResumeScore } from '../../utils/xpUtils';

export const ResumeScoreCard: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const score = calcResumeScore(careerState);

  const getScoreColor = (val: number) => {
    if (val >= 80) return '#10B981'; // success emerald
    if (val >= 50) return '#EAB308'; // warning yellow
    return '#EF4444'; // red danger
  };

  return (
    <Card className="flex flex-col items-center justify-center p-6 text-center border-border-accent/10">
      <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mb-4">ATS Resume Score</span>
      <CircularProgress value={score} size={110} strokeWidth={10} color={getScoreColor(score)} />
      <span className="text-xs text-textSecondary mt-4 max-w-[200px]">
        {score >= 80 
          ? "Excellent! Your resume matches recruitment standards." 
          : "Complete outstanding checklist items to increase your score."}
      </span>
    </Card>
  );
};
