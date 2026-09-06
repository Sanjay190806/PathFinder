import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { ApplicationKanban } from '../components/applications/ApplicationKanban';
import { ApplicationTable } from '../components/applications/ApplicationTable';
import { ApplicationDrawer } from '../components/applications/ApplicationDrawer';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { useCareerStore } from '../app/store/useCareerStore';
import { CareerApplication } from '../types';
import {
  APPLICATION_SOURCE_OPTIONS,
  APPLICATION_STATUSES,
  createTimelineEvent,
  dismissBackupReminder,
  getApplicationReminders,
  getApplicationQualityIssues,
  getNextAction,
  getPipelineMetrics,
  getResumeVersionMetrics,
  shouldShowWeeklyBackupReminder,
} from '../utils/applicationCrmUtils';
import backupService from '../services/sync/backupService';

type ViewMode = 'kanban' | 'table';

export const ApplicationsPage: React.FC = () => {
  const applications = useCareerStore((s) => s.applications);
  const updateApplication = useCareerStore((s) => s.updateApplication);

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<CareerApplication | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | CareerApplication['status']>('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState<'all' | 'needs_action'>('all');
  const [showBackupReminder, setShowBackupReminder] = useState(() => shouldShowWeeklyBackupReminder());

  const metrics = useMemo(() => getPipelineMetrics(applications), [applications]);
  const qualityIssues = useMemo(() => getApplicationQualityIssues(applications), [applications]);
  const reminders = useMemo(() => getApplicationReminders(applications), [applications]);
  const resumeMetrics = useMemo(() => getResumeVersionMetrics(applications), [applications]);

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return applications.filter((app) => {
      const nextAction = getNextAction(app);
      const text = [
        app.company,
        app.role,
        app.status,
        app.source,
        app.priority,
        app.location,
        app.resumeVersion,
        app.notes,
        nextAction.label,
      ].join(' ').toLowerCase();
      const matchesQuery = !normalizedQuery || text.includes(normalizedQuery);
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
      const matchesSource = sourceFilter === 'All' || app.source === sourceFilter;
      const matchesAction = actionFilter === 'all' || nextAction.urgency !== 'low';
      return matchesQuery && matchesStatus && matchesSource && matchesAction;
    });
  }, [applications, actionFilter, query, sourceFilter, statusFilter]);

  const handleCardClick = (app: CareerApplication) => {
    setActiveApp(app);
    setDrawerOpen(true);
  };

  const handleStatusChange = (id: string, status: CareerApplication['status']) => {
    const app = applications.find((item) => item.id === id);
    if (!app) return;
    const event = createTimelineEvent(status, `Moved to ${status}`, `${app.company} - ${app.role}`);
    updateApplication(id, {
      status,
      timeline: [...(app.timeline || []), event],
      lastUpdatedAt: new Date().toISOString(),
    });
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

    const colors = ['#dc2626', '#3b82f6', '#06b6d4', '#eab308'];
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

  const metricCards = [
    { label: 'Total', value: metrics.total, tone: 'text-textPrimary' },
    { label: 'Active', value: metrics.active, tone: 'text-accentBlue' },
    { label: 'Callbacks', value: `${metrics.callbackRate}%`, tone: 'text-accentYellow' },
    { label: 'Offers', value: metrics.offers, tone: 'text-accentEmerald' },
    { label: 'Follow-ups', value: metrics.needsFollowUp, tone: metrics.needsFollowUp ? 'text-red-300' : 'text-textSecondary' },
    { label: 'Best Source', value: metrics.bestSource, tone: 'text-textPrimary' },
  ];

  return (
    <div className="workspace-page flex flex-col gap-6 fade-in pb-10 relative overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />
      
      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader
          title="🕷️ Job Applications Web CRM"
          subtitle="Track pipelines, follow-ups, resume versions, JD keywords, interview stages, and next actions across the Multiverse"
          actions={
            <div className="flex gap-3 w-full md:w-auto">
              <Button
                onClick={() => setViewMode((prev) => prev === 'kanban' ? 'table' : 'kanban')}
                variant="outline"
                className="text-xs py-2 rounded-xl border-red-500/30 hover:border-red-500/50"
              >
                {viewMode === 'kanban' ? 'Table View' : 'Kanban View'}
              </Button>
              <Button onClick={() => setModalOpen(true)} className="text-xs py-2 rounded-xl shrink-0 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                + Add Application
              </Button>
            </div>
          }
        />

        {/* Filters and search bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between" style={{ border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(15,3,5,0.85)' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company, role, source, note, or next action..."
              className="w-full rounded-xl border border-border-subtle bg-bgCard/60 py-2 pl-10 pr-4 text-xs text-textPrimary placeholder-textMuted focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-textMuted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-border-subtle bg-bgCard/80 px-3 py-1.5 text-xs text-textPrimary focus:border-red-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-xl border border-border-subtle bg-bgCard/80 px-3 py-1.5 text-xs text-textPrimary focus:border-red-500 focus:outline-none"
            >
              <option value="All">All Sources</option>
              {APPLICATION_SOURCE_OPTIONS.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
            <div className="flex rounded-xl border border-border-subtle bg-bgCard/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActionFilter('all')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${actionFilter === 'all' ? 'bg-red-500/20 text-red-300' : 'text-textSecondary hover:text-textPrimary'}`}
              >
                All Actions
              </button>
              <button
                type="button"
                onClick={() => setActionFilter('needs_action')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${actionFilter === 'needs_action' ? 'bg-red-500/20 text-red-300' : 'text-textSecondary hover:text-textPrimary'}`}
              >
                Needs Action
              </button>
            </div>
          </div>
        </div>

        {/* Action center banner */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-red-950/40 via-blue-950/20 to-black/80 p-4" style={{ border: '1px solid rgba(220,38,38,0.25)' }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <p className="text-xs font-bold uppercase tracking-wider text-red-400">Next Best Actions</p>
              </div>
              <p className="mt-1 text-xs text-textSecondary">
                {metrics.needsFollowUp > 0 ? `${metrics.needsFollowUp} application(s) need follow-up now.` : 'No critical follow-ups due right now.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('Applied');
                  setActionFilter('needs_action');
                }}
                className="text-xs py-1.5 rounded-xl border-red-500/30"
              >
                Review Follow-ups ({metrics.needsFollowUp})
              </Button>
              <Button
                onClick={() => setModalOpen(true)}
                className="text-xs py-1.5 rounded-xl bg-red-600 hover:bg-red-500 shadow-[0_0_12px_rgba(220,38,38,0.3)]"
              >
                + Add Application
              </Button>
              <ShaylaPromptButton
                prompt={`Shayla, audit my applications CRM. Total: ${metrics.total}, active: ${metrics.active}, follow-ups: ${metrics.needsFollowUp}, callback rate: ${metrics.callbackRate}%, quality issues: ${qualityIssues.length}. Give me the next 3 actions only.`}
                variant="secondary"
                className="text-xs py-1.5 rounded-xl shrink-0"
              >
                Ask Shayla
              </ShaylaPromptButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {metricCards.map((card) => (
            <div key={card.label} className="glass-card rounded-xl border border-white/10 bg-black/60 p-4 transition hover:border-red-500/40" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-textSecondary font-mono">{card.label}</span>
              <span className={`mt-1 block truncate font-mono text-xl font-bold ${card.tone}`}>{card.value}</span>
            </div>
          ))}
        </div>

        {showBackupReminder && (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-950/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Weekly Backup</p>
                <p className="mt-1 text-xs text-textSecondary">Your tracker is local to this browser. Export a backup weekly to protect applications, notes, and prep history.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    backupService.exportData();
                    dismissBackupReminder();
                    setShowBackupReminder(false);
                  }}
                  className="text-xs h-8 rounded-xl border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
                >
                  Export Backup Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    dismissBackupReminder();
                    setShowBackupReminder(false);
                  }}
                  className="text-xs h-8 rounded-xl text-textMuted hover:text-textPrimary"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4" style={{ border: '1px solid rgba(220,38,38,0.18)', background: 'rgba(15,3,5,0.85)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-mono">Reminder Center</p>
                <p className="mt-1 text-xs text-textMuted">Follow-ups, stale applications, and close deadlines</p>
              </div>
              <span className="font-mono text-lg font-semibold text-textPrimary">{reminders.length}</span>
            </div>
            <div className="mt-3 grid gap-2">
              {reminders.length === 0 ? (
                <p className="text-xs text-textSecondary">No urgent reminders right now.</p>
              ) : (
                reminders.slice(0, 5).map((reminder) => (
                  <button
                    type="button"
                    key={`${reminder.applicationId}-${reminder.label}`}
                    onClick={() => {
                      const app = applications.find((item) => item.id === reminder.applicationId);
                      if (app) handleCardClick(app);
                    }}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition hover:bg-white/[0.05] hover:border-red-500/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-textPrimary">{reminder.company}</span>
                      <span className={reminder.urgency === 'high' ? 'text-[10px] text-red-400 font-mono' : 'text-[10px] text-yellow-300 font-mono'}>{reminder.urgency}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-textSecondary">{reminder.label}{reminder.dueDate ? ` - ${reminder.dueDate}` : ''}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/60 p-4" style={{ border: '1px solid rgba(59,130,246,0.18)', background: 'rgba(3,8,15,0.85)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">Resume Version Analytics</p>
                <p className="mt-1 text-xs text-textMuted">Which resume versions are getting callbacks across dimensions</p>
              </div>
              <span className="font-mono text-lg font-semibold text-textPrimary">{resumeMetrics.length}</span>
            </div>
            <div className="mt-3 grid gap-2">
              {resumeMetrics.length === 0 ? (
                <p className="text-xs text-textSecondary">Add resume versions to applications to compare performance.</p>
              ) : (
                resumeMetrics.slice(0, 5).map((metric) => (
                  <div key={metric.version} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-blue-500/30">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-xs font-semibold text-textPrimary">{metric.version}</span>
                      <span className="font-mono text-xs text-blue-400 font-bold">{metric.callbackRate}%</span>
                    </div>
                    <p className="mt-1 text-[11px] text-textSecondary">{metric.callbacks}/{metric.total} callbacks, {metric.offers} offers</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">Application Multiverse Strategy</p>
              <p className="mt-1 text-xs text-textSecondary">Let Shayla convert your CRM into follow-up, resume-version, and interview-prep actions.</p>
            </div>
            <ShaylaPromptButton
              prompt="Shayla, use my applications, statuses, reminders, resume versions, and JD keywords to create a realistic placement application strategy for this week. Do not invent company data."
              variant="outline"
            >
              Weekly Strategy
            </ShaylaPromptButton>
          </div>
        </div>

        {viewMode === 'kanban' ? (
          <ApplicationKanban applications={filteredApplications} onCardClick={handleCardClick} onStatusChange={handleStatusChange} />
        ) : (
          <ApplicationTable applications={filteredApplications} onRowClick={handleCardClick} />
        )}

        {activeApp && (
          <ApplicationDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            application={applications.find((item) => item.id === activeApp.id) || activeApp}
          />
        )}

        <ApplicationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </div>
  );
};
