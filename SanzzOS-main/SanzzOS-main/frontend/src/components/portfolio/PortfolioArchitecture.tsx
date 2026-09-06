import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ArrowRight } from 'lucide-react';

export const PortfolioArchitecture: React.FC<{ nodes: { title: string; detail: string }[] }> = ({ nodes }) => {
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Architecture</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">How the system fits together</h3>
      </div>
      <div className="grid gap-3 xl:grid-cols-4">
        {nodes.map((node, index) => (
          <React.Fragment key={node.title}>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
              <Badge variant={index % 2 === 0 ? 'primary' : 'success'}>{node.title}</Badge>
              <p className="mt-3 text-sm leading-6 text-textSecondary">{node.detail}</p>
            </div>
            {index < nodes.length - 1 && (
              <div className="hidden items-center justify-center text-accentBlue xl:flex">
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};

