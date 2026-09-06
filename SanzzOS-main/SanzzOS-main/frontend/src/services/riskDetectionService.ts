import { useCareerStore } from '../app/store/useCareerStore';
import { portfolioService } from './portfolioService';
import { MentorRiskFlag } from '../types/aiMentor';
import { getStreak } from '../utils/xpUtils';

export const riskDetectionService = {
  detectRisks(): MentorRiskFlag[] {
    const careerState = useCareerStore.getState();
    const portfolioReadiness = portfolioService.calculateReadiness();

    const risks: MentorRiskFlag[] = [];
    const logs = Object.values(careerState.dailyLogs || {});

    // 1. Consistency streak at risk
    const currentStreak = getStreak(careerState);
    if (currentStreak <= 1) {
      risks.push({
        id: 'r-streak',
        title: 'Daily streak preservation risk',
        reason: 'Study streak is at 0 or 1 days, meaning a gap will break streak progression.',
        evidence: `Current streak is ${currentStreak} days.`,
        severity: 'critical',
        recommendation: 'Complete a quick 15-minute No Zero Day rescue item to shield consistency.',
        linkedRoute: '/today',
        minutesToFix: 15,
      });
    }

    // 2. DSA practice ignored
    let recentDSACount = 0;
    logs.slice(-5).forEach((log) => {
      const c = log.counts || {};
      if (c.leetcode || c.skillrack) recentDSACount++;
    });
    if (recentDSACount === 0) {
      risks.push({
        id: 'r-dsa',
        title: 'DSA and LeetCode practices ignored',
        reason: 'No completed DSA problems logged in your checklist for the last 5 days.',
        evidence: '0 LeetCode challenges completed recently.',
        severity: 'moderate',
        recommendation: 'Solve today\'s primary DSA question to warm up.',
        linkedRoute: '/dsa-tracker',
        minutesToFix: 30,
      });
    }

    // 3. SQL practice ignored
    let recentSQLCount = 0;
    logs.slice(-5).forEach((log) => {
      if (log.counts?.sql) recentSQLCount++;
    });
    if (recentSQLCount === 0) {
      risks.push({
        id: 'r-sql',
        title: 'SQL and Database queries ignored',
        reason: 'No queries completed in the SQL module for the last 5 days.',
        evidence: '0 queries solved recently.',
        severity: 'low',
        recommendation: 'Execute 2 SQL joins queries inside the SQL training center.',
        linkedRoute: '/sql',
        minutesToFix: 15,
      });
    }

    // 4. Portfolio not recruiter-ready
    if (portfolioReadiness.overall < 50) {
      risks.push({
        id: 'r-port',
        title: 'Portfolio profile not recruiter-ready',
        reason: 'Portfolio readiness score is below 50% due to missing case studies or repo checks.',
        evidence: `Portfolio score is ${portfolioReadiness.overall}%.`,
        severity: 'moderate',
        recommendation: 'Generate one recruiter summary draft in Portfolio OS.',
        linkedRoute: '/portfolio-os',
        minutesToFix: 20,
      });
    }

    // 5. Overdue backup risk
    const backupKey = localStorage.getItem('sanzz_os_last_backup_v1');
    const lastBackupTime = backupKey ? new Date(backupKey).getTime() : 0;
    const daysSinceBackup = lastBackupTime > 0 ? (Date.now() - lastBackupTime) / (24 * 60 * 60 * 1000) : 10;
    if (daysSinceBackup >= 7) {
      risks.push({
        id: 'r-backup',
        title: 'Local database backup overdue',
        reason: 'Your last workspace export was over 7 days ago. System data is at risk of local cache clearing.',
        evidence: `Last backup was ${Math.round(daysSinceBackup)} days ago.`,
        severity: 'moderate',
        recommendation: 'Click backup database in system settings to export JSON file.',
        linkedRoute: '/settings',
        minutesToFix: 5,
      });
    }

    return risks;
  },
};
export default riskDetectionService;
