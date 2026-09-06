import React, { useState, useEffect } from 'react';
import { useMockInterviewOS } from '../../hooks/useMockInterviewOS';
import { InterviewQuestion } from '../../types/mockInterview';
import { STARAnswerBuilder } from './STARAnswerBuilder';
import { ProjectExplanationBuilder } from './ProjectExplanationBuilder';
import { AnswerVersionTabs } from './AnswerVersionTabs';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';


interface AnswerBuilderProps {
  question: InterviewQuestion;
  onClose: () => void;
}

type ModeType = 'general' | 'star' | 'project' | 'versions';

export const AnswerBuilder: React.FC<AnswerBuilderProps> = ({ question, onClose }) => {
  const { answers, saveAnswerDraft } = useMockInterviewOS();
  const currentDraft = answers[question.id] || {
    questionId: question.id,
    answerText: '',
    confidenceRating: 3,
    practicedCount: 0,
    isPracticed: false,
  };

  const [activeMode, setActiveMode] = useState<ModeType>('general');
  const [answerText, setAnswerText] = useState(currentDraft.answerText || '');
  const [confidence, setConfidence] = useState(currentDraft.confidenceRating || 3);
  const [practicedCount, setPracticedCount] = useState(currentDraft.practicedCount || 0);

  // STAR fields
  const [star, setStar] = useState(currentDraft.starFormat || {
    situation: '',
    task: '',
    action: '',
    result: '',
  });

  // Project fields
  const [projectExp, setProjectExp] = useState(currentDraft.projectExplanation || {
    problem: '',
    users: '',
    solution: '',
    techStack: '',
    aiDataPart: '',
    myContribution: '',
    impact: '',
    whatILearned: '',
    nextImprovement: '',
  });

  // Versions fields
  const [versions, setVersions] = useState(currentDraft.versions || {
    v30s: '',
    v60s: '',
    v2m: '',
    bullets: [],
  });

  useEffect(() => {
    setAnswerText(currentDraft.answerText || '');
    setConfidence(currentDraft.confidenceRating || 3);
    setPracticedCount(currentDraft.practicedCount || 0);
    setStar(currentDraft.starFormat || { situation: '', task: '', action: '', result: '' });
    setProjectExp(currentDraft.projectExplanation || {
      problem: '', users: '', solution: '', techStack: '', aiDataPart: '',
      myContribution: '', impact: '', whatILearned: '', nextImprovement: '',
    });
    setVersions(currentDraft.versions || { v30s: '', v60s: '', v2m: '', bullets: [] });
  }, [question.id]);

  const handleSave = () => {
    saveAnswerDraft(question.id, {
      answerText,
      confidenceRating: confidence,
      starFormat: star,
      projectExplanation: projectExp,
      versions,
      isPracticed: practicedCount > 0,
    });
    alert('Answer draft saved successfully!');
    onClose();
  };

  const handleIncrementPracticed = () => {
    const nextCount = practicedCount + 1;
    setPracticedCount(nextCount);
    saveAnswerDraft(question.id, {
      practicedCount: nextCount,
      isPracticed: true,
    });
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      <div className="border-b border-white/5 pb-2">
        <span className="text-[10px] text-textMuted font-black uppercase tracking-widest">{question.category} Question Workspace</span>
        <h3 className="text-sm font-black text-textPrimary mt-0.5">{question.question}</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Columns: Text area and Framework structure panels */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Format selection */}
          <div className="flex bg-white/5 border border-white/5 rounded-xl p-0.5 self-start text-[9px] font-black uppercase tracking-wider">
            <button
              onClick={() => setActiveMode('general')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeMode === 'general' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
              }`}
            >
              General Draft
            </button>
            <button
              onClick={() => setActiveMode('star')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeMode === 'star' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
              }`}
            >
              STAR Format
            </button>
            <button
              onClick={() => setActiveMode('project')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeMode === 'project' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
              }`}
            >
              Project Structure
            </button>
            <button
              onClick={() => setActiveMode('versions')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeMode === 'versions' ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
              }`}
            >
              Versions (30s / 60s)
            </button>
          </div>

          {activeMode === 'general' && (
            <div className="flex flex-col gap-2">
              <label className="block text-[9px] font-bold text-textMuted uppercase">Standard drafted answer</label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Draft your comprehensive response here. Highlight key technical accomplishments."
                className="w-full min-h-[220px] px-3 py-2 rounded-2xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {activeMode === 'star' && (
            <STARAnswerBuilder
              situation={star.situation}
              task={star.task}
              action={star.action}
              result={star.result}
              onChange={(fields) => setStar(fields)}
            />
          )}

          {activeMode === 'project' && (
            <ProjectExplanationBuilder
              problem={projectExp.problem}
              users={projectExp.users}
              solution={projectExp.solution}
              techStack={projectExp.techStack}
              aiDataPart={projectExp.aiDataPart}
              myContribution={projectExp.myContribution}
              impact={projectExp.impact}
              whatILearned={projectExp.whatILearned}
              nextImprovement={projectExp.nextImprovement}
              onChange={(fields) => setProjectExp(fields)}
            />
          )}

          {activeMode === 'versions' && (
            <AnswerVersionTabs
              v30s={versions.v30s || ''}
              v60s={versions.v60s || ''}
              v2m={versions.v2m || ''}
              bullets={versions.bullets || []}
              onChange={(fields) => setVersions(fields)}
            />
          )}
        </div>

        {/* Right column: Confidence settings and practice trackers */}
        <div className="flex flex-col gap-4">
          <Card className="p-4 border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h4 className="text-[10px] font-black text-textPrimary uppercase tracking-widest border-b border-white/5 pb-2">
              Practice Stats
            </h4>

            <div className="flex items-center justify-between">
              <span className="text-textSecondary">Practiced Count:</span>
              <span className="font-mono font-bold text-textPrimary">{practicedCount} times</span>
            </div>

            <Button
              size="sm"
              onClick={handleIncrementPracticed}
              className="w-full bg-accentBlue text-white uppercase tracking-wider font-black text-[9px] h-9"
            >
              Increment Practice Count
            </Button>
          </Card>

          <Card className="p-4 border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h4 className="text-[10px] font-black text-textPrimary uppercase tracking-widest border-b border-white/5 pb-2">
              Confidence Level
            </h4>

            <div className="flex items-center justify-between">
              <span className="text-textSecondary">Self Rating:</span>
              <span className="px-2 py-0.5 rounded bg-accentBlue/10 text-accentBlue font-bold">{confidence} / 5</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setConfidence(idx)}
                  className={`flex-1 h-8 rounded-lg border text-xs font-semibold transition ${
                    confidence === idx
                      ? 'border-accentBlue bg-accentBlue/25 text-textPrimary'
                      : 'border-white/5 hover:border-white/10 text-textMuted'
                  }`}
                >
                  {idx}
                </button>
              ))}
            </div>
          </Card>

          <div className="flex gap-2.5 mt-auto">
            <Button size="sm" variant="ghost" onClick={onClose} className="flex-1">
              Back to list
            </Button>
            <Button size="sm" onClick={handleSave} className="flex-1">
              Save Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnswerBuilder;
