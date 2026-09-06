import React from 'react';
import { RevisionItem } from '../../types/learning';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export const RevisionQueue: React.FC<{ items: RevisionItem[]; onComplete: (id: string) => void }> = ({ items, onComplete }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Revision queue</h3>
    {items.length === 0 ? (
      <EmptyState title="No revision due" description="Low and medium confidence sessions will create review items here." />
    ) : (
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-textPrimary">{item.topic}</p>
              <Badge variant={item.confidence === 'low' ? 'danger' : 'warning'}>{item.dueDate}</Badge>
            </div>
            <p className="text-xs text-textMuted">{item.reason}</p>
            <Button className="mt-3" size="sm" variant="outline" onClick={() => onComplete(item.id)}>Mark reviewed</Button>
          </div>
        ))}
      </div>
    )}
  </Card>
);
