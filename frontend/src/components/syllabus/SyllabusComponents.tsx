'use client';

import React, { useState } from 'react';
import {
  BookOpen, CheckCircle2, Circle, Clock, Award, ShieldCheck,
  ChevronDown, ChevronRight, Layers, Target, Sparkles, AlertCircle,
  BarChart2, FileText, CheckCircle
} from 'lucide-react';

export interface ObjectiveItem {
  id: string;
  topic_id: string;
  objective: string;
  objective_type: string;
  skill_ids: string[];
  difficulty: string;
  importance: string;
}

export interface SubtopicItem {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  difficulty: string;
}

export interface TopicItem {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  order_index: number;
  weight: number;
  difficulty: string;
  estimated_learning_hours: number;
  subtopics: SubtopicItem[];
  objectives: ObjectiveItem[];
  skills: any[];
}

export interface ModuleItem {
  id: string;
  syllabus_id: string;
  title: string;
  description?: string;
  order_index: number;
  weight: number;
  estimated_learning_hours: number;
  prerequisite_module_ids: string[];
  topics: TopicItem[];
}

export interface SyllabusDetail {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  version: number;
  is_active: boolean;
  language: string;
  source: string;
  source_url?: string;
  provider: string;
  verification_status: string;
  validation_status: string;
  validation_errors: string[];
  total_estimated_hours: number;
  total_modules: number;
  total_topics: number;
  total_objectives: number;
  modules: ModuleItem[];
}

export interface CoverageData {
  course_id: string;
  syllabus_id: string;
  syllabus_version: number;
  course_state: string;
  total_modules: number;
  completed_modules: number;
  module_coverage_pct: number;
  total_topics: number;
  completed_topics: number;
  topic_coverage_pct: number;
  total_objectives: number;
  mastered_objectives: number;
  objective_coverage_pct: number;
  weighted_coverage_pct: number;
  is_assessment_ready: boolean;
  readiness_reasons: string[];
  completed_module_ids: string[];
  completed_topic_ids: string[];
  mastered_objective_ids: string[];
}

// 1. Version Badge
export function SyllabusVersionBadge({ version, isActive }: { version: number; isActive: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
      <FileText className="w-3.5 h-3.5" />
      v{version} {isActive && <span className="text-[10px] bg-indigo-200 px-1 rounded">Active</span>}
    </span>
  );
}

// 2. Source & Verification Badge
export function SyllabusSource({ source, provider, verificationStatus }: { source: string; provider: string; verificationStatus: string }) {
  const isAi = source === 'AI_ASSISTED_EXTRACTION';
  const isVerified = verificationStatus === 'VERIFIED';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
        Provider: {provider}
      </span>
      {isAi ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <Sparkles className="w-3 h-3 text-amber-600" />
          AI-Assisted Extraction
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {source.replace('_', ' ')}
        </span>
      )}
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium ${
        isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
      }`}>
        <ShieldCheck className="w-3 h-3" />
        {verificationStatus}
      </span>
    </div>
  );
}

// 3. Syllabus Overview
export function SyllabusOverview({
  syllabus,
  coverage
}: {
  syllabus: SyllabusDetail;
  coverage?: CoverageData | null;
}) {
  const stateColor: Record<string, string> = {
    NOT_STARTED: 'bg-slate-100 text-slate-700 border-slate-300',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-300',
    ASSESSMENT_READY: 'bg-emerald-50 text-emerald-800 border-emerald-400 font-bold animate-pulse',
    PASSED: 'bg-green-100 text-green-800 border-green-400',
    FAILED: 'bg-red-50 text-red-700 border-red-300',
    COMPLETED: 'bg-purple-50 text-purple-800 border-purple-300'
  };

  const currentState = coverage?.course_state || 'NOT_STARTED';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{syllabus.title}</h1>
            <SyllabusVersionBadge version={syllabus.version} isActive={syllabus.is_active} />
          </div>
          <p className="text-sm text-slate-600 max-w-3xl mb-3">{syllabus.description}</p>
          <SyllabusSource
            source={syllabus.source}
            provider={syllabus.provider}
            verificationStatus={syllabus.verification_status}
          />
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`px-3 py-1.5 rounded-lg text-xs tracking-wider border ${stateColor[currentState] || stateColor.NOT_STARTED}`}>
            STATE: {currentState.replace('_', ' ')}
          </span>
          <div className="text-right text-xs text-slate-500">
            <div>Language: <span className="font-semibold text-slate-700">{syllabus.language}</span></div>
            <div>Estimated Time: <span className="font-semibold text-slate-700">{syllabus.total_estimated_hours} hrs</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Syllabus Coverage Progress Card
export function SyllabusCoverage({ coverage }: { coverage?: CoverageData | null }) {
  if (!coverage) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-6 shadow-md mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart2 className="w-4 h-4" />
            Syllabus Mastery & Assessment Blueprint
          </div>
          <h2 className="text-xl font-bold text-white">Curriculum Coverage Progress</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {coverage.readiness_reasons.join(' ')}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-emerald-400">{coverage.weighted_coverage_pct}%</div>
            <div className="text-[11px] text-slate-300 uppercase tracking-wider mt-0.5">Weighted Progress</div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-300">
              {coverage.completed_topics}/{coverage.total_topics}
            </div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Topics Done</div>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="text-center">
            <div className="text-xl font-bold text-amber-300">
              {coverage.mastered_objectives}/{coverage.total_objectives}
            </div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Objectives</div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-800 text-xs">
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Module Completion</span>
            <span className="font-semibold">{coverage.module_coverage_pct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${coverage.module_coverage_pct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Topic Completion</span>
            <span className="font-semibold">{coverage.topic_coverage_pct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${coverage.topic_coverage_pct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Objective Mastery</span>
            <span className="font-semibold">{coverage.objective_coverage_pct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full transition-all duration-300" style={{ width: `${coverage.objective_coverage_pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Learning Objective List
export function LearningObjectiveList({
  objectives,
  masteredIds,
  onToggleObjective
}: {
  objectives: ObjectiveItem[];
  masteredIds: Set<string>;
  onToggleObjective?: (objectiveId: string, isMastered: boolean) => void;
}) {
  if (!objectives || objectives.length === 0) return null;

  const typeColors: Record<string, string> = {
    UNDERSTAND: 'bg-blue-100 text-blue-800 border-blue-200',
    EXPLAIN: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    APPLY: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    IMPLEMENT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    ANALYZE: 'bg-purple-100 text-purple-800 border-purple-200',
    DEBUG: 'bg-rose-100 text-rose-800 border-rose-200',
    DESIGN: 'bg-amber-100 text-amber-800 border-amber-200',
    EVALUATE: 'bg-teal-100 text-teal-800 border-teal-200',
    PRACTICE: 'bg-orange-100 text-orange-800 border-orange-200'
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Target className="w-3.5 h-3.5 text-indigo-600" />
        Learning Objectives
      </div>
      <ul className="space-y-2">
        {objectives.map((obj) => {
          const isMastered = masteredIds.has(obj.id);
          return (
            <li
              key={obj.id}
              className="flex items-start justify-between gap-3 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200"
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => onToggleObjective?.(obj.id, !isMastered)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 focus:outline-none"
                  aria-label={`Toggle objective ${obj.objective}`}
                >
                  {isMastered ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <div>
                  <span className={`text-slate-800 ${isMastered ? 'line-through text-slate-500' : ''}`}>
                    {obj.objective}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${typeColors[obj.objective_type] || 'bg-slate-100 text-slate-700'}`}>
                      {obj.objective_type}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {obj.difficulty}
                    </span>
                    {obj.skill_ids && obj.skill_ids.map(sk => (
                      <span key={sk} className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        #{sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// 6. Topic Card
export function TopicCard({
  topic,
  isCompleted,
  masteredObjectiveIds,
  onToggleTopic,
  onToggleObjective
}: {
  topic: TopicItem;
  isCompleted: boolean;
  masteredObjectiveIds: Set<string>;
  onToggleTopic?: (topicId: string, isCompleted: boolean) => void;
  onToggleObjective?: (objectiveId: string, isMastered: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`rounded-lg border transition-colors ${isCompleted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200'}`}>
      <div className="p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <button
            type="button"
            onClick={() => onToggleTopic?.(topic.id, !isCompleted)}
            className="text-slate-400 hover:text-emerald-600 focus:outline-none"
            aria-label={`Mark topic ${topic.title} complete`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
          </button>
          <div>
            <h4 className={`text-sm font-semibold text-slate-900 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
              {topic.order_index}. {topic.title}
            </h4>
            {topic.description && (
              <p className="text-xs text-slate-500 mt-0.5">{topic.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
            Weight: {topic.weight}%
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {topic.estimated_learning_hours}h
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-700 focus:outline-none"
            aria-label="Expand topic details"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 bg-slate-50/50">
          <LearningObjectiveList
            objectives={topic.objectives}
            masteredIds={masteredObjectiveIds}
            onToggleObjective={onToggleObjective}
          />
        </div>
      )}
    </div>
  );
}

// 7. Module Card
export function ModuleCard({
  module,
  completedTopicIds,
  masteredObjectiveIds,
  onToggleTopic,
  onToggleObjective
}: {
  module: ModuleItem;
  completedTopicIds: Set<string>;
  masteredObjectiveIds: Set<string>;
  onToggleTopic?: (topicId: string, isCompleted: boolean) => void;
  onToggleObjective?: (objectiveId: string, isMastered: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const totalTopics = module.topics.length;
  const completedInModule = module.topics.filter(t => completedTopicIds.has(t.id)).length;
  const isAllCompleted = totalTopics > 0 && completedInModule === totalTopics;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between gap-4 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
            isAllCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
          }`}>
            {isAllCompleted ? <CheckCircle2 className="w-5 h-5" /> : module.order_index}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{module.title}</h3>
            {module.description && (
              <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="inline-block text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Weight: {module.weight}%
            </span>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {completedInModule}/{totalTopics} topics ({module.estimated_learning_hours}h)
            </div>
          </div>
          {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-2.5">
          {module.topics.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              isCompleted={completedTopicIds.has(topic.id)}
              masteredObjectiveIds={masteredObjectiveIds}
              onToggleTopic={onToggleTopic}
              onToggleObjective={onToggleObjective}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 8. Module List
export function ModuleList({
  modules,
  completedTopicIds,
  masteredObjectiveIds,
  onToggleTopic,
  onToggleObjective
}: {
  modules: ModuleItem[];
  completedTopicIds: Set<string>;
  masteredObjectiveIds: Set<string>;
  onToggleTopic?: (topicId: string, isCompleted: boolean) => void;
  onToggleObjective?: (objectiveId: string, isMastered: boolean) => void;
}) {
  if (!modules || modules.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-600 text-sm">No curriculum modules registered for this course.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map(mod => (
        <ModuleCard
          key={mod.id}
          module={mod}
          completedTopicIds={completedTopicIds}
          masteredObjectiveIds={masteredObjectiveIds}
          onToggleTopic={onToggleTopic}
          onToggleObjective={onToggleObjective}
        />
      ))}
    </div>
  );
}
