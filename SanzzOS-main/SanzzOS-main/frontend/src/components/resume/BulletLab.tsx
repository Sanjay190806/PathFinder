import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAISettingsStore } from '../../app/store/useAISettingsStore';
import { useResumeStudioStore } from '../../app/store/useResumeStudioStore';
import { generateResumeBullets } from '../../services/resumeStudioService';
import { ResumeBulletGeneration } from '../../types/resumeStudio';
import { ShaylaPromptButton } from '../ai/ShaylaPromptButton';

const DEFAULT_INPUT = {
  projectName: 'Sanju Career OS',
  actionVerb: 'Built',
  techStack: 'React, TypeScript, Node.js',
  problemSolved: 'a fragmented placement tracker',
  measurableImpact: 'reduced manual tracking friction',
  roleType: 'SWE',
  targetCompany: 'Zoho',
  tone: 'ATS' as const,
};

export const BulletLab: React.FC = () => {
  const settings = useAISettingsStore((s) => s);
  const store = useResumeStudioStore((s) => s);
  const addBulletGeneration = useResumeStudioStore((s) => s.addBulletGeneration);
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeBulletGeneration | null>(store.bulletGenerations[0] || null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await generateResumeBullets(input, {
        provider: settings.activeProvider,
        model: settings.activeModel,
        mode: settings.activeMode,
        streaming: settings.streamingEnabled,
      });
      setResult(response);
      addBulletGeneration(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Bullet Lab</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Generate truthful bullet variants</h3>
        </div>
        <Badge variant={result ? 'success' : 'neutral'}>{result ? 'Generated' : 'Waiting'}</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {[
          ['Project name', 'projectName'],
          ['Action verb', 'actionVerb'],
          ['Tech stack', 'techStack'],
          ['Problem solved', 'problemSolved'],
          ['Measurable impact', 'measurableImpact'],
          ['Target company', 'targetCompany'],
        ].map(([label, key]) => (
          <label key={key} className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-bgSurface/30 p-3 text-xs text-textSecondary">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">{label}</span>
            <input
              value={(input as any)[key]}
              onChange={(e) => setInput((prev) => ({ ...prev, [key]: e.target.value }))}
              className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary focus:border-accentBlue focus:outline-none"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Bullets'}
        </Button>
        <ShaylaPromptButton
          prompt={`Improve these resume bullets for me without inventing metrics:\n\nProject: ${input.projectName}\nAction: ${input.actionVerb}\nStack: ${input.techStack}\nProblem: ${input.problemSolved}\nImpact: ${input.measurableImpact}\nRole: ${input.roleType}\nCompany: ${input.targetCompany}\nTone: ${input.tone}`}
        >
          Ask Shayla to improve this bullet
        </ShaylaPromptButton>
      </div>

      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">3 variations</p>
            <ul className="mt-2 space-y-2 text-xs text-textSecondary">
              {result.variations.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-textMuted">Formats</p>
            <div className="mt-2 space-y-2 text-xs text-textSecondary">
              <p><span className="font-semibold text-textPrimary">STAR:</span> {result.starVersion}</p>
              <p><span className="font-semibold text-textPrimary">ATS:</span> {result.atsVersion}</p>
              <p><span className="font-semibold text-textPrimary">Honest:</span> {result.honestVersion}</p>
              <p><span className="font-semibold text-textPrimary">Quantified:</span> {result.quantifiedVersion}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
