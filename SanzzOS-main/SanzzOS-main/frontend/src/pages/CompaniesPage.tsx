import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useCareerStore } from '../app/store/useCareerStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { 
  Building2, 
  Search
} from 'lucide-react';
import { calcPlacementBreakdown } from '../utils/xpUtils';

export const CompaniesPage: React.FC = () => {
  const companyTargets = useCareerStore((s) => s.companyTargets || []);
  const updateCompanyTarget = useCareerStore((s) => s.updateCompanyTarget);
  const careerState = useCareerStore((s) => s);

  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<'All' | 'Dream' | 'Super Dream' | 'Service'>('All');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Auto-calculated readiness scores and stats
  const placementStats = useMemo(() => {
    return calcPlacementBreakdown(careerState);
  }, [careerState]);

  const statsBreakdown = useMemo(() => {
    // Calculate total solves
    const aptitudeSolved = Object.values(careerState.aptitudeProgress || {}).reduce((sum, item) => sum + (item.questionsSolved || 0), 0);
    const sqlSolved = Object.values(careerState.sqlProgress || {}).reduce((sum, item) => sum + (item.solvedCount || 0), 0);
    
    let csCoreCompleted = 0;
    Object.values(careerState.csCoreProgress || {}).forEach(subject => {
      Object.values(subject).forEach(topic => {
        if (topic.completed) csCoreCompleted++;
      });
    });

    const projectProgresses = Object.values(careerState.projects || {}).map((project: any) => {
      const values = Object.values(project.progress || {}) as number[];
      return values.length ? values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length : 0;
    });
    const averageProjectProgress = projectProgresses.length
      ? projectProgresses.reduce((sum, value) => sum + value, 0) / projectProgresses.length
      : 0;

    const resumeScore = careerState.resume?.atsScore || 0;

    return {
      aptitudeSolved,
      sqlSolved,
      csCoreCompleted,
      averageProjectProgress: Math.round(averageProjectProgress),
      resumeScore
    };
  }, [careerState, placementStats]);

  // Companies Tiers mapping
  const companyTiers: Record<string, 'Dream' | 'Super Dream' | 'Service'> = {
    'zoho': 'Dream',
    'freshworks': 'Dream',
    'mu-sigma': 'Dream',
    'paypal-india': 'Super Dream',
    'oracle-india': 'Super Dream',
    'amazon-india': 'Super Dream',
    'microsoft-india': 'Super Dream',
    'google-india': 'Super Dream',
    'tcs': 'Service',
    'infosys': 'Service',
    'wipro': 'Service',
    'cognizant': 'Service'
  };

  const lpaRanges: Record<string, string> = {
    'zoho': '7 LPA',
    'freshworks': '10 LPA',
    'mu-sigma': '5 LPA',
    'paypal-india': '24 LPA',
    'oracle-india': '18 LPA',
    'amazon-india': '32 LPA',
    'microsoft-india': '44 LPA',
    'google-india': '55 LPA',
    'tcs': '3.6 - 7 LPA',
    'infosys': '3.6 - 8 LPA',
    'wipro': '3.5 - 7 LPA',
    'cognizant': '4 - 8.5 LPA'
  };

  const getCompanyTier = (id: string) => {
    return companyTiers[id] || 'Dream';
  };

  const getCompanyLPA = (id: string) => {
    return lpaRanges[id] || '6 LPA';
  };

  // Generate matrix checks for each company
  const companyReadinessBreakdown = useMemo(() => {
    return companyTargets.map((company) => {
      const tier = getCompanyTier(company.id);
      const lpa = getCompanyLPA(company.id);

      // Criteria matching
      let reqApt = 50;
      let reqSql = 20;
      let reqCs = 5;
      let reqProject = 50;
      let reqResume = 70;

      if (tier === 'Super Dream') {
        reqApt = 100;
        reqSql = 50;
        reqCs = 15;
        reqProject = 75;
        reqResume = 80;
      } else if (tier === 'Dream') {
        reqApt = 80;
        reqSql = 30;
        reqCs = 10;
        reqProject = 60;
        reqResume = 75;
      }

      const checks = {
        aptitude: statsBreakdown.aptitudeSolved >= reqApt,
        sql: statsBreakdown.sqlSolved >= reqSql,
        csCore: statsBreakdown.csCoreCompleted >= reqCs,
        project: statsBreakdown.averageProjectProgress >= reqProject,
        resume: statsBreakdown.resumeScore >= reqResume,
        mock: company.prepDirection.toLowerCase().includes('mock') || company.readinessScore > 60
      };

      const fulfilledCount = Object.values(checks).filter(Boolean).length;
      const score = Math.round((fulfilledCount / 6) * 100);

      return {
        ...company,
        tier,
        lpa,
        requirements: { reqApt, reqSql, reqCs, reqProject, reqResume },
        checks,
        score
      };
    });
  }, [companyTargets, statsBreakdown]);

  const filteredCompanies = useMemo(() => {
    return companyReadinessBreakdown.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.targetRoles.toLowerCase().includes(search.toLowerCase());
      const matchesTier = filterTier === 'All' || c.tier === filterTier;
      return matchesSearch && matchesTier;
    });
  }, [companyReadinessBreakdown, search, filterTier]);

  const handleTogglePrepStatus = (companyId: string, itemKey: string) => {
    // Mock toggle or prep status toggle
    const comp = companyTargets.find((c) => c.id === companyId);
    if (!comp) return;

    // Toggle note prefix or state property
    const newNotes = comp.notes.includes(`[prep_${itemKey}]`)
      ? comp.notes.replace(`[prep_${itemKey}]`, '')
      : comp.notes + `[prep_${itemKey}]`;

    updateCompanyTarget(companyId, { notes: newNotes });
  };

  const isPrepToggled = (notes: string, itemKey: string) => {
    return notes.includes(`[prep_${itemKey}]`);
  };

  const startNotesEditing = (id: string, notes: string) => {
    setEditingNotesId(id);
    setTempNotes(notes.replace(/\[prep_\w+\]/g, '').trim());
  };

  const saveNotes = (id: string) => {
    const comp = companyTargets.find((c) => c.id === id);
    if (!comp) return;

    const prepTags = comp.notes.match(/\[prep_\w+\]/g) || [];
    const finalNotes = tempNotes + '\n' + prepTags.join(' ');
    updateCompanyTarget(id, { notes: finalNotes.trim() });
    setEditingNotesId(null);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ambient particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const parent = canvas.parentElement;
    let w = (canvas.width = parent?.offsetWidth || window.innerWidth);
    let h = (canvas.height = parent?.offsetHeight || window.innerHeight);
    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    const colors = ['#eab308', '#a855f7', '#3b82f6', '#dc2626'];
    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.5 + 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.12 + 0.03
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 5; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
  }, []);

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader 
          title="🦇 Wayne Corp Company Prep Center 2.0"
          subtitle="Track your corporate intelligence, eligibility, and readiness metrics against Dream, Super Dream, and Target corporate criteria across Gotham."
          actions={
            <ShaylaPromptButton
              prompt={`Shayla, audit my target companies. Aptitude solved: ${statsBreakdown.aptitudeSolved}, SQL solved: ${statsBreakdown.sqlSolved}, CS topics: ${statsBreakdown.csCoreCompleted}, project progress: ${statsBreakdown.averageProjectProgress}%, resume score: ${statsBreakdown.resumeScore}. Tell me which company type to attack next without inventing progress.`}
              variant="secondary"
            >
              Ask Shayla Intel
            </ShaylaPromptButton>
          }
        />

        {/* Stats Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-black/60 border border-yellow-500/25 p-4 rounded-2xl shadow-[0_0_10px_rgba(234,179,8,0.15)] backdrop-blur-md" style={{ border: '1px solid rgba(234,179,8,0.2)', background: 'rgba(12,10,3,0.85)' }}>
            <span className="block text-[9px] font-bold text-yellow-500/80 uppercase tracking-wider font-mono">Aptitude Solved</span>
            <span className="block text-xl font-black text-emerald-400 mt-1 font-mono">{statsBreakdown.aptitudeSolved} <span className="text-[10px] text-textMuted font-bold">/ 100+</span></span>
          </div>
          <div className="bg-black/60 border border-yellow-500/25 p-4 rounded-2xl shadow-[0_0_10px_rgba(234,179,8,0.15)] backdrop-blur-md" style={{ border: '1px solid rgba(234,179,8,0.2)', background: 'rgba(12,10,3,0.85)' }}>
            <span className="block text-[9px] font-bold text-yellow-500/80 uppercase tracking-wider font-mono">SQL Solved</span>
            <span className="block text-xl font-black text-sky-400 mt-1 font-mono">{statsBreakdown.sqlSolved} <span className="text-[10px] text-textMuted font-bold">/ 50+</span></span>
          </div>
          <div className="bg-black/60 border border-yellow-500/25 p-4 rounded-2xl shadow-[0_0_10px_rgba(234,179,8,0.15)] backdrop-blur-md" style={{ border: '1px solid rgba(234,179,8,0.2)', background: 'rgba(12,10,3,0.85)' }}>
            <span className="block text-[9px] font-bold text-yellow-500/80 uppercase tracking-wider font-mono">CS Core Modules</span>
            <span className="block text-xl font-black text-indigo-400 mt-1 font-mono">{statsBreakdown.csCoreCompleted} <span className="text-[10px] text-textMuted font-bold">topics</span></span>
          </div>
          <div className="bg-black/60 border border-yellow-500/25 p-4 rounded-2xl shadow-[0_0_10px_rgba(234,179,8,0.15)] backdrop-blur-md" style={{ border: '1px solid rgba(234,179,8,0.2)', background: 'rgba(12,10,3,0.85)' }}>
            <span className="block text-[9px] font-bold text-yellow-500/80 uppercase tracking-wider font-mono">Project Progress</span>
            <span className="block text-xl font-black text-amber-400 mt-1 font-mono">{statsBreakdown.averageProjectProgress}%</span>
          </div>
          <div className="bg-black/60 border border-yellow-500/25 p-4 rounded-2xl shadow-[0_0_10px_rgba(234,179,8,0.15)] backdrop-blur-md" style={{ border: '1px solid rgba(234,179,8,0.2)', background: 'rgba(12,10,3,0.85)' }}>
            <span className="block text-[9px] font-bold text-yellow-500/80 uppercase tracking-wider font-mono">ATS Resume Score</span>
            <span className="block text-xl font-black text-pink-400 mt-1 font-mono">{statsBreakdown.resumeScore} / 100</span>
          </div>
        </div>

        {/* Filters strip */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-black/60 border border-white/10 p-3 rounded-2xl backdrop-blur-md" style={{ border: '1px solid rgba(234,179,8,0.2)', background: 'rgba(12,10,3,0.85)' }}>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
            <input 
              type="text" 
              placeholder="Search target companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-bgCard/60 border border-border-subtle rounded-xl text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Dream', 'Super Dream', 'Service'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterTier === tier
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-white/5 border border-transparent'
                }`}
              >
                {tier === 'All' ? 'All Target Companies' : `${tier} Tier`}
              </button>
            ))}
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredCompanies.map((c) => (
            <Card key={c.id} className="p-5 border border-white/10 bg-black/60 hover:border-yellow-500/40 transition-all duration-200 flex flex-col gap-4" style={{ border: '1px solid rgba(234,179,8,0.18)', background: 'rgba(12,10,3,0.85)' }}>
              <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-textPrimary text-base">{c.name}</h3>
                      <Badge variant={c.tier === 'Super Dream' ? 'warning' : c.tier === 'Dream' ? 'primary' : 'neutral'}>
                        {c.tier} • {c.lpa}
                      </Badge>
                    </div>
                    <p className="text-xs text-textSecondary mt-0.5"><span className="text-textMuted font-medium">Roles:</span> {c.targetRoles}</p>
                  </div>
                </div>

                <div className="text-right flex items-center md:flex-col gap-3 md:gap-0 justify-between w-full md:w-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Criteria Match</span>
                  <span className={`text-2xl font-black ${
                    c.score >= 80 ? 'text-accentEmerald' : c.score >= 50 ? 'text-accentGold' : 'text-red-400'
                  }`}>{c.score}%</span>
                </div>
              </div>

              {/* Test Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs">
                <div>
                  <span className="font-bold text-textMuted tracking-wider uppercase text-[9px] block">Test Coverage</span>
                  <p className="text-textPrimary mt-1 font-medium">{c.whatTheyTest}</p>
                </div>
                <div>
                  <span className="font-bold text-textMuted tracking-wider uppercase text-[9px] block">Prep Guidelines</span>
                  <p className="text-textSecondary mt-1 italic">"{c.prepDirection}"</p>
                </div>
              </div>

              {/* Criteria checks grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-1.5">
                <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                  c.checks.aptitude ? 'bg-accentEmerald/5 border-accentEmerald/20 text-accentEmerald' : 'bg-red-500/5 border-red-500/10 text-red-400'
                }`}>
                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-85 block">Aptitude Target</span>
                  <span className="font-black text-sm mt-1 block">
                    {statsBreakdown.aptitudeSolved} / {c.requirements.reqApt}
                  </span>
                  <span className="text-[9px] mt-1 opacity-70 block font-medium">
                    {c.checks.aptitude ? '✓ Qualified' : '✗ Pending'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                  c.checks.sql ? 'bg-accentEmerald/5 border-accentEmerald/20 text-accentEmerald' : 'bg-red-500/5 border-red-500/10 text-red-400'
                }`}>
                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-85 block">SQL Target</span>
                  <span className="font-black text-sm mt-1 block">
                    {statsBreakdown.sqlSolved} / {c.requirements.reqSql}
                  </span>
                  <span className="text-[9px] mt-1 opacity-70 block font-medium">
                    {c.checks.sql ? '✓ Qualified' : '✗ Pending'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                  c.checks.csCore ? 'bg-accentEmerald/5 border-accentEmerald/20 text-accentEmerald' : 'bg-red-500/5 border-red-500/10 text-red-400'
                }`}>
                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-85 block">CS Core Topics</span>
                  <span className="font-black text-sm mt-1 block">
                    {statsBreakdown.csCoreCompleted} / {c.requirements.reqCs}
                  </span>
                  <span className="text-[9px] mt-1 opacity-70 block font-medium">
                    {c.checks.csCore ? '✓ Qualified' : '✗ Pending'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                  c.checks.project ? 'bg-accentEmerald/5 border-accentEmerald/20 text-accentEmerald' : 'bg-red-500/5 border-red-500/10 text-red-400'
                }`}>
                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-85 block">Project Progress</span>
                  <span className="font-black text-sm mt-1 block">
                    {statsBreakdown.averageProjectProgress}% / {c.requirements.reqProject}%
                  </span>
                  <span className="text-[9px] mt-1 opacity-70 block font-medium">
                    {c.checks.project ? '✓ Qualified' : '✗ Pending'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                  c.checks.resume ? 'bg-accentEmerald/5 border-accentEmerald/20 text-accentEmerald' : 'bg-red-500/5 border-red-500/10 text-red-400'
                }`}>
                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-85 block">Resume Target</span>
                  <span className="font-black text-sm mt-1 block">
                    {statsBreakdown.resumeScore} / {c.requirements.reqResume}
                  </span>
                  <span className="text-[9px] mt-1 opacity-70 block font-medium">
                    {c.checks.resume ? '✓ Qualified' : '✗ Pending'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border flex flex-col justify-between bg-white/[0.02] border-white/5">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-textMuted block">Mock Interview</span>
                  <span className="font-bold text-textPrimary text-xs mt-1 block">
                    {c.checks.mock ? 'Active Practice' : 'Not Attempted'}
                  </span>
                  <span className="text-[9px] text-yellow-400 mt-1 font-bold block cursor-pointer hover:underline" onClick={() => handleTogglePrepStatus(c.id, 'mock')}>
                    {isPrepToggled(c.notes, 'mock') ? '✓ Mock Done' : 'Mark Done'}
                  </span>
                </div>
              </div>

              {/* Custom Interactive checklist */}
              <div className="flex flex-wrap gap-2.5 items-center border-t border-white/5 pt-4 text-xs">
                <span className="font-bold text-textMuted uppercase tracking-wider text-[9px] mr-1.5">Manual Override Checklist:</span>
                
                <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/5 py-1 px-2.5 rounded-lg select-none">
                  <input 
                    type="checkbox" 
                    checked={isPrepToggled(c.notes, 'apt')} 
                    onChange={() => handleTogglePrepStatus(c.id, 'apt')}
                    className="rounded border-white/20 bg-bgSurface text-yellow-400 focus:ring-0" 
                  />
                  <span className="text-textSecondary">Aptitude Prep Done</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/5 py-1 px-2.5 rounded-lg select-none">
                  <input 
                    type="checkbox" 
                    checked={isPrepToggled(c.notes, 'sql')} 
                    onChange={() => handleTogglePrepStatus(c.id, 'sql')}
                    className="rounded border-white/20 bg-bgSurface text-yellow-400 focus:ring-0" 
                  />
                  <span className="text-textSecondary">SQL Queries Done</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/5 py-1 px-2.5 rounded-lg select-none">
                  <input 
                    type="checkbox" 
                    checked={isPrepToggled(c.notes, 'cs')} 
                    onChange={() => handleTogglePrepStatus(c.id, 'cs')}
                    className="rounded border-white/20 bg-bgSurface text-yellow-400 focus:ring-0" 
                  />
                  <span className="text-textSecondary">CS Core Revised</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/5 py-1 px-2.5 rounded-lg select-none">
                  <input 
                    type="checkbox" 
                    checked={isPrepToggled(c.notes, 'proj')} 
                    onChange={() => handleTogglePrepStatus(c.id, 'proj')}
                    className="rounded border-white/20 bg-bgSurface text-yellow-400 focus:ring-0" 
                  />
                  <span className="text-textSecondary">Projects Locked</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/5 py-1 px-2.5 rounded-lg select-none">
                  <input 
                    type="checkbox" 
                    checked={isPrepToggled(c.notes, 'res')} 
                    onChange={() => handleTogglePrepStatus(c.id, 'res')}
                    className="rounded border-white/20 bg-bgSurface text-yellow-400 focus:ring-0" 
                  />
                  <span className="text-textSecondary">Resume Updated</span>
                </label>
              </div>

              {/* Custom Notes Section */}
              <div className="border-t border-white/5 pt-3.5 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-textMuted uppercase tracking-wider text-[9px]">Company Notes / Action Items</span>
                  {editingNotesId !== c.id ? (
                    <button 
                      onClick={() => startNotesEditing(c.id, c.notes)}
                      className="text-yellow-400 hover:underline font-bold text-[10px]"
                    >
                      Edit Notes
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => saveNotes(c.id)} className="text-emerald-400 hover:underline font-bold text-[10px]">
                        Save
                      </button>
                      <button onClick={() => setEditingNotesId(null)} className="text-textMuted hover:underline font-bold text-[10px]">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {editingNotesId === c.id ? (
                  <textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Type notes specific to this company (e.g. PayPal tests heaps, Zoho likes console calculators)..."
                    className="w-full min-h-[60px] p-2.5 text-xs text-textPrimary placeholder:text-textMuted bg-bgSurface border border-border-subtle focus:outline-none rounded-xl"
                  />
                ) : (
                  <p className="text-xs text-textSecondary leading-normal whitespace-pre-line italic">
                    {c.notes.replace(/\[prep_\w+\]/g, '').trim() || 'No target preparation notes added yet.'}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
