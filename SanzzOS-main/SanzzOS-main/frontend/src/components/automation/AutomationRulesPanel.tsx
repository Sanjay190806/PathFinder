import React from 'react';
import { useAutomationStore } from '../../app/store/useAutomationStore';
import { automationEngine } from '../../services/automationEngine';
import { Button } from '../ui/Button';
import { Sparkles } from 'lucide-react';

export const AutomationRulesPanel: React.FC = () => {
  const { rules, runs, toggleRule, clearRunHistory } = useAutomationStore();

  const handleRunChecks = () => {
    const executed = automationEngine.checkAndExecuteRules();
    if (executed.length === 0) {
      alert('Checked all rules! Cooldown active or conditions not met. No actions needed.');
    } else {
      alert(`Automation completed: ${executed.join(', ')}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Automation OS</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">Local Automation Engines</h3>
        </div>

        <Button
          size="sm"
          onClick={handleRunChecks}
          className="flex items-center gap-1 bg-accentBlue text-white uppercase tracking-wider font-black text-[10px] h-9"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Run Engine Checks
        </Button>
      </div>

      {/* Rules list */}
      <div className="flex flex-col gap-2.5">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-black/45 hover:border-white/10 transition">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-textPrimary">{rule.name}</span>
              <span className="text-[8px] text-textMuted font-mono uppercase tracking-wider">
                Trigger: {rule.triggerType} | Action: {rule.actionType}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[8px] text-textMuted font-mono">Requires confirmation</span>
              <button
                type="button"
                onClick={() => toggleRule(rule.id)}
                className={`px-3 py-1 rounded-xl text-[9px] uppercase font-black tracking-wider transition ${
                  rule.enabled ? 'bg-accentEmerald/20 text-accentEmerald' : 'bg-white/5 text-textMuted'
                }`}
              >
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Run history logs */}
      <div className="flex flex-col gap-2 border-t border-white/5 pt-4 mt-1">
        <div className="flex justify-between items-center pb-1">
          <span className="text-[9px] text-textMuted uppercase font-bold tracking-wider">Execution History Logs</span>
          {runs.length > 0 && (
            <button
              onClick={clearRunHistory}
              className="text-[8px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider"
            >
              Clear Logs
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2.5 max-h-[140px] overflow-y-auto scrollbar-thin">
          {runs.length === 0 ? (
            <p className="text-[10px] text-textMuted text-center py-4 bg-white/[0.01] border border-white/5 rounded-xl">
              No automation runs triggered.
            </p>
          ) : (
            runs.map((run) => {
              const timeStr = new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={run.id} className="flex justify-between items-center p-2 rounded-xl bg-white/[0.01] border border-white/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-textPrimary leading-normal">{run.ruleName}</span>
                    <span className="text-[8px] text-textMuted leading-normal">{run.details}</span>
                  </div>
                  <span className="text-[8px] text-textMuted font-mono shrink-0 ml-2">{timeStr}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default AutomationRulesPanel;
