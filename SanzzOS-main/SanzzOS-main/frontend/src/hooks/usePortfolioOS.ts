import { usePortfolioStore } from '../app/store/usePortfolioStore';
import { portfolioService } from '../services/portfolioService';

export const usePortfolioOS = () => {
  const {
    visibility,
    profile,
    caseStudies,
    githubRepos,
    linkedinDrafts,
    updateVisibility,
    updateProfile,
    saveCaseStudy,
    addGithubRepo,
    updateGithubRepo,
    deleteGithubRepo,
    addLinkedinDraft,
    deleteLinkedinDraft,
  } = usePortfolioStore();

  const readiness = portfolioService.calculateReadiness();

  return {
    visibility,
    profile,
    caseStudies,
    githubRepos,
    linkedinDrafts,
    readiness,
    updateVisibility,
    updateProfile,
    saveCaseStudy,
    addGithubRepo,
    updateGithubRepo,
    deleteGithubRepo,
    addLinkedinDraft,
    deleteLinkedinDraft,
  };
};
export default usePortfolioOS;
