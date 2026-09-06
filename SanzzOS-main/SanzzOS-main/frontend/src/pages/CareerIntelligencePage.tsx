import React from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useCareerStore } from '../app/store/useCareerStore';
import { buildCareerIntelligence } from '../utils/careerIntelligenceUtils';
import { AlertTriangle, TrendingUp, Brain, FolderKanban, Languages, FileText } from 'lucide-react';

export const CareerIntelligencePage: React.FC = () => {
  const state = useCareerStore((s) => s);
  const intelligence = buildCareerIntelligence(state);

  return (
    <div className="flex flex-col gap-6 pb-10 fade-in">
      <SectionHeader
        title="Career Intelligence"
        subtitle="A heuristic dashboard that blends placement, resume, German, project, and consistency signals."
        actions={
          <Badge variant="primary" className="gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Day {intelligence.day}
          </Badge>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Placement forecast</p>
          <div className="text-3xl font-semibold text-textPrimary">{intelligence.placement}%</div>
          <ProgressBar value={intelligence.placement} color="#3B82F6" />
          <p className="text-sm text-textSecondary">Blended from DSA, projects, resume, and consistency.</p>
        </Card>
        <Card className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Resume health</p>
          <div className="text-3xl font-semibold text-textPrimary">{intelligence.resume}%</div>
          <ProgressBar value={intelligence.resume} color="#8B5CF6" />
          <p className="text-sm text-textSecondary">ATS-ready structure, project proof, and profile coverage.</p>
        </Card>
        <Card className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Consistency</p>
          <div className="text-3xl font-semibold text-textPrimary">{intelligence.consistency}%</div>
          <ProgressBar value={intelligence.consistency} color="#10B981" />
          <p className="text-sm text-textSecondary">Daily execution rhythm and task completion quality.</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Signals</p>
              <h3 className="mt-1 text-lg font-semibold text-textPrimary">What the dashboard is telling us</h3>
            </div>
            <Badge variant="warning" className="gap-1"><AlertTriangle className="h-3.5 w-3.5" />Heuristic</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {intelligence.signals.map((signal) => (
              <div key={signal.label} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-textPrimary">{signal.label}</p>
                  <Badge variant={signal.status === 'good' ? 'success' : signal.status === 'warning' ? 'warning' : 'danger'}>
                    {signal.value}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-textSecondary">{signal.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Focus map</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">Where to spend the next hour</h3>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-textPrimary"><Brain className="h-4 w-4 text-accentBlue" /> DSA and Java</div>
              <p className="mt-2 text-xs text-textSecondary">Keep your first block on one roadmap problem or pattern review.</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-textPrimary"><FolderKanban className="h-4 w-4 text-accentPurple" /> Projects</div>
              <p className="mt-2 text-xs text-textSecondary">Polish one bullet, one metric, or one explanation per session.</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-textPrimary"><Languages className="h-4 w-4 text-accentEmerald" /> German</div>
              <p className="mt-2 text-xs text-textSecondary">One speaking round, one listening round, one review round.</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-textPrimary"><FileText className="h-4 w-4 text-accentOrange" /> Resume</div>
              <p className="mt-2 text-xs text-textSecondary">Keep achievements specific and recruiter-friendly.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

