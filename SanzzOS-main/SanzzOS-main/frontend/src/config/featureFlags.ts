type FeatureFlagKey =
  | 'enableAIPlayground'
  | 'enableInterviewCoach'
  | 'enableGermanAcademy'
  | 'enablePortfolioMode'
  | 'enablePWA'
  | 'enableFounderMode'
  | 'enableCloudAccounts';

const readFlag = (key: string, fallback: boolean) => {
  const value = (import.meta as any)?.env?.[key];
  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }
  return fallback;
};

export const featureFlags: Record<FeatureFlagKey, boolean> = {
  enableAIPlayground: readFlag('VITE_ENABLE_AI_PLAYGROUND', true),
  enableInterviewCoach: readFlag('VITE_ENABLE_INTERVIEW_COACH', true),
  enableGermanAcademy: readFlag('VITE_ENABLE_GERMAN_ACADEMY', true),
  enablePortfolioMode: readFlag('VITE_ENABLE_PORTFOLIO_MODE', true),
  enablePWA: readFlag('VITE_ENABLE_PWA', true),
  enableFounderMode: readFlag('VITE_ENABLE_FOUNDER_MODE', true),
  enableCloudAccounts: readFlag('VITE_ENABLE_CLOUD_ACCOUNTS', false),
};

export const isFeatureEnabled = (key: FeatureFlagKey) => featureFlags[key];

