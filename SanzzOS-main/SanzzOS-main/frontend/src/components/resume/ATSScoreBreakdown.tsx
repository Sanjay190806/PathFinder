import React from 'react';
import { CategoryScore } from '../../app/store/useResumeAnalysisStore';

export const ATSScoreBreakdown: React.FC<{ score: number; categories: CategoryScore[] }> = ({ score, categories }) => (
  <div className="grid gap-4">
    <div className="mx-auto grid h-36 w-36 place-items-center rounded-full border-8 border-accentBlue/30 bg-bgBase text-center">
      <div><p className="text-4xl font-bold text-textPrimary">{score}</p><p className="text-[10px] uppercase tracking-[0.18em] text-textMuted">Estimated ATS</p></div>
    </div>
    <div className="grid gap-3">
      {categories.map((category) => {
        const width = Math.round((category.score / category.max) * 100);
        return <div key={category.label}><div className="flex justify-between text-xs"><span className="text-textSecondary">{category.label}</span><span className="text-textPrimary">{category.score}/{category.max}</span></div><div className="mt-1 h-2 rounded-full bg-bgBase"><div className="h-full rounded-full bg-accentBlue" style={{ width: `${width}%` }} /></div><p className="mt-1 text-[11px] text-textMuted">{category.note}</p></div>;
      })}
    </div>
  </div>
);
