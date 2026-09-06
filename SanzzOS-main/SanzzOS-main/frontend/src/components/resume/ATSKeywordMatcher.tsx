import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useResumeStudioStore } from '../../app/store/useResumeStudioStore';
import { buildResumeStudioContext } from '../../utils/resumeStudioUtils';

export const ATSKeywordMatcher: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const store = useResumeStudioStore((s) => s);
  const latestAnalysis = store.jobAnalyses[0] || null;
  const context = buildResumeStudioContext(careerState, store.selectedResumeVersion, store.lastJobDescription);

  const matching = latestAnalysis?.matchingKeywords || context.matchingKeywords;
  const missing = latestAnalysis?.missingKeywords || context.missingKeywords;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">ATS Keywords</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Match found and missing keywords</h3>
        </div>
        <Badge variant="neutral">{matching.length} matched</Badge>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-accentEmerald">Matching</p>
        <div className="flex flex-wrap gap-2 rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
          {matching.length > 0 ? matching.map((keyword) => <Badge key={keyword} variant="success">{keyword}</Badge>) : <span className="text-xs text-textMuted">No matching keywords yet.</span>}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-red-400">Missing</p>
        <div className="flex flex-wrap gap-2 rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
          {missing.length > 0 ? missing.map((keyword) => <Badge key={keyword} variant="danger">{keyword}</Badge>) : <span className="text-xs text-textMuted">No missing keywords yet.</span>}
        </div>
      </div>
    </Card>
  );
};
