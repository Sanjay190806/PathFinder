import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CurrentMissionCard } from '../components/ai-mentor/CurrentMissionCard';
import { RiskFlagPanel } from '../components/ai-mentor/RiskFlagPanel';
import { WeeklyReviewGenerator } from '../components/ai-mentor/WeeklyReviewGenerator';
import { MonthlyReviewGenerator } from '../components/ai-mentor/MonthlyReviewGenerator';
import { ComebackPlanBuilder } from '../components/ai-mentor/ComebackPlanBuilder';
import { CareerForecastCard } from '../components/ai-mentor/CareerForecastCard';
import { AutomationRulesPanel } from '../components/automation/AutomationRulesPanel';
import { BarChart3, AlertTriangle, Activity, Settings2 } from 'lucide-react';

type TabType = 'reviews' | 'risks' | 'comeback' | 'automation';

export const AIMentorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('reviews');

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="AI Mentor 3.0 & Safe Automation Engine"
        subtitle="Review weekly/monthly preparation metrics, analyze career risk flags, create custom recovery schedules, and manage local automation triggers."
      />

      {/* Tabs list */}
      <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 text-xs font-black uppercase tracking-wider self-start select-none">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'reviews' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Performance Reviews</span>
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'risks' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Risk Flags</span>
        </button>
        <button
          onClick={() => setActiveTab('comeback')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'comeback' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Comeback Plans</span>
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'automation' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <Settings2 className="h-4 w-4" />
          <span>Automation Rules</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - main workspace */}
        <div className="lg:col-span-2">
          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <WeeklyReviewGenerator />
              <MonthlyReviewGenerator />
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="animate-fadeIn">
              <RiskFlagPanel />
            </div>
          )}

          {activeTab === 'comeback' && (
            <div className="animate-fadeIn">
              <ComebackPlanBuilder />
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="animate-fadeIn">
              <AutomationRulesPanel />
            </div>
          )}
        </div>

        {/* Right sidebar widgets */}
        <div className="flex flex-col gap-5">
          <CurrentMissionCard />
          <CareerForecastCard />
        </div>
      </div>
    </div>
  );
};
export default AIMentorPage;
