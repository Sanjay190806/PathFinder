import { usePortfolioStore } from '../app/store/usePortfolioStore';
import { PortfolioReadinessScore } from '../types/portfolio';

export const portfolioService = {
  calculateReadiness(): PortfolioReadinessScore {
    const store = usePortfolioStore.getState();
    const caseStudies = Object.values(store.caseStudies || {});
    const githubRepos = store.githubRepos || [];
    const linkedinDrafts = store.linkedinDrafts || [];
    const profile = store.profile || {};

    // 1. Case Study completeness (out of 3 core projects)
    const validCaseStudies = caseStudies.filter((c) => c.problem && c.myContribution && c.solution);
    const caseStudyScore = Math.min((validCaseStudies.length / 3) * 100, 100);

    // 2. GitHub readiness (mean completion of repo checklists)
    let totalRepoTasks = 0;
    let completedRepoTasks = 0;
    githubRepos.forEach((repo) => {
      const tasks = [
        repo.cleanReadme,
        repo.stackListed,
        repo.setupInstructions,
        repo.screenshots,
        repo.demoLink,
        repo.envExample,
        repo.gitignoreCheck,
        repo.secretSafetyCheck,
      ];
      totalRepoTasks += tasks.length;
      completedRepoTasks += tasks.filter(Boolean).length;
    });
    const githubScore = totalRepoTasks > 0 ? (completedRepoTasks / totalRepoTasks) * 100 : 50;

    // 3. LinkedIn readiness (at least 1 fully formatted draft)
    const linkedinScore = linkedinDrafts.length > 0 ? 100 : 30;

    // 4. Bio completeness (target role and recruiter bio present)
    const profileScore = (profile.targetRole && profile.recruiterBio && profile.linkedinAbout) ? 100 : 40;

    // Weighted overall score
    const overall = Math.round(
      caseStudyScore * 0.3 +
      githubScore * 0.3 +
      linkedinScore * 0.2 +
      profileScore * 0.2
    );

    // Determine band & color
    let band: PortfolioReadinessScore['band'] = 'Improving';
    let color = 'text-accentBlue border-accentBlue/25 bg-accentBlue/5';

    if (overall >= 86) {
      band = 'Strong Portfolio';
      color = 'text-accentEmerald border-accentEmerald/25 bg-accentEmerald/5';
    } else if (overall >= 71) {
      band = 'Recruiter Ready';
      color = 'text-accentBlue border-accentBlue/25 bg-accentBlue/5';
    } else if (overall >= 51) {
      band = 'Improving';
      color = 'text-accentOrange border-accentOrange/25 bg-accentOrange/5';
    } else if (overall >= 26) {
      band = 'Foundation';
      color = 'text-accentYellow border-accentYellow/25 bg-accentYellow/5';
    } else {
      band = 'Not Ready';
      color = 'text-red-400 border-red-400/25 bg-red-400/5';
    }

    return {
      overall,
      projectsCount: caseStudies.length,
      caseStudyCompleteness: Math.round(caseStudyScore),
      githubReadiness: Math.round(githubScore),
      linkedinReadiness: Math.round(linkedinScore),
      band,
      color,
    };
  },
};
export default portfolioService;
