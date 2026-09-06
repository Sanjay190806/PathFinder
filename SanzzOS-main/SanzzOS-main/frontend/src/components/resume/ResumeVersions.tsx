import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const ResumeVersions: React.FC = () => {
  const versions = [
    { ver: "v1.0", label: "Main SWE Placement", date: "June 25, 2026", active: true },
    { ver: "v1.1", label: "AI / ML Focus Track", date: "June 28, 2026", active: false },
    { ver: "v1.2", label: "Internship General", date: "June 29, 2026", active: false }
  ];

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block pl-0.5">Resume Version Control</span>
      </div>

      <div className="flex flex-col gap-3">
        {versions.map((v, index) => (
          <div key={index} className="flex items-center justify-between gap-3 text-xs bg-bgSurface/30 border border-border-subtle p-3 rounded-xl hover:border-border-accent/40 transition">
            <div>
              <span className="font-bold text-textPrimary">{v.label}</span>
              <p className="text-[10px] text-textMuted mt-0.5">Created: {v.date}</p>
            </div>
            <Badge variant={v.active ? 'success' : 'neutral'}>
              {v.ver} {v.active ? '• Active' : ''}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
