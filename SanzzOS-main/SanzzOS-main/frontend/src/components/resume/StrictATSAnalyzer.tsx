import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAIStore } from '../../app/store/useAIStore';
import { useUIStore } from '../../app/store/useUIStore';
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export const StrictATSAnalyzer: React.FC = () => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const queuePrompt = useAIStore((s) => s.queuePrompt);
  const setActiveSection = useUIStore((s) => s.setActiveSection);

  const handleStrictAnalyze = () => {
    if (!jd.trim() || !resumeText.trim()) {
      alert("Please provide both the Job Description and your Resume text to perform a strict analysis!");
      return;
    }

    setAnalyzing(true);
    setTimeout(() => {
      // Analyze JD for keywords
      const jdWords = jd.toLowerCase().match(/\b[a-z]{3,15}\b/g) || [];
      const resumeWords = resumeText.toLowerCase().match(/\b[a-z]{3,15}\b/g) || [];
      const resumeSet = new Set(resumeWords);

      // Key placement/tech terms to hunt
      const targetKeywords = Array.from(new Set(jdWords.filter(w => 
        ['java', 'python', 'sql', 'dsa', 'react', 'typescript', 'aws', 'docker', 'api', 'fastapi', 
         'database', 'springboot', 'angular', 'algorithms', 'structures', 'testing', 'testing', 
         'backend', 'frontend', 'developer', 'engineer', 'git', 'ci/cd', 'agile'].includes(w)
      ))).slice(0, 10);

      const matchedKeywords = targetKeywords.filter(k => resumeSet.has(k));
      const missingKeywords = targetKeywords.filter(k => !resumeSet.has(k));

      // Scoring factors
      const keywordScore = targetKeywords.length > 0 ? Math.round((matchedKeywords.length / targetKeywords.length) * 100) : 70;
      const lengthScore = resumeText.length > 1000 && resumeText.length < 4000 ? 95 : 60;
      const metricsScore = (resumeText.match(/\d+%/g) || []).length >= 2 ? 90 : 50;
      const contactScore = (resumeText.includes('@') && (resumeText.includes('github.com') || resumeText.includes('linkedin.com'))) ? 100 : 40;

      const overallScore = Math.round((keywordScore * 0.4) + (lengthScore * 0.2) + (metricsScore * 0.2) + (contactScore * 0.2));

      // Formatting Check
      const formattingIssues = [];
      if (resumeText.length > 5000) formattingIssues.push("Resume is too long (> 2 pages equivalent). ATS may truncate.");
      if (resumeText.length < 800) formattingIssues.push("Resume is too short. Lacks depth and projects detail.");
      if (!resumeText.includes('github') && !resumeText.includes('linkedin')) formattingIssues.push("Missing links to active Github/Linkedin profiles.");
      if ((resumeText.match(/\b(responsible for|handled|assisted)\b/gi) || []).length > 3) {
        formattingIssues.push("Too many passive verbs (e.g. 'responsible for'). Replace with strong action verbs.");
      }

      setReport({
        score: overallScore,
        matched: matchedKeywords,
        missing: missingKeywords,
        formattingIssues,
        metricsScore,
        keywordScore,
        rating: overallScore >= 80 ? 'Excellent Match' : overallScore >= 60 ? 'Moderate Match' : 'Poor Match'
      });
      setAnalyzing(false);
    }, 1200);
  };

  const askShaylaStrictTailoring = () => {
    const prompt = `Search for the latest details about ${company || 'Target Company'} - ${role || 'Target Role'}. Perform a STRICT ATS resume review. Here is the Job Description:\n"""\n${jd}\n"""\nAnd here is my resume text:\n"""\n${resumeText}\n"""\nProvide a full detailed report including: 1. ATS Score rating, 2. Critical formatting and keyword fixes, 3. Stronger action verb suggestions, and 4. Project bullet improvement ideas.`;
    queuePrompt(prompt);
    setActiveSection('ai');
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5 border-white/5 bg-bgSurface/40">
        <h3 className="text-base font-bold text-textPrimary mb-1">Strict ATS Analyzer Pro</h3>
        <p className="text-xs text-textMuted mb-4">Analyze your profile strictly against specific company job descriptions to maximize screening success.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-textMuted uppercase">Company Name</span>
            <input
              type="text"
              placeholder="e.g. Zoho, Freshworks"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border-subtle bg-bgSurface/60 text-xs text-textPrimary focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-textMuted uppercase">Target Role</span>
            <input
              type="text"
              placeholder="e.g. Member Technical Staff, Software Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border-subtle bg-bgSurface/60 text-xs text-textPrimary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-textMuted uppercase">Job Description (JD)</span>
            <textarea
              rows={6}
              placeholder="Paste job details, qualifications, core requirements here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="rounded-xl border border-border-subtle bg-bgSurface/60 p-3 text-xs text-textPrimary focus:outline-none resize-y"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-textMuted uppercase">Resume Text</span>
            <textarea
              rows={6}
              placeholder="Paste the plain text copy of your resume here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="rounded-xl border border-border-subtle bg-bgSurface/60 p-3 text-xs text-textPrimary focus:outline-none resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            onClick={handleStrictAnalyze}
            disabled={analyzing}
            variant="secondary"
            className="text-xs h-9 px-4 font-bold"
          >
            {analyzing ? 'Checking Profile...' : 'Analyze Strictly'}
          </Button>
          <Button
            onClick={askShaylaStrictTailoring}
            className="text-xs h-9 px-4 bg-accentBlue text-white hover:bg-accentBlue/90 font-bold gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            Ask Shayla Full Strict Report
          </Button>
        </div>
      </Card>

      {report && (
        <Card className="p-5 border-white/5 bg-bgSurface/40 flex flex-col gap-5 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h4 className="font-bold text-textPrimary text-base">ATS Compliance Report</h4>
              <p className="text-[10px] text-textMuted mt-0.5">Strict parser assessment for {company || 'Target'} - {role || 'Role'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={report.score >= 80 ? 'success' : report.score >= 60 ? 'warning' : 'danger'}>
                {report.rating}
              </Badge>
              <div className="text-right">
                <span className="text-2xl font-black text-textPrimary block">{report.score}%</span>
                <span className="text-[9px] text-textMuted font-bold uppercase">Match Rating</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
              <h5 className="text-xs font-bold text-accentEmerald flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> Matched Keywords
              </h5>
              {report.matched.length === 0 ? (
                <p className="text-[11px] text-textMuted">No key terms from job description matched.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {report.matched.map((k: string) => (
                    <span key={k} className="px-2 py-0.5 rounded bg-accentEmerald/10 text-accentEmerald text-[10px] font-bold border border-accentEmerald/20">
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
              <h5 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Missing Critical Keywords
              </h5>
              {report.missing.length === 0 ? (
                <p className="text-[11px] text-accentEmerald font-semibold">Perfect keywords alignment! ✓</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {report.missing.map((k: string) => (
                    <span key={k} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {report.formattingIssues.length > 0 && (
            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex flex-col gap-2">
              <h5 className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> Critical Checklist Warnings
              </h5>
              <ul className="flex flex-col gap-1.5 mt-1">
                {report.formattingIssues.map((issue: string, idx: number) => (
                  <li key={idx} className="text-[11px] text-textSecondary flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
            <h5 className="text-xs font-bold text-textPrimary">Suggested Next Steps</h5>
            <p className="text-xs text-textSecondary">
              1. Add the missing keyword terms (highlighted above) naturally inside your project descriptions or skills list.<br />
              2. Revise project bullet points to include specific percentages/numbers to pass the recruiter simulation review.<br />
              3. Click <strong>Ask Shayla Full Strict Report</strong> above to get the full formatted tailored version guide.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
