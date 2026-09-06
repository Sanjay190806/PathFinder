import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface PlanDetail {
  key: string;
  name: string;
  desc: string;
  tasks: { task: string; time: string; priority: 'high' | 'medium' }[];
}

const PLANS: PlanDetail[] = [
  {
    key: 'rescue15',
    name: '15-Minute Rescue Sprint',
    desc: 'Quick study checkpoint to save streak consistency.',
    tasks: [
      { task: 'Solve 1 SQL joins query', time: '5 mins', priority: 'high' },
      { task: 'Review 5 German flashcards', time: '5 mins', priority: 'high' },
      { task: 'Check checklist tasks logs', time: '5 mins', priority: 'medium' },
    ]
  },
  {
    key: 'reset60',
    name: '1-Hour Reset Plan',
    desc: 'Re-align focus modes and clear backlog items.',
    tasks: [
      { task: 'Draft 1 STAR answer script in Mock Interview OS', time: '20 mins', priority: 'high' },
      { task: 'Solve 1 Medium LeetCode question', time: '25 mins', priority: 'high' },
      { task: 'Review weekly agenda priorities', time: '15 mins', priority: 'medium' },
    ]
  },
  {
    key: 'comeback3d',
    name: '3-Day Rebuild Sprint',
    desc: 'Comprehensive syllabus recovery after breaks.',
    tasks: [
      { task: 'Solve 15 SkillRack challenges', time: 'Daily', priority: 'high' },
      { task: 'Run 1 complete 30-minute Mock Session', time: '30 mins', priority: 'high' },
      { task: 'Polish GitHub repository readme guidelines', time: '40 mins', priority: 'medium' },
    ]
  }
];

export const ComebackPlanBuilder: React.FC = () => {
  const [activePlanKey, setActivePlanKey] = useState('rescue15');

  const selectedPlan = PLANS.find((p) => p.key === activePlanKey) || PLANS[0];

  const handleApply = () => {
    alert(`Applied ${selectedPlan.name} recovery tasks! View active items inside Today Page.`);
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none bg-black/45 border border-white/5 p-5 rounded-2xl">
      <div className="flex justify-between items-start border-b border-white/5 pb-2">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Comeback Engine</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">Study Recovery Plans</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PLANS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePlanKey(p.key)}
            className={`p-2.5 rounded-xl border text-left font-bold transition flex flex-col gap-1 ${
              activePlanKey === p.key
                ? 'border-accentBlue bg-accentBlue/5 text-textPrimary'
                : 'border-white/5 bg-black/25 text-textSecondary hover:border-white/10'
            }`}
          >
            <span className="text-[9px] tracking-wider uppercase">{p.name.split(' ')[0]}</span>
            <span className="text-[7px] text-textMuted font-semibold line-clamp-1">{p.desc}</span>
          </button>
        ))}
      </div>

      <Card className="p-3 bg-white/[0.01] border-white/5 flex flex-col gap-3">
        <h4 className="text-[10px] font-black uppercase text-accentBlue tracking-widest border-b border-white/5 pb-1">
          {selectedPlan.name} checklist ({selectedPlan.tasks.length} items)
        </h4>

        <div className="flex flex-col gap-2">
          {selectedPlan.tasks.map((t, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-black/45 border border-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-textSecondary">{t.task}</span>
                <span className="text-[8px] text-textMuted font-mono">Estimate: {t.time}</span>
              </div>
              <span className={`px-1.5 py-0.2 rounded text-[7px] font-black uppercase tracking-wider ${
                t.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-accentOrange/10 text-accentOrange'
              }`}>
                {t.priority}
              </span>
            </div>
          ))}
        </div>

        <Button
          onClick={handleApply}
          className="w-full bg-accentBlue text-white hover:bg-accentBlue/90 uppercase font-black tracking-widest text-[9px] h-9 mt-1"
        >
          Inject Comeback Tasks into Today Agenda
        </Button>
      </Card>
    </div>
  );
};
export default ComebackPlanBuilder;
