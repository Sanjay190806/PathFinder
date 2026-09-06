import React, { useState } from 'react';
import { useCompanyIntelligence } from '../../hooks/useCompanyIntelligence';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, Sparkles } from 'lucide-react';

interface PrepPlanGeneratorProps {
  companyId: string;
  companyName: string;
}

export const PrepPlanGenerator: React.FC<PrepPlanGeneratorProps> = ({ companyId, companyName }) => {
  const { prepPlans, generatePrepPlan, togglePlanTask } = useCompanyIntelligence();
  const [duration, setDuration] = useState(7);

  const activePlan = prepPlans[companyId] || null;

  const handleGenerate = () => {
    generatePrepPlan(companyId, companyName, duration);
    alert(`Generated customized ${duration}-day preparation plan for ${companyName}!`);
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Plan Architect</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">Custom Preparation Timeline</h3>
        </div>
      </div>

      {!activePlan ? (
        <Card className="p-6 border-white/5 bg-white/[0.01] text-center flex flex-col items-center gap-3">
          <Calendar className="h-8 w-8 text-accentBlue" />
          <div>
            <h4 className="text-xs font-black text-textPrimary uppercase tracking-wider">No study schedule active</h4>
            <p className="text-[10px] text-textMuted mt-1 leading-relaxed">
              Generate a tailored prep timeline based on Zoho rounds or service company aptitude levels.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2 w-full max-w-xs">
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1 h-9 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            >
              <option value={7}>7 Days Sprint</option>
              <option value={14}>14 Days Deep Prep</option>
              <option value={30}>30 Days Comprehensive</option>
            </select>

            <Button
              onClick={handleGenerate}
              className="flex items-center gap-1 bg-accentBlue text-white uppercase tracking-wider font-black text-[10px] h-9"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate Plan
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-accentBlue/5 border border-accentBlue/25">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black text-textPrimary uppercase tracking-wider">
                {activePlan.durationDays}-Day Preparation Plan
              </span>
              <span className="text-[9px] text-textMuted font-mono">Started: {activePlan.startDate}</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              className="text-[9px] uppercase font-bold"
            >
              Re-Generate Plan
            </Button>
          </div>

          {/* Timeline scroll area */}
          <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {activePlan.dailyTasks.map((task) => (
              <label
                key={task.dayNum}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer select-none ${
                  task.completed
                    ? 'border-accentEmerald/20 bg-accentEmerald/5 text-textMuted'
                    : 'border-white/5 bg-black/45 hover:border-white/10 text-textPrimary font-semibold'
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => togglePlanTask(companyId, task.dayNum)}
                  className="rounded bg-black/45 border-white/5 text-accentBlue focus:ring-0 mt-0.5 cursor-pointer"
                />

                <div className="flex-1 flex flex-col gap-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-accentBlue font-mono uppercase tracking-wider text-[9px]">
                      Day {task.dayNum}
                    </span>
                    {task.completed && (
                      <span className="px-1.5 py-0.2 rounded bg-accentEmerald/10 text-accentEmerald text-[7px] font-black uppercase tracking-wider">
                        Complete
                      </span>
                    )}
                  </div>

                  <p className={`mt-0.5 ${task.completed ? 'line-through opacity-55' : ''}`}>
                    • Coding: {task.codingTask}
                  </p>
                  <p className={`mt-0.5 ${task.completed ? 'line-through opacity-55' : ''}`}>
                    • Aptitude: {task.aptitudeTask}
                  </p>
                  <p className={`mt-0.5 ${task.completed ? 'line-through opacity-55' : ''}`}>
                    • SQL: {task.sqlTask}
                  </p>
                  <p className={`mt-0.5 ${task.completed ? 'line-through opacity-55' : ''}`}>
                    • Project Prep: {task.theoryTask}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default PrepPlanGenerator;
