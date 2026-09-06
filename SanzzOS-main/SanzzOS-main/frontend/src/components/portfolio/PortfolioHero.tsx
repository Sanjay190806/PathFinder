import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Github, PlayCircle, ShieldCheck } from 'lucide-react';

export const PortfolioHero: React.FC<{
  name: string;
  subtitle: string;
  pitch: string;
  githubUrl: string;
  onViewWalkthrough: () => void;
}> = ({ name, subtitle, pitch, githubUrl, onViewWalkthrough }) => {
  return (
    <Card className="relative overflow-hidden border-border-accent/25 bg-gradient-to-br from-bgCard/95 via-bgCard/90 to-accentBlue/5 p-6 md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.16),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_28%)]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">Recruiter-safe showcase</Badge>
            <Badge variant="success" className="gap-1"><ShieldCheck className="h-3.5 w-3.5" />Private data hidden</Badge>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-textPrimary md:text-4xl">{name}</h2>
            <p className="max-w-2xl text-sm leading-6 text-textSecondary md:text-base">{subtitle}</p>
            <p className="max-w-2xl text-sm leading-6 text-textPrimary">{pitch}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" className="gap-2" onClick={onViewWalkthrough}>
            <PlayCircle className="h-4 w-4" />
            View walkthrough
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.open(githubUrl, '_blank', 'noopener,noreferrer')}>
            <Github className="h-4 w-4" />
            GitHub CTA
          </Button>
        </div>
      </div>
    </Card>
  );
};
