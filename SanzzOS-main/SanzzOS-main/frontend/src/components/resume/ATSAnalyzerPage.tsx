import React, { useMemo, useState } from 'react';
import { Bot, Download, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ResumeUploadZone } from './ResumeUploadZone';
import { ResumeParsedTextPreview } from './ResumeParsedTextPreview';
import { ATSScoreBreakdown } from './ATSScoreBreakdown';
import { ResumeIssueList } from './ResumeIssueList';
import { ResumeKeywordGapPanel } from './ResumeKeywordGapPanel';
import { ResumeRewriteSuggestions } from './ResumeRewriteSuggestions';
import { ResumeCompanyMatchPanel } from './ResumeCompanyMatchPanel';
import { TARGET_COMPANIES, TARGET_ROLES, askResumeAIReview, parseResumeFile, scoreResume } from '../../services/resumeAnalysisService';
import { ResumeAnalysis, useResumeAnalysisStore } from '../../app/store/useResumeAnalysisStore';
import { useAISettingsStore } from '../../app/store/useAISettingsStore';

export const ATSAnalyzerPage: React.FC = () => {
  const { analyses, addAnalysis, attachAIReview, targetRole, targetCompany, setTarget } = useResumeAnalysisStore();
  const aiSettings = useAISettingsStore((s) => s);
  const [file, setFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const latestTopIssue = analyses[0]?.issues[0]?.title || 'No saved analysis yet';

  const canAnalyze = Boolean(manualText.trim() || (file && file.name.toLowerCase().endsWith('.txt')));

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const parsed = await parseResumeFile(file, manualText);
      setManualText(parsed.extractedText);
      setWarnings(parsed.warnings);
    } catch (err: any) {
      setError(err?.message || 'Could not parse resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file && !manualText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const parseTarget = file || new File([manualText], 'pasted-resume.txt', { type: 'text/plain' });
      const parsed = await parseResumeFile(parseTarget, manualText);
      const score = await scoreResume(parsed.extractedText, targetRole, targetCompany);
      const next: ResumeAnalysis = {
        ...score,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        fileName: parseTarget.name,
        fileType: parsed.fileType,
        fileSize: parseTarget.size,
        extractedTextPreview: parsed.extractedText.slice(0, 1800),
        fullExtractedText: parsed.extractedText,
      };
      setManualText(parsed.extractedText);
      setWarnings(parsed.warnings);
      setAnalysis(next);
    } catch (err: any) {
      setError(err?.message || 'Could not analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!analysis) return;
    const storeText = window.confirm('Store extracted resume text with this analysis? Choose Cancel to save score/metadata only.');
    addAnalysis(storeText ? analysis : { ...analysis, fullExtractedText: undefined });
  };

  const handleAIReview = async () => {
    if (!analysis?.fullExtractedText) return;
    const confirmed = window.confirm('Send extracted resume text to Shayla for AI review? This may send text to your selected backend AI provider.');
    if (!confirmed) return;
    setLoading(true);
    try {
      const response = await askResumeAIReview({ extractedText: analysis.fullExtractedText, targetRole, targetCompany, atsScore: analysis.atsScore, keywordGaps: analysis.keywordGaps, aiSettings });
      setAnalysis({ ...analysis, aiReview: response.review });
      attachAIReview(analysis.id, response.review);
    } catch (err: any) {
      setError(err?.message || 'AI review failed.');
    } finally {
      setLoading(false);
    }
  };

  const exportText = useMemo(() => analysis ? JSON.stringify({ ...analysis, fullExtractedText: undefined }, null, 2) : '', [analysis]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <select className="input-field" value={targetRole} onChange={(e) => setTarget(e.target.value, targetCompany)}>{TARGET_ROLES.map((role) => <option key={role}>{role}</option>)}</select>
            <select className="input-field" value={targetCompany} onChange={(e) => setTarget(targetRole, e.target.value)}>{TARGET_COMPANIES.map((company) => <option key={company}>{company}</option>)}</select>
          </div>
          <ResumeUploadZone file={file} onFile={(next) => { setFile(next); setError(next ? '' : 'Unsupported file or file is larger than 5MB.'); }} error={error} />
          <ResumeParsedTextPreview text={manualText} onChange={setManualText} warnings={warnings} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleParse} disabled={!file || loading}>Preview parsed text</Button>
            <Button variant="secondary" onClick={handleAnalyze} disabled={!canAnalyze || loading}>Analyze Resume</Button>
            <Button variant="outline" onClick={() => { setFile(null); setManualText(''); setAnalysis(null); setWarnings([]); }}>Clear File</Button>
          </div>
        </Card>

        <Card className="grid gap-5">
          {analysis ? <ATSScoreBreakdown score={analysis.atsScore} categories={analysis.categoryScores} /> : <div className="py-14 text-center text-sm text-textSecondary">Estimated ATS readiness score appears after analysis.</div>}
          {analysis && <ResumeIssueList issues={analysis.issues} />}
          {analysis && <div className="flex flex-wrap gap-2"><Button size="sm" onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save Analysis</Button><Button size="sm" variant="outline" onClick={handleAIReview}><Bot className="mr-2 h-4 w-4" />Ask Shayla to improve</Button><Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(exportText)}><Download className="mr-2 h-4 w-4" />Export Report</Button></div>}
        </Card>
      </div>

      {analysis && (
        <div className="grid gap-6 xl:grid-cols-3">
          <Card><h3 className="mb-3 font-semibold text-textPrimary">Keyword gaps</h3><ResumeKeywordGapPanel gaps={analysis.keywordGaps} /></Card>
          <Card><h3 className="mb-3 font-semibold text-textPrimary">Company match</h3><ResumeCompanyMatchPanel company={targetCompany} role={targetRole} fixes={analysis.priorityFixes} /></Card>
          <Card><h3 className="mb-3 font-semibold text-textPrimary">Rewrite suggestions</h3><ResumeRewriteSuggestions bullets={analysis.rewrittenBullets} /></Card>
        </div>
      )}

      {analysis?.aiReview && <Card><h3 className="mb-3 font-semibold text-textPrimary">Shayla AI review</h3><pre className="whitespace-pre-wrap text-sm text-textSecondary">{analysis.aiReview}</pre></Card>}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-semibold text-textPrimary">Analysis history</h3><p className="text-xs text-textMuted">Latest top issue: {latestTopIssue}</p></div>
          <p className="text-xs text-textMuted">{analyses.length} saved</p>
        </div>
        <div className="mt-4 grid gap-2">
          {analyses.map((item) => <div key={item.id} className="grid gap-1 rounded-lg border border-border-subtle p-3 text-sm md:grid-cols-[1fr_auto_auto]"><span className="text-textPrimary">{item.fileName}</span><span className="text-textSecondary">{item.targetRole} · {item.targetCompany}</span><span className="font-semibold text-accentBlue">{item.atsScore}/100</span></div>)}
        </div>
      </Card>
    </div>
  );
};
