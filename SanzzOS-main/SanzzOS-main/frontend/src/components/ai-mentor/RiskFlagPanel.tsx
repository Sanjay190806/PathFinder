import React from 'react';
import { riskDetectionService } from '../../services/riskDetectionService';
import { Card } from '../ui/Card';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { navigateToPath } from '../../utils/navigation';

export const RiskFlagPanel: React.FC = () => {
  const risks = riskDetectionService.detectRisks();

  return (
    <div className="flex flex-col gap-3 text-xs select-none">
      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider pl-1">
        Active Career Risks ({risks.length})
      </span>

      {risks.length === 0 ? (
        <p className="text-xs text-textMuted text-center py-4 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
          Excellent! Zero risk flags detected. Study patterns are highly consistent.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {risks.map((risk) => (
            <Card
              key={risk.id}
              className={`p-3.5 flex flex-col gap-2 transition hover:border-white/10 ${
                risk.severity === 'critical'
                  ? 'border-red-500/25 bg-red-500/[0.02] text-red-400'
                  : 'border-accentOrange/20 bg-accentOrange/[0.01] text-accentOrange'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span className="uppercase text-[9px] tracking-wider">{risk.title}</span>
                </div>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-white/5 font-mono">
                  {risk.minutesToFix}m fix
                </span>
              </div>

              <p className="text-[10px] text-textSecondary leading-relaxed">{risk.reason}</p>
              
              <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-1">
                <span className="text-[9px] text-textMuted italic">Rec: {risk.recommendation}</span>
                <button
                  type="button"
                  onClick={() => navigateToPath(risk.linkedRoute)}
                  className="flex items-center gap-0.5 text-accentBlue hover:text-accentBlue/90 font-bold uppercase tracking-wider text-[8px]"
                >
                  Fix Now <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
export default RiskFlagPanel;
