import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { navigateToPath } from '../../utils/navigation';
import { ArrowRight, Sparkles, PlayCircle } from 'lucide-react';

export const LandingHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border-subtle bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_28%),linear-gradient(180deg,rgba(9,9,20,0.95),rgba(6,6,17,0.96))] p-6 md:p-10">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />
      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white/[0.04] px-3 py-1 text-xs text-textSecondary">
            <Sparkles className="h-3.5 w-3.5 text-accentBlue" />
            Recruiter-ready placement operating system
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-textPrimary md:text-6xl">
            Command Your Career Journey.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-textSecondary md:text-lg">
            A premium AI-powered career operating system for placement preparation, Java DSA, CS fundamentals, German learning, resume readiness, projects, and daily accountability.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="button" size="lg" onClick={() => navigateToPath('/dashboard')}>
              Enter Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={() => navigateToPath('/portfolio')}>
              View Portfolio Mode
            </Button>
            <Button type="button" size="lg" variant="ghost" onClick={() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>
        </div>

        <Card className="relative overflow-hidden border-border-accent/20 bg-white/[0.04] p-5 shadow-glow-blue">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.22),transparent_32%)]" />
          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Live Preview</p>
                <h3 className="mt-1 text-lg font-semibold text-textPrimary">Dashboard ready for demo</h3>
              </div>
              <span className="rounded-full border border-accentEmerald/20 bg-accentEmerald/10 px-3 py-1 text-xs font-semibold text-accentEmerald">
                Online
              </span>
            </div>
            <div className="rounded-[28px] border border-border-subtle bg-bgBase/80 p-4 shadow-card">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-textMuted">Roadmap</p>
                  <p className="mt-2 text-2xl font-semibold text-textPrimary">180 Days</p>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-textMuted">AI Mentor</p>
                  <p className="mt-2 text-2xl font-semibold text-textPrimary">Shayla</p>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-textMuted">Backend</p>
                  <p className="mt-2 text-2xl font-semibold text-textPrimary">Express</p>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-textMuted">Database</p>
                  <p className="mt-2 text-2xl font-semibold text-textPrimary">Postgres</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
