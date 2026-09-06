import { UserFocusMode, UserEnergyMode } from '../types/personalization';

export interface AdaptiveRecommendation {
  id: string;
  title: string;
  reason: string;
  category: 'dsa' | 'sql' | 'aptitude' | 'german' | 'projects' | 'resume' | 'rest';
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  actionLabel: string;
  linkedRoute: string;
  xpReward: number;
}

export const adaptiveRecommendationService = {
  getRecommendations(
    focusMode: UserFocusMode,
    energyMode: UserEnergyMode,
    progressLogs: { dsaSolved: number; sqlSolved: number; aptitudeSolved: number; germanStreak: number; resumeScore: number; projectCount?: number; hasAnyProgress?: boolean }
  ): AdaptiveRecommendation[] {
    const list: AdaptiveRecommendation[] = [];

    // Helper to build list items quickly
    const addRec = (
      id: string,
      title: string,
      reason: string,
      category: AdaptiveRecommendation['category'],
      priority: AdaptiveRecommendation['priority'],
      min: number,
      diff: AdaptiveRecommendation['difficulty'],
      action: string,
      route: string,
      xp: number
    ) => {
      list.push({ id, title, reason, category, priority, estimatedMinutes: min, difficulty: diff, actionLabel: action, linkedRoute: route, xpReward: xp });
    };

    // If burnout risk / low energy day, prioritize rest/recovery
    if (energyMode === 'burnout_risk') {
      addRec(
        'recovery_rest',
        'Do a 15-minute Streak Protection Check',
        'Your energy mode is set to Burnout Warning. Let us avoid heavy workloads.',
        'rest',
        'high',
        15,
        'easy',
        'Protect Streak',
        '/today',
        40
      );
      return list;
    }

    if (!progressLogs.hasAnyProgress) {
      return list;
    }

    // Adapt recommendations based on Focus Modes
    switch (focusMode) {
      case 'placement_sprint':
        if (progressLogs.dsaSolved < 20) {
          addRec(
            'dsa_starter',
            'Solve 1 Java Array Problem',
            'Your LeetCode progress is low and Placement Sprint mode is active.',
            'dsa',
            'high',
            30,
            'easy',
            'Start DSA',
            '/dsa-tracker',
            40
          );
        } else {
          addRec(
            'dsa_medium',
            'Target HashMap / Two Pointers pattern',
            'Active focus is on mid-tier DSA patterns to pass technical OAs.',
            'dsa',
            'high',
            45,
            'medium',
            'Solve DSA',
            '/dsa-tracker',
            50
          );
        }
        
        if (progressLogs.sqlSolved < 10) {
          addRec(
            'sql_practice',
            'Practice SQL SELECT & JOIN basics',
            'SQL analytics practice is essential for Mu Sigma / Tiger Analytics targets.',
            'sql',
            'medium',
            20,
            'easy',
            'Practice SQL',
            '/sql-sandbox',
            30
          );
        }
        break;

      case 'project_builder':
        if ((progressLogs.projectCount || 0) > 0) {
          addRec(
            'project_docs',
            'Improve one project README',
            'A real project exists in your tracker. Tighten documentation before interviews.',
            'projects',
            'high',
            25,
            'easy',
            'Edit Projects',
            '/projects',
            40
          );
          addRec(
            'project_update',
            'Log one project improvement',
            'Keep your project tracker current with real progress only.',
            'projects',
            'medium',
            40,
            'medium',
            'Open Projects',
            '/projects',
            50
          );
        }
        break;

      case 'resume_polish':
        if (progressLogs.resumeScore < 75) {
          addRec(
            'resume_ats',
            'Fix missing keywords in ATS Profile',
            'ATS score is below 75%. Adding role-specific keywords improves recruiter screening.',
            'resume',
            'high',
            20,
            'easy',
            'Polish Resume',
            '/resume-manager',
            35
          );
        }
        break;

      case 'german_practice':
        addRec(
          'german_speaking',
          'Practice German speaking session prompts',
          'Maintain your vocabulary active training streak inside the German academy.',
          'german',
          'high',
          15,
          'easy',
          'Speak German',
          '/german',
          25
        );
        break;

      case 'low_energy':
      case 'no_zero_day':
        addRec(
          'no_zero_day_win',
          'Revise 1 CS Core Topic (DBMS/OS)',
          'Consistency is key. Spend 15 minutes checking revision cards for a fast win.',
          'rest',
          'high',
          15,
          'easy',
          'Quick Revise',
          '/cs-core',
          20
        );
        break;

      default:
        addRec(
          'general_daily',
          'Check Smart Planner Workspace',
          'A plan has not been compiled for today yet.',
          'rest',
          'medium',
          10,
          'easy',
          'Open Planner',
          '/smart-planner',
          20
        );
        break;
    }

    return list;
  }
};
export default adaptiveRecommendationService;
