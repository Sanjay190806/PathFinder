import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { QuestionBank } from '../components/mock-interview/QuestionBank';
import { AnswerBuilder } from '../components/mock-interview/AnswerBuilder';
import { MockSessionSetup } from '../components/mock-interview/MockSessionSetup';
import { MockSessionRunner } from '../components/mock-interview/MockSessionRunner';
import { MockSessionSummary } from '../components/mock-interview/MockSessionSummary';
import { CommunicationScoreCard } from '../components/communication/CommunicationScoreCard';
import { CommunicationPracticeForm } from '../components/communication/CommunicationPracticeForm';
import { SpeakingConfidenceTracker } from '../components/communication/SpeakingConfidenceTracker';
import { CommunicationTrendPanel } from '../components/communication/CommunicationTrendPanel';
import { ProjectPracticeHub } from '../components/mock-interview/ProjectPracticeHub';
import { InterviewMistakeTracker } from '../components/mock-interview/InterviewMistakeTracker';
import { useMockInterviewOS } from '../hooks/useMockInterviewOS';
import { mockInterviewService } from '../services/mockInterviewService';
import { MessageSquare, Bot, GraduationCap, AlertTriangle, ShieldCheck } from 'lucide-react';

type TabType = 'questions' | 'session' | 'communication' | 'projects' | 'mistakes';
export const MockInterviewOSPage: React.FC = () => {
  const { questions } = useMockInterviewOS();
  const [activeTab, setActiveTab] = useState<TabType>('questions');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Runner state
  const [runnerConfig, setRunnerConfig] = useState<any>(null);
  const [activeSummary, setActiveSummary] = useState<any>(null);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null;
  const stats = mockInterviewService.compileMockStats();

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="Mock Interview OS & Communication Coach"
        subtitle="Simulate real technical/HR interviews, structure project answers using the STAR framework, check filler words, and resolve mistake logs."
      />

      {/* Tabs Row */}
      <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 text-xs font-black uppercase tracking-wider self-start select-none">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'questions' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Question Bank</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('session');
            setRunnerConfig(null);
            setActiveSummary(null);
          }}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'session' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>Mock Simulator</span>
        </button>
        <button
          onClick={() => setActiveTab('communication')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'communication' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Speech Coach</span>
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'projects' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Project Pitches</span>
        </button>
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'mistakes' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Mistake Tracker</span>
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
          <div className="xl:col-span-2">
            {selectedQuestion ? (
              <AnswerBuilder
                question={selectedQuestion}
                onClose={() => setSelectedQuestionId(null)}
              />
            ) : (
              <QuestionBank onSelectQuestion={(id) => setSelectedQuestionId(id)} />
            )}
          </div>

          <div className="flex flex-col gap-5 select-none">
            {/* Quick stats summary card */}
            <div className="rounded-2xl border border-white/5 bg-[#0a0a1a]/55 p-4 flex flex-col gap-3">
              <span className="text-[9px] text-textMuted font-black uppercase tracking-widest border-b border-white/5 pb-2">
                Prep Summary Stats
              </span>
              <div className="flex justify-between items-center text-xs text-textSecondary">
                <span>Practiced Answers:</span>
                <span className="font-mono font-bold text-textPrimary">{stats.savedAnswersCount} drafted</span>
              </div>
              <div className="flex justify-between items-center text-xs text-textSecondary">
                <span>Mock Sessions:</span>
                <span className="font-mono font-bold text-textPrimary">{stats.totalSessions} completed</span>
              </div>
              <div className="flex justify-between items-center text-xs text-textSecondary">
                <span>Weakest Category:</span>
                <span className="px-1.5 py-0.5 rounded bg-accentOrange/10 text-accentOrange text-[9px] font-black uppercase">
                  {stats.weakestArea}
                </span>
              </div>
            </div>
            <CommunicationTrendPanel />
          </div>
        </div>
      )}

      {activeTab === 'session' && (
        <div className="animate-fadeIn">
          {activeSummary ? (
            <MockSessionSummary
              session={activeSummary}
              onClose={() => {
                setActiveSummary(null);
                setRunnerConfig(null);
              }}
            />
          ) : runnerConfig ? (
            <MockSessionRunner
              config={runnerConfig}
              onFinish={(session) => {
                if (session.id) {
                  setActiveSummary(session);
                } else {
                  setRunnerConfig(null);
                }
              }}
            />
          ) : (
            <MockSessionSetup onStart={(conf) => setRunnerConfig(conf)} />
          )}
        </div>
      )}

      {activeTab === 'communication' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          <div className="flex flex-col gap-6">
            <CommunicationPracticeForm />
            <SpeakingConfidenceTracker />
          </div>
          <div className="flex flex-col gap-6">
            <CommunicationScoreCard
              overallScore={stats.avgCommunicationScore}
              clarity={4}
              confidence={4}
              structure={3}
              conciseness={4}
              technicalExplanation={3}
              storytelling={3}
            />
            <CommunicationTrendPanel />
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="max-w-3xl mx-auto w-full animate-fadeIn">
          <ProjectPracticeHub />
        </div>
      )}

      {activeTab === 'mistakes' && (
        <div className="max-w-2xl mx-auto w-full animate-fadeIn">
          <InterviewMistakeTracker />
        </div>
      )}
    </div>
  );
};
export default MockInterviewOSPage;
