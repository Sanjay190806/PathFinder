import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CompanyReadinessCard } from '../components/company/CompanyReadinessCard';
import { PrepPlanGenerator } from '../components/company/PrepPlanGenerator';
import { OAAttemptForm } from '../components/company/OAAttemptForm';
import { PlacementStrategyBoard } from '../components/company/PlacementStrategyBoard';
import { useCompanyIntelligence } from '../hooks/useCompanyIntelligence';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';

type TabType = 'plan' | 'readiness' | 'oa' | 'pipeline';

export const CompanyIntelligencePage: React.FC = () => {
  const { companies } = useCompanyIntelligence();
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || 'c-zoho');
  const [activeTab, setActiveTab] = useState<TabType>('plan');

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0] || null;

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="Company Intelligence & Placement Planner"
        subtitle="Manage target company profiles, generate customized preparation sprints, log online assessments, and map job pipeline boards."
        actions={
          <ShaylaPromptButton
            prompt="Shayla, review my Company Intelligence planner. Use company profiles, readiness, OA logs, and strategy pipeline only. Give me a German-English placement plan with the next 3 actions."
            variant="secondary"
          >
            Ask Shayla
          </ShaylaPromptButton>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 select-none">
        {/* Left Column: Companies selection list */}
        <div className="xl:col-span-1 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider pl-1">Target Profiles</span>
          <div className="flex flex-col gap-2">
            {companies.map((c) => {
              const isSelected = selectedCompanyId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCompanyId(c.id)}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition ${
                    isSelected
                      ? 'border-accentBlue bg-accentBlue/5 text-textPrimary font-bold'
                      : 'border-white/5 bg-black/25 text-textSecondary hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs uppercase tracking-wider truncate max-w-[120px]">{c.name}</span>
                    <Badge variant={c.preparationPriority === 'high' ? 'warning' : 'neutral'}>
                      {c.preparationPriority}
                    </Badge>
                  </div>
                  <span className="text-[8px] text-textMuted">{c.category} | Readiness: {c.readinessScore > 0 ? `${c.readinessScore}%` : 'Not enough data'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Main workspace with inner tabs */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          {/* Inner workspace tabs */}
          <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 text-[10px] font-black uppercase tracking-wider self-start">
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'plan' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
              }`}
            >
              Study Plan
            </button>
            <button
              onClick={() => setActiveTab('readiness')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'readiness' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
              }`}
            >
              Readiness Check
            </button>
            <button
              onClick={() => setActiveTab('oa')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'oa' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
              }`}
            >
              OA Logs
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === 'pipeline' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
              }`}
            >
              Strategy Pipeline
            </button>
          </div>

          <div className="flex-1">
            {activeTab === 'plan' && selectedCompany && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <Card className="p-4 border-white/5 bg-[#0a0a1a]/55">
                  <span className="text-[9px] text-accentBlue font-black uppercase tracking-widest block">Company context</span>
                  <h4 className="text-sm font-black text-textPrimary mt-0.5">{selectedCompany.name} Workspace</h4>
                  <p className="text-[10px] text-textSecondary mt-2 leading-relaxed">{selectedCompany.generalHiringFocus}</p>
                  <div className="mt-3">
                    <ShaylaPromptButton
                      prompt={`Shayla, create a company-specific prep plan for ${selectedCompany.name}. Hiring focus: ${selectedCompany.generalHiringFocus}. My readiness score is ${selectedCompany.readinessScore || 0}. Keep it honest and do not assume I completed anything.`}
                      size="sm"
                    >
                      Shayla plan
                    </ShaylaPromptButton>
                  </div>
                </Card>
                <PrepPlanGenerator
                  companyId={selectedCompany.id}
                  companyName={selectedCompany.name}
                />
              </div>
            )}

            {activeTab === 'readiness' && selectedCompany && (
              <div className="animate-fadeIn">
                <CompanyReadinessCard companyId={selectedCompany.id} />
              </div>
            )}

            {activeTab === 'oa' && (
              <div className="animate-fadeIn max-w-xl">
                <OAAttemptForm />
              </div>
            )}

            {activeTab === 'pipeline' && (
              <div className="animate-fadeIn">
                <PlacementStrategyBoard />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CompanyIntelligencePage;
