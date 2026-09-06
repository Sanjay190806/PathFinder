import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useAISettingsStore } from '../../app/store/useAISettingsStore';
import { useResumeStudioStore } from '../../app/store/useResumeStudioStore';
import { analyzeJobDescription } from '../../services/resumeStudioService';
import { buildResumeStudioContext, createScoreSnapshot } from '../../utils/resumeStudioUtils';
import { ShaylaPromptButton } from '../ai/ShaylaPromptButton';

export const JobDescriptionAnalyzer: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const settings = useAISettingsStore((s) => s);
  const store = useResumeStudioStore((s) => s);
  const setLastJobDescription = useResumeStudioStore((s) => s.setLastJobDescription);
  const addJobAnalysis = useResumeStudioStore((s) => s.addJobAnalysis);
  const addResumeScoreSnapshot = useResumeStudioStore((s) => s.addResumeScoreSnapshot);
  const [jobDescription, setJobDescription] = useState(store.lastJobDescription || '');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(store.jobAnalyses[0] || null);

  const resumeContext = useMemo(
    () => buildResumeStudioContext(careerState, store.selectedResumeVersion, jobDescription),
    [careerState, store.selectedResumeVersion, jobDescription]
  );

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    try {
      setLastJobDescription(jobDescription);
      const result = await analyzeJobDescription(jobDescription, resumeContext, {
        provider: settings.activeProvider,
        model: settings.activeModel,
        mode: settings.activeMode,
        streaming: settings.streamingEnabled,
      });
      setAnalysis(result);
      addJobAnalysis(result);
      addResumeScoreSnapshot(
        createScoreSnapshot(
          store.selectedResumeVersion,
          result.estimatedMatchScore,
          result.recommendations[0] || `Match analyzed for ${result.roleTitle}`
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Job Description Analyzer</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Paste a role and get ATS guidance</h3>
        </div>
        <Badge variant={analysis ? (analysis.estimatedMatchScore >= 70 ? 'success' : 'neutral') : 'neutral'}>
          {analysis ? `${analysis.estimatedMatchScore}% match` : 'No analysis yet'}
        </Badge>
      </div>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here..."
        className="min-h-[160px] rounded-2xl border border-border-subtle bg-bgSurface/40 p-4 text-xs text-textPrimary placeholder:text-textMuted focus:border-accentBlue focus:outline-none"
      />

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleAnalyze} disabled={loading || !jobDescription.trim()}>
          {loading ? 'Analyzing...' : 'Analyze Job'}
        </Button>
        <ShaylaPromptButton
          prompt={`Help me tailor my resume for this job description:\n\n${jobDescription || 'No job description pasted yet.'}\n\nUse my resume context carefully and suggest top improvements.`}
        >
          Ask Shayla to tailor
        </ShaylaPromptButton>
      </div>

      {analysis && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">Role title</p>
            <h4 className="mt-2 text-base font-semibold text-textPrimary">{analysis.roleTitle}</h4>
            <p className="mt-1 text-xs text-textSecondary">Estimated match score: {analysis.estimatedMatchScore}%</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">Recommendations</p>
            <ul className="mt-2 space-y-2 text-xs text-textSecondary">
              {analysis.recommendations.slice(0, 3).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};
