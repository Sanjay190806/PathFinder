import React from 'react';
import { BriefcaseBusiness, Download, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useUIStore } from '../../app/store/useUIStore';
import { getApplicationReminders, getNextAction } from '../../utils/applicationCrmUtils';
import backupService from '../../services/sync/backupService';

export const MobileApplicationDock: React.FC = () => {
  const applications = useCareerStore((s) => s.applications);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const reminders = getApplicationReminders(applications);
  const topAction = applications
    .map((app) => ({ app, action: getNextAction(app) }))
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[a.action.urgency] - rank[b.action.urgency];
    })[0];

  const openApplications = () => {
    setActiveSection('applications');
    window.history.pushState({}, '', '/applications');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <Card className="md:hidden flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-5 w-5 text-accentBlue" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Applications</p>
            <h3 className="text-sm font-semibold text-textPrimary">{topAction ? topAction.action.label : 'No active application action'}</h3>
          </div>
        </div>
        <Badge variant={reminders.length ? 'warning' : 'neutral'}>{reminders.length}</Badge>
      </div>
      {topAction && <p className="text-xs text-textSecondary">{topAction.app.company}: {topAction.action.reason}</p>}
      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" onClick={openApplications}>
          <BriefcaseBusiness className="mr-1 h-3.5 w-3.5" />
          Open
        </Button>
        <Button size="sm" variant="outline" onClick={openApplications}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={() => backupService.exportData()}>
          <Download className="mr-1 h-3.5 w-3.5" />
          Backup
        </Button>
      </div>
    </Card>
  );
};
