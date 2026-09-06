import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { navigateToPath } from '../../utils/navigation';

export const LandingAISpotlight: React.FC = () => {
  const capabilities = ['Java DSA', 'German practice', 'Resume review', 'Project review', 'Daily planning'];

  return (
    <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="bg-gradient-to-br from-accentPurple/10 via-bgCard to-bgCard">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accentPurple">Meet Shayla</p>
        <h3 className="mt-2 text-2xl font-semibold text-textPrimary">Shayla is Sanju&apos;s AI mentor and German learning companion.</h3>
        <p className="mt-3 text-sm leading-6 text-textSecondary">
          Shayla helps with Java DSA, German, resume review, project review, and daily planning.
        </p>
        <Button type="button" className="mt-4" onClick={() => navigateToPath('/shayla')}>
          Ask Shayla
        </Button>
      </Card>
      <Card className="bg-white/[0.04]">
        <div className="flex flex-wrap gap-2">
          {capabilities.map((item) => (
            <Badge key={item} variant="primary">{item}</Badge>
          ))}
        </div>
      </Card>
    </section>
  );
};
