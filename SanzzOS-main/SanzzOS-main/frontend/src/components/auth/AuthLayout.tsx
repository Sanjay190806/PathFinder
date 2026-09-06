import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <main className="min-h-screen bg-bgBase px-4 py-6 text-textPrimary md:px-8">
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
      <div className="grid w-full gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-center gap-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-white/5 text-accentEmerald">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-textMuted">Career OS Pro v1.7</p>
            <h1 className="mt-3 text-3xl font-bold text-textPrimary md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-textSecondary">{subtitle}</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4 text-xs leading-5 text-textSecondary">
            Account sync is optional. Local-only mode keeps the current browser-first workflow and backup exports available.
          </div>
        </section>
        <section className="rounded-2xl border border-border-subtle bg-bgSurface/80 p-5 shadow-xl backdrop-blur-xl md:p-6">
          {children}
        </section>
      </div>
    </div>
  </main>
);
