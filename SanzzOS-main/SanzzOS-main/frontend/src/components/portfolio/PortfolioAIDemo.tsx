import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const PortfolioAIDemo: React.FC<{ messages: { role: string; content: string }[] }> = ({ messages }) => {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">AI demo</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Safe Shayla chat preview</h3>
        </div>
        <Badge variant="success">Synthetic only</Badge>
      </div>
      <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] rounded-2xl border p-3 text-sm leading-6 ${
              message.role === 'assistant'
                ? 'border-border-subtle bg-white/[0.03] text-textSecondary'
                : 'ml-auto border-accentBlue/25 bg-accentBlue/10 text-textPrimary'
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
    </Card>
  );
};
