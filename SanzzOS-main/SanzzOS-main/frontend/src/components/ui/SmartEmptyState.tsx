import React from 'react';
import { Target, Zap, Languages, Code2, FileText, ArrowRight } from 'lucide-react';
import { navigateToPath } from '../../utils/navigation';

interface SmartEmptyStateProps {
  category: 'dsa' | 'sql' | 'german' | 'projects' | 'resume' | 'general';
  title?: string;
  message?: string;
}

export const SmartEmptyState: React.FC<SmartEmptyStateProps> = ({
  category,
  title,
  message
}) => {
  const getConfig = () => {
    switch (category) {
      case 'dsa':
        return {
          icon: Target,
          title: title || 'No LeetCode Problems Logged Yet',
          message: message || 'Solve your first dynamic programming or list puzzle to build your portfolio metrics.',
          btnLabel: 'Begin Java DSA',
          path: '/learning-os',
          color: 'text-accentOrange'
        };
      case 'sql':
        return {
          icon: Zap,
          title: title || 'SQL Practice Empty',
          message: message || 'Master database joins and analytical filters to unlock backend readiness metrics.',
          btnLabel: 'Solve SQL Exercises',
          path: '/sql-tracker',
          color: 'text-accentYellow'
        };
      case 'german':
        return {
          icon: Languages,
          title: title || 'Deutsch Practice Empty',
          message: message || 'Start with basic greeting modules or review the common nouns today.',
          btnLabel: 'Practice German Nouns',
          path: '/german-academy',
          color: 'text-cyan-400'
        };
      case 'projects':
        return {
          icon: Code2,
          title: title || 'No Project Milestones Tracked',
          message: message || 'Add git repository links and list frontend-backend tasks to showcase real software.',
          btnLabel: 'Add Flagship Project',
          path: '/projects-os',
          color: 'text-accentBlue'
        };
      case 'resume':
        return {
          icon: FileText,
          title: title || 'Resume ATS Review Pending',
          message: message || 'Optimize education, project summaries, and education keywords first.',
          btnLabel: 'Update Resume Bullets',
          path: '/resume-manager',
          color: 'text-accentPurple'
        };
      case 'general':
      default:
        return {
          icon: Target,
          title: title || 'No Tasks Tracked Today',
          message: message || 'Open your daily campaign planner to log active learning sessions.',
          btnLabel: 'Open Daily Planner',
          path: '/today',
          color: 'text-accentBlue'
        };
    }
  };

  const config = getConfig();

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center flex flex-col items-center gap-3 select-none">
      <div className={`h-10 w-10 rounded-full bg-black/40 flex items-center justify-center ${config.color} border border-white/5`}>
        <config.icon className="h-5 w-5" />
      </div>

      <div className="flex flex-col gap-1 max-w-sm">
        <h4 className="text-xs font-black text-textPrimary">{config.title}</h4>
        <p className="text-[9px] text-textSecondary leading-normal leading-relaxed">{config.message}</p>
      </div>

      <button
        type="button"
        onClick={() => navigateToPath(config.path)}
        className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest mt-2 hover:opacity-80 transition ${config.color}`}
      >
        <span>{config.btnLabel}</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};
export default SmartEmptyState;
