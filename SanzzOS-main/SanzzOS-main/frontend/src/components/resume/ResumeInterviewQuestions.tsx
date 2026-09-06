import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useAISettingsStore } from '../../app/store/useAISettingsStore';
import { useResumeStudioStore } from '../../app/store/useResumeStudioStore';
import { generateInterviewQuestions } from '../../services/resumeStudioService';
import { buildResumeStudioContext } from '../../utils/resumeStudioUtils';
import { ShaylaPromptButton } from '../ai/ShaylaPromptButton';
import { ResumeInterviewQuestionGroup } from '../../types/resumeStudio';

export const ResumeInterviewQuestions: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const settings = useAISettingsStore((s) => s);
  const store = useResumeStudioStore((s) => s);
  const setInterviewQuestionSets = useResumeStudioStore((s) => s.setInterviewQuestionSets);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<ResumeInterviewQuestionGroup[]>(store.interviewQuestionSets);

  const context = useMemo(
    () => buildResumeStudioContext(careerState, store.selectedResumeVersion, store.lastJobDescription),
    [careerState, store.selectedResumeVersion, store.lastJobDescription]
  );

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await generateInterviewQuestions(context, {
        provider: settings.activeProvider,
        model: settings.activeModel,
        mode: settings.activeMode,
        streaming: settings.streamingEnabled,
      });
      setGroups(response);
      setInterviewQuestionSets(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Interview Questions</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Questions derived from your resume</h3>
        </div>
        <Badge variant={groups.length > 0 ? 'success' : 'neutral'}>{groups.length} groups</Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Questions'}
        </Button>
        <ShaylaPromptButton
          prompt={`Generate interview questions from my resume. Selected version: ${context.selectedResumeVersion}. Target role: ${context.currentTargetRole}. Projects: ${context.projectHighlights.join(' | ') || 'none'}. Missing keywords: ${context.missingKeywords.join(', ') || 'none'}.`}
        >
          Ask Shayla to generate interview questions
        </ShaylaPromptButton>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group.category} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">{group.category}</p>
            <div className="mt-3 space-y-3">
              {group.questions.map((question) => (
                <div key={question.question} className="rounded-xl border border-border-subtle bg-bgSurface/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-textPrimary">{question.question}</p>
                    <Badge variant="neutral">{question.difficulty}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-textSecondary">{question.whyAsked}</p>
                  <p className="mt-2 text-xs text-textSecondary"><span className="font-semibold text-textPrimary">Outline:</span> {question.answerOutline}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
