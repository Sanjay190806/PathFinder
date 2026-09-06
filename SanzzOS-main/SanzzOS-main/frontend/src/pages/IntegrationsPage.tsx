import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { LeetCodeIntegrationCard } from '../components/integrations/LeetCodeIntegrationCard';
import { LinkedInIntegrationCard } from '../components/integrations/LinkedInIntegrationCard';
import { GitHubIntegrationCard } from '../components/integrations/GitHubIntegrationCard';
import { YouTubeIntegrationCard } from '../components/integrations/YouTubeIntegrationCard';
import { PortfolioLinksCard } from '../components/integrations/PortfolioLinksCard';

export const IntegrationsPage: React.FC = () => (
  <div className="flex flex-col gap-6 pb-10 fade-in">
    <SectionHeader title="Integrations Hub" subtitle="Link public profiles, learning progress, and portfolio proof without passwords or scraping." />
    <Card className="flex items-start gap-3 border-accentGreen/20 bg-accentGreen/5">
      <ShieldCheck className="mt-1 h-5 w-5 text-accentGreen" />
      <div>
        <h3 className="text-sm font-semibold text-textPrimary">Privacy-first v1 integrations</h3>
        <p className="mt-1 text-sm text-textSecondary">This hub stores profile links and manual fields locally. OAuth secrets stay backend-only when real integrations are added later.</p>
      </div>
    </Card>
    <div className="grid gap-5 xl:grid-cols-2">
      <LeetCodeIntegrationCard />
      <LinkedInIntegrationCard />
      <GitHubIntegrationCard />
      <YouTubeIntegrationCard />
      <PortfolioLinksCard />
    </div>
  </div>
);
