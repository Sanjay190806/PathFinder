'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { WhyRecommendedModal } from '@/components/WhyRecommendedModal';
import { ResourceCard } from '@/components/ResourceCard';
import { AIAssistantDrawer } from '@/components/AIAssistantDrawer';
import { api, getAuthToken } from '@/lib/api';
import { LearningPath, LearningPathItem, Profile } from '@/lib/types';
import { BookOpen, Sparkles, CheckCircle2, Clock, ChevronDown, ChevronUp, RefreshCw, Layers } from 'lucide-react';
import { formatTimeHours } from '@/lib/utils';

export default function RoadmapPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [selectedWhyItem, setSelectedWhyItem] = useState<LearningPathItem | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    1: true, 2: true, 3: true, 4: true, 5: true
  });
  const [isRegenerating, setIsRegenerating] = useState(false);

  const loadData = async () => {
    try {
      const [profData, pathData] = await Promise.all([
        api.getProfile(),
        api.getLearningPath()
      ]);
      setProfile(profData);
      setLearningPath(pathData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const updatedPath = await api.regenerateRoadmap();
      setLearningPath(updatedPath);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const togglePhase = (num: number) => {
    setExpandedPhases(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const activeVersion = learningPath?.current_version;
  const items = activeVersion?.items || [];

  const phases = [
    { num: 1, name: "Strengthen Foundations", desc: "Core prerequisites, programming syntax & fundamental math" },
    { num: 2, name: "Core Competencies", desc: "Core algorithms, data analysis & foundational domain tooling" },
    { num: 3, name: "Deep Specialization", desc: "Advanced architectures, deep models & specialized frameworks" },
    { num: 4, name: "Engineering & Deployment", desc: "Production APIs, Docker, pipelines & testing" },
    { num: 5, name: "Capstone & Portfolio", desc: "Real-world end-to-end projects & interview preparation" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar
        user={profile}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan">Curriculum Roadmap</span>
              <span className="rounded-md bg-primary-950 px-2 py-0.5 text-[10px] font-bold text-primary-300 border border-primary-800">
                Algorithm: {learningPath?.algorithm_version || 'v1.2.0'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {learningPath?.title || 'Personalized Learning Roadmap'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Organized into 5 progressive phases ensuring 0% prerequisite violations.
            </p>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-raised px-4 py-2.5 text-xs font-semibold text-gray-200 hover:bg-surface-border hover:text-white transition-all disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Re-scoring...' : 'Re-calculate Path'}
          </button>
        </div>

        <div className="space-y-6">
          {phases.map((p) => {
            const phaseItems = items.filter(it => it.phase_number === p.num);
            const isExpanded = expandedPhases[p.num] ?? true;
            const completedCount = phaseItems.filter(it => it.is_completed).length;
            const totalHours = phaseItems.reduce((acc, it) => acc + it.estimated_hours, 0);

            return (
              <div
                key={p.num}
                className="rounded-3xl border border-surface-border bg-surface/90 overflow-hidden shadow-xl"
              >
                <div
                  onClick={() => togglePhase(p.num)}
                  className="flex items-center justify-between p-5 sm:p-6 bg-surface-raised/40 cursor-pointer hover:bg-surface-raised/70 transition-colors border-b border-surface-border"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600/20 text-primary-300 border border-primary-500/30 font-extrabold font-mono text-sm">
                      {p.num}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phase {p.num}</span>
                        <span className="text-xs text-gray-500">?</span>
                        <span className="text-xs text-primary-400 font-semibold">{formatTimeHours(totalHours)}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{p.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{p.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-300 bg-surface px-3 py-1 rounded-full border border-surface-border font-mono">
                      {completedCount}/{phaseItems.length} Done
                    </span>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 sm:p-6 space-y-3 bg-surface/40">
                    {phaseItems.length > 0 ? (
                      phaseItems.map((item) => (
                        <ResourceCard
                          key={item.id}
                          item={item}
                          onWhyClick={(it) => {
                            setSelectedWhyItem(it);
                            setIsWhyModalOpen(true);
                          }}
                        />
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-gray-500">
                        No resources currently allocated to this phase.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <WhyRecommendedModal
        item={selectedWhyItem}
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
      />

      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onPlanAdjusted={loadData}
      />
    </div>
  );
}
