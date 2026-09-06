import React, { useState, useMemo } from 'react';
import { MockSessionType, InterviewQuestionCategory, MockInterviewSession } from '../../types/mockInterview';
import { useMockInterviewOS } from '../../hooks/useMockInterviewOS';
import { InterviewTimer } from './InterviewTimer';
import { ConfidenceSlider } from './ConfidenceSlider';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface MockSessionRunnerProps {
  config: {
    sessionType: MockSessionType;
    targetRole: string;
    targetCompany: string;
    durationMins: number;
    selectedCategories: InterviewQuestionCategory[];
  };
  onFinish: (session: MockInterviewSession) => void;
}

export const MockSessionRunner: React.FC<MockSessionRunnerProps> = ({ config, onFinish }) => {
  const { questions } = useMockInterviewOS();
  const [currentIdx, setCurrentIdx] = useState(0);

  // Filter questions matching selected categories
  const sessionQuestions = useMemo(() => {
    return questions.filter((q) => config.selectedCategories.includes(q.category));
  }, [questions, config.selectedCategories]);

  // Keep track of answers, confidence, and mistakes for each question
  const [sessionLogs, setSessionLogs] = useState<Record<string, { confidence: number; mistakesText: string }>>({});

  const currentQuestion = sessionQuestions[currentIdx] || null;

  const currentLog = useMemo(() => {
    if (!currentQuestion) return { confidence: 3, mistakesText: '' };
    return sessionLogs[currentQuestion.id] || { confidence: 3, mistakesText: '' };
  }, [currentQuestion, sessionLogs]);

  const handleUpdateLog = (field: 'confidence' | 'mistakesText', val: any) => {
    if (!currentQuestion) return;
    setSessionLogs({
      ...sessionLogs,
      [currentQuestion.id]: {
        ...currentLog,
        [field]: val,
      },
    });
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < sessionQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleFinish = () => {
    if (sessionQuestions.length === 0) return;

    const attempted = sessionQuestions.map((q) => {
      const log = sessionLogs[q.id] || { confidence: 3, mistakesText: '' };
      return {
        questionId: q.id,
        questionText: q.question,
        confidenceScore: log.confidence,
        mistakeLog: log.mistakesText || undefined,
        practiced: true,
      };
    });

    const sumConfidence = attempted.reduce((sum, q) => sum + q.confidenceScore, 0);
    const avgConfidence = sumConfidence / attempted.length;

    // Determine weak areas based on confidence < 3
    const weakCats = new Set<string>();
    const commonErrors: string[] = [];

    attempted.forEach((a) => {
      if (a.confidenceScore < 3) {
        const fullQ = questions.find((q) => q.id === a.questionId);
        if (fullQ) weakCats.add(fullQ.category);
        if (a.mistakeLog) commonErrors.push(a.mistakeLog);
      }
    });

    const completedSession: MockInterviewSession = {
      id: `session-${Date.now()}`,
      sessionType: config.sessionType,
      targetRole: config.targetRole,
      targetCompany: config.targetCompany || undefined,
      durationMins: config.durationMins,
      selectedCategories: config.selectedCategories,
      questionsAttempted: attempted,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      weakAreas: Array.from(weakCats),
      commonMistakes: commonErrors,
      recommendation: avgConfidence >= 4.0
        ? 'Excellent session! Solid confidence demonstrated. Benchmark yourself on more technical categories next.'
        : 'Prepare targeted answers using the STAR framework for low confidence topics and schedule a retry.',
      createdAt: new Date().toISOString(),
    };

    onFinish(completedSession);
  };

  if (sessionQuestions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-textMuted mb-4">No questions found matching the selected categories in default question bank.</p>
        <Button onClick={() => onFinish({} as any)}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 text-xs select-none max-w-lg mx-auto bg-black/45 border border-white/5 p-6 rounded-3xl relative overflow-hidden">
      {/* Top progress indicators */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">
            Question {currentIdx + 1} of {sessionQuestions.length}
          </span>
          <h4 className="text-sm font-black text-textPrimary mt-0.5">Active Simulation Run</h4>
        </div>
        <InterviewTimer initialMins={config.durationMins} isActive={true} />
      </div>

      {currentQuestion && (
        <div className="flex flex-col gap-4 py-2">
          {/* Question Box */}
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-2">
            <span className="px-1.5 py-0.5 rounded bg-accentBlue/10 text-accentBlue text-[8px] font-bold uppercase tracking-wider self-start">
              {currentQuestion.category}
            </span>
            <p className="text-sm font-black text-textPrimary leading-relaxed">{currentQuestion.question}</p>
            {currentQuestion.notes && (
              <p className="text-[10px] text-textMuted italic leading-relaxed mt-1">Hint: {currentQuestion.notes}</p>
            )}
          </div>

          {/* Answer rating slider */}
          <ConfidenceSlider
            value={currentLog.confidence}
            onChange={(val) => handleUpdateLog('confidence', val)}
          />

          {/* Reflections/mistakes logs */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-[9px] font-bold text-textMuted uppercase">Mistakes / Recovery notes</label>
            <textarea
              value={currentLog.mistakesText}
              onChange={(e) => handleUpdateLog('mistakesText', e.target.value)}
              placeholder="Did you pause too long? Log filler word count or logic gaps."
              className="w-full min-h-[75px] px-3 py-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* Navigation and Finish controls */}
      <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 text-[9px] uppercase font-bold"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>

        {currentIdx < sessionQuestions.length - 1 ? (
          <Button
            size="sm"
            onClick={handleNext}
            className="flex items-center gap-1 text-[9px] uppercase font-bold"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleFinish}
            className="flex items-center gap-1 bg-accentEmerald text-white hover:bg-accentEmerald/90 text-[9px] uppercase font-black tracking-widest px-4.5"
          >
            <Check className="h-4 w-4" />
            Finish
          </Button>
        )}
      </div>
    </div>
  );
};
export default MockSessionRunner;
