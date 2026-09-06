import React, { useState, useEffect } from 'react';
import { usePortfolioOS } from '../../hooks/usePortfolioOS';
import { Button } from '../ui/Button';
import { Check, Copy } from 'lucide-react';

interface ProjectTemplate {
  key: string;
  name: string;
  defaultTitle: string;
  defaultSummary: string;
  problemPlaceholder: string;
  contributionPlaceholder: string;
  impactPlaceholder: string;
}

const PROJECTS: ProjectTemplate[] = [
  {
    key: 'caresync',
    name: 'CareSync AI',
    defaultTitle: 'CareSync AI - Clinical Triage Prioritization',
    defaultSummary: 'An AI-powered emergency vital monitoring and prioritization dashboard.',
    problemPlaceholder: 'Emergency medical staff face data overload with hundreds of simultaneous patient vital logs, leading to latency in treating high-risk patients.',
    contributionPlaceholder: 'Implemented vital anomalies tracking state models. Conceptually mapped patient risk bounds inside local cache arrays to limit synchronization lag.',
    impactPlaceholder: 'Lowered vital tracking interface latency, providing doctors with real-time prioritize metrics.',
  },
  {
    key: 'smartedu',
    name: 'SmartEdu AI',
    defaultTitle: 'SmartEdu AI - Adaptive Learning Academy',
    defaultSummary: 'A personalized adaptive curriculum and quiz recommended planner.',
    problemPlaceholder: 'Traditional course roadmaps do not adapt to individual learning speeds, causing students to spend hours on mastered subjects.',
    contributionPlaceholder: 'Designed Zustand storage engines to serialize completed quiz ratings. Dynamic mapping structures recommend next optimal chapters.',
    impactPlaceholder: 'Optimized syllabus navigation with verified learning consistency logs.',
  },
  {
    key: 'career_os',
    name: 'Sanju Career OS',
    defaultTitle: 'Sanju Career OS - Offline-First Portfolio OS',
    defaultSummary: 'An offline-first progressive web application for career tracking.',
    problemPlaceholder: 'Job seekers lack a consolidated workspace to track mock scores, company targets, and build recruiter public profiles safely.',
    contributionPlaceholder: 'Engineered service workers caching, local backup export schemas, and calendar-aware system prompts.',
    impactPlaceholder: 'Enabled local-first workspace tracking with zero sync data loss.',
  }
];

export const CaseStudyBuilder: React.FC = () => {
  const { caseStudies, saveCaseStudy } = usePortfolioOS();
  const [activeKey, setActiveKey] = useState('caresync');

  const selectedProj = PROJECTS.find((p) => p.key === activeKey) || PROJECTS[0];
  const currentStudy = caseStudies[selectedProj.key] || {
    title: '',
    oneLineSummary: '',
    problem: '',
    solution: '',
    myContribution: '',
    impact: '',
    githubLink: '',
    demoLink: '',
    whatILearned: '',
    nextImprovements: '',
  };

  const [title, setTitle] = useState(currentStudy.title || selectedProj.defaultTitle);
  const [summary, setSummary] = useState(currentStudy.oneLineSummary || selectedProj.defaultSummary);
  const [problem, setProblem] = useState(currentStudy.problem || '');
  const [solution, setSolution] = useState(currentStudy.solution || '');
  const [contribution, setContribution] = useState(currentStudy.myContribution || '');
  const [impact, setImpact] = useState(currentStudy.impact || '');
  const [github, setGithub] = useState(currentStudy.githubLink || '');
  const [demo, setDemo] = useState(currentStudy.demoLink || '');
  const [learned, setLearned] = useState(currentStudy.whatILearned || '');
  const [improvements, setImprovements] = useState(currentStudy.nextImprovements || '');

  // Reset fields when switching project
  useEffect(() => {
    const study = caseStudies[selectedProj.key] || {};
    setTitle(study.title || selectedProj.defaultTitle);
    setSummary(study.oneLineSummary || selectedProj.defaultSummary);
    setProblem(study.problem || '');
    setSolution(study.solution || '');
    setContribution(study.myContribution || '');
    setImpact(study.impact || '');
    setGithub(study.githubLink || '');
    setDemo(study.demoLink || '');
    setLearned(study.whatILearned || '');
    setImprovements(study.nextImprovements || '');
  }, [activeKey, caseStudies]);

  const handleSave = () => {
    saveCaseStudy(selectedProj.key, {
      title,
      oneLineSummary: summary,
      problem,
      targetUsers: '',
      solution,
      techStack: '',
      architecture: '',
      aiDataPart: '',
      productThinking: '',
      myContribution: contribution,
      challenges: '',
      decisions: '',
      impact,
      githubLink: github,
      demoLink: demo,
      videoLink: '',
      whatILearned: learned,
      nextImprovements: improvements,
    });
    alert(`${selectedProj.name} case study saved successfully!`);
  };

  const copyAsMarkdown = () => {
    const md = `
# ${title}

## Summary
${summary}

## Problem Statement
${problem}

## Proposed Solution
${solution}

## My Contribution
${contribution}

## Impact & Results
${impact}

## Codebase & Demos
- **GitHub**: ${github || 'N/A'}
- **Live Demo**: ${demo || 'N/A'}

## Lessons Learned
${learned}

## Next Steps
${improvements}
    `.trim();
    navigator.clipboard.writeText(md);
    alert('Copied case study as Markdown to clipboard!');
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none bg-black/45 border border-white/5 p-5 rounded-2xl">
      <div className="flex justify-between items-start border-b border-white/5 pb-2">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Case Study Studio</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">Project Case Study Builder</h3>
        </div>
      </div>

      {/* Selector buttons */}
      <div className="grid grid-cols-3 gap-2">
        {PROJECTS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveKey(p.key)}
            className={`p-2.5 rounded-xl border text-left font-bold transition ${
              activeKey === p.key
                ? 'border-accentBlue bg-accentBlue/5 text-textPrimary'
                : 'border-white/5 bg-black/25 text-textSecondary hover:border-white/10'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid gap-3.5 mt-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Summary</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Problem Statement</label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder={selectedProj.problemPlaceholder}
            className="w-full min-h-[45px] px-3 py-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Proposed Solution</label>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="e.g. Engineered custom vital monitor interfaces using vanilla styling..."
            className="w-full min-h-[45px] px-3 py-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">My Specific Contribution</label>
          <textarea
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            placeholder={selectedProj.contributionPlaceholder}
            className="w-full min-h-[45px] px-3 py-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Impact / Results (Qualitative/Honest)</label>
            <input
              type="text"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              placeholder={selectedProj.impactPlaceholder}
              className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Key Lessons Learned</label>
            <input
              type="text"
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="e.g. Mastered local state persistence and WebSocket listeners..."
              className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">GitHub Link</label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/username/project"
              className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Demo Link</label>
            <input
              type="text"
              value={demo}
              onChange={(e) => setDemo(e.target.value)}
              placeholder="https://demo.project.com"
              className="w-full h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex gap-2.5 justify-end mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={copyAsMarkdown}
            className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider h-9"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Markdown
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-1 bg-accentBlue text-white hover:bg-accentBlue/90 font-black uppercase tracking-wider text-[9px] h-9"
          >
            <Check className="h-3.5 w-3.5" />
            Save Case Study
          </Button>
        </div>
      </div>
    </div>
  );
};
export default CaseStudyBuilder;
