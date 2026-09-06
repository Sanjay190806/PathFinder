import React from 'react';
import { AlertTriangle, ArrowRight, BarChart3, BookOpen, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { useLearningOS } from '../../hooks/useLearningOS';
import { useAnalytics } from '../../hooks/useAnalytics';
import { navigateToPath } from '../../utils/navigation';

export const V161LearningAnalyticsWidgets: React.FC = () => {
  const { state, overview, dueRevision } = useLearningOS();
  const { dashboard } = useAnalytics();
  const weakest = state?.paths ? [...state.paths].sort((a, b) => a.masteryPercentage - b.masteryPercentage)[0] : undefined;
  const insight = dashboard?.insights ? dashboard.insights[0] : undefined;

  const averageMastery = overview?.averageMastery ?? 0;
  const weeklyHours = overview?.weeklyHours !== undefined ? overview.weeklyHours.toFixed(1) : '0.0';
  const dueRevisionCount = dueRevision?.length ?? 0;
  const totalXP = overview?.xp ?? 0;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-accentBlue" />
          <h3 className="font-semibold text-textPrimary">Learning OS</h3>
        </div>
        <div className="mb-2 flex justify-between text-sm text-textSecondary"><span>Average mastery</span><span>{averageMastery}%</span></div>
        <ProgressBar value={averageMastery} />
        <p className="mt-3 text-sm text-textSecondary">{weakest ? `Next: ${weakest.title}` : 'Learning paths ready.'}</p>
        <Button className="mt-4" size="sm" variant="outline" onClick={() => navigateToPath('/learning-os')}>Open <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </Card>
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-accentEmerald" />
          <h3 className="font-semibold text-textPrimary">Weekly learning</h3>
        </div>
        <p className="text-2xl font-semibold text-textPrimary">{weeklyHours}h</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={dueRevisionCount ? 'warning' : 'success'}>{dueRevisionCount} due revision</Badge>
          <Badge>{totalXP} XP</Badge>
        </div>
        <Button className="mt-4" size="sm" variant="outline" onClick={() => navigateToPath('/learning-os')}>Review <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </Card>
      <Card>
        <div className="mb-3 flex items-center gap-2">
          {insight?.severity === 'warning' ? <AlertTriangle className="h-5 w-5 text-accentYellow" /> : <BarChart3 className="h-5 w-5 text-accentPurple" />}
          <h3 className="font-semibold text-textPrimary">Analytics insight</h3>
        </div>
        <p className="font-medium text-textPrimary">{insight?.title || 'Analytics ready'}</p>
        <p className="mt-2 text-sm text-textSecondary">{insight?.detail || 'Log sessions to unlock deeper trends.'}</p>
        <Button className="mt-4" size="sm" variant="outline" onClick={() => navigateToPath('/analytics')}>Open <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </Card>
    </div>
  );
};
