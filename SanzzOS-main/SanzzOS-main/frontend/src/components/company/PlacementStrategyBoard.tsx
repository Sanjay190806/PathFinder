import React from 'react';
import { useCompanyIntelligence } from '../../hooks/useCompanyIntelligence';
import { Card } from '../ui/Card';

const PIPELINE_STAGES = [
  { key: 'applied', label: 'Applied' },
  { key: 'oa_pending', label: 'OA Pending' },
  { key: 'interview_upcoming', label: 'Interviews Upcoming' },
  { key: 'offered', label: 'Offered / Ready' },
];

export const PlacementStrategyBoard: React.FC = () => {
  const { companies, strategy, updateStrategy } = useCompanyIntelligence();

  const handleStageChange = (companyId: string, stage: any) => {
    updateStrategy({
      activePipelines: {
        ...strategy.activePipelines,
        [companyId]: stage,
      },
    });
  };

  const getCompaniesInStage = (stageKey: string) => {
    return companies.filter((c) => strategy.activePipelines[c.id] === stageKey);
  };

  return (
    <div className="flex flex-col gap-5 text-xs select-none">
      <div className="border-b border-white/5 pb-2">
        <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Pipeline OS</span>
        <h3 className="text-sm font-black text-textPrimary mt-0.5">Placement Pipeline Board</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageCompanies = getCompaniesInStage(stage.key);

          return (
            <div
              key={stage.key}
              className="flex flex-col gap-3 bg-black/45 border border-white/5 p-3 rounded-2xl min-h-[300px]"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <span className="text-[9px] font-black text-textPrimary uppercase tracking-wider">
                  {stage.label}
                </span>
                <span className="font-mono text-[8px] text-textMuted">{stageCompanies.length}</span>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                {stageCompanies.length === 0 ? (
                  <p className="text-[9px] text-textMuted text-center py-8">No companies</p>
                ) : (
                  stageCompanies.map((c) => (
                    <Card
                      key={c.id}
                      className="p-3 border-white/5 bg-white/[0.01] hover:border-white/10 transition flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-textPrimary">{c.name}</span>
                        <span className="text-[8px] px-1.5 py-0.2 rounded bg-accentBlue/10 text-accentBlue font-bold font-mono">
                          {c.readinessScore}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-1">
                        <select
                          value={stage.key}
                          onChange={(e) => handleStageChange(c.id, e.target.value as any)}
                          className="h-6 text-[8px] uppercase tracking-wider font-bold rounded-lg border border-white/5 bg-black/45 text-textSecondary focus:outline-none"
                        >
                          <option value="applied">Applied</option>
                          <option value="oa_pending">OA Pending</option>
                          <option value="interview_upcoming">Interview</option>
                          <option value="offered">Offered</option>
                        </select>
                        <span className="text-[8px] text-textMuted font-mono">Move stage</span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default PlacementStrategyBoard;
