import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export type ResumeStudioTab =
  | 'overview'
  | 'builder'
  | 'tailor'
  | 'ats_analyzer'
  | 'ats_strict'
  | 'bullet'
  | 'keywords'
  | 'recruiter'
  | 'interview'
  | 'versions'
  | 'history';

type Props = {
  activeTab: ResumeStudioTab;
  onTabChange: (tab: ResumeStudioTab) => void;
};

const TABS: Array<{ id: ResumeStudioTab; label: string; badge?: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'builder', label: 'Builder' },
  { id: 'tailor', label: 'Tailor to Job' },
  { id: 'ats_analyzer', label: 'ATS Analyzer', badge: 'Upload' },
  { id: 'ats_strict', label: 'Strict ATS Tracker' },
  { id: 'bullet', label: 'Bullet Lab' },
  { id: 'keywords', label: 'ATS Keywords' },
  { id: 'recruiter', label: 'Recruiter Review' },
  { id: 'interview', label: 'Interview Questions' },
  { id: 'versions', label: 'Version History' },
  { id: 'history', label: 'Score History' },
];

export const ResumeStudioTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bgSurface/30 p-2">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            size="sm"
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            onClick={() => onTabChange(tab.id)}
            className="rounded-xl"
          >
            {tab.label}
            {tab.badge && (
              <Badge variant="neutral" className="ml-2">
                {tab.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
