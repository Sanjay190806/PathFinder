import React from 'react';
import { Button } from '../ui/Button';
import { navigateToPath } from '../../utils/navigation';
import { ArrowRight } from 'lucide-react';

export const LandingCTA: React.FC = () => {
  return (
    <section className="rounded-[32px] border border-border-accent/20 bg-gradient-to-r from-accentBlue/10 via-bgCard to-accentPurple/10 p-6 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Final CTA</p>
          <h3 className="mt-2 text-2xl font-semibold text-textPrimary">Launch Career OS</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-textSecondary">
            Use the dashboard when you’re ready to work, and the landing page when you want to sell the story.
          </p>
        </div>
        <Button type="button" size="lg" onClick={() => navigateToPath('/dashboard')}>
          Launch Career OS
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};
