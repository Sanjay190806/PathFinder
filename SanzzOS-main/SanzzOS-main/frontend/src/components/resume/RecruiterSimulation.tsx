import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useAISettingsStore } from '../../app/store/useAISettingsStore';
import { useResumeStudioStore } from '../../app/store/useResumeStudioStore';
import { generateRecruiterReview } from '../../services/resumeStudioService';
import { buildResumeStudioContext, createScoreSnapshot } from '../../utils/resumeStudioUtils';
import { ShaylaPromptButton } from '../ai/ShaylaPromptButton';
import { ResumeRecruiterReview } from '../../types/resumeStudio';

export const RecruiterSimulation: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const settings = useAISettingsStore((s) => s);
  const store = useResumeStudioStore((s) => s);
  const addRecruiterReview = useResumeStudioStore((s) => s.addRecruiterReview);
  const addResumeScoreSnapshot = useResumeStudioStore((s) => s.addResumeScoreSnapshot);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<ResumeRecruiterReview | null>(store.recruiterReviews[0] || null);

  const context = useMemo(
    () => buildResumeStudioContext(careerState, store.selectedResumeVersion, store.lastJobDescription),
    [careerState, store.selectedResumeVersion, store.lastJobDescription]
  );

  const handleReview = async () => {
    setLoading(true);
    try {
      const result = await generateRecruiterReview(store.lastJobDescription, context, {
        provider: settings.activeProvider,
        model: settings.activeModel,
        mode: settings.activeMode,
        streaming: settings.streamingEnabled,
      });
      setReview(result);
      addRecruiterReview(result);
      addResumeScoreSnapshot(createScoreSnapshot(store.selectedResumeVersion, result.score, result.topFixes[0] || 'Recruiter review completed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Recruiter Review</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Strict but fair recruiter simulation</h3>
        </div>
        <Badge variant={review ? (review.score >= 80 ? 'success' : 'neutral') : 'neutral'}>
          {review ? `${review.score}/100` : 'Not run'}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleReview} disabled={loading}>
          {loading ? 'Reviewing...' : 'Run Recruiter Review'}
        </Button>
        <ShaylaPromptButton
          prompt={`Review my resume like a strict but fair recruiter. Target role: ${context.currentTargetRole}. Selected version: ${context.selectedResumeVersion}. Missing keywords: ${context.missingKeywords.join(', ') || 'none'}. Projects: ${context.projectHighlights.join(' | ') || 'none'}.`}
        >
          Ask Shayla to review this resume
        </ShaylaPromptButton>
      </div>

      {review && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">Top fixes</p>
            <ul className="mt-2 space-y-2 text-xs text-textSecondary">
              {review.topFixes.slice(0, 5).map((fix) => <li key={fix}>• {fix}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">Suggested positioning</p>
            <p className="mt-2 text-xs text-textSecondary">{review.suggestedPositioning}</p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">Recruiter questions</p>
            <ul className="mt-2 space-y-2 text-xs text-textSecondary">
              {review.recruiterQuestions.slice(0, 4).map((question) => <li key={question}>• {question}</li>)}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};
