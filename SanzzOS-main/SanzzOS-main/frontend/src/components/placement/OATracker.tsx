import React from 'react';
import { OARecord, PlacementCompany } from '../../types/placement';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

export const OATracker: React.FC<{ records: OARecord[]; companies: PlacementCompany[] }> = ({ records, companies }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">OA tracker</h3>
    {records.length === 0 ? (
      <EmptyState title="No OA records yet" description="Log online assessments after they are scheduled or completed." />
    ) : (
      <div className="space-y-3">
        {records.map((record) => (
          <div key={record.id} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
            <p className="font-medium text-textPrimary">{companies.find((item) => item.id === record.companyId)?.name} · {record.platform}</p>
            <p className="text-sm text-textSecondary">Score {record.score}% · {record.difficulty}</p>
          </div>
        ))}
      </div>
    )}
  </Card>
);
