export type UserFocusMode =
  | 'placement_sprint'
  | 'project_builder'
  | 'learning_day'
  | 'low_energy'
  | 'resume_polish'
  | 'interview_prep'
  | 'german_practice'
  | 'no_zero_day';

export type UserEnergyMode = 'high' | 'normal' | 'low' | 'burnout_risk';

export type UserCareerMode =
  | 'ai_product'
  | 'data_analyst'
  | 'product_analyst'
  | 'business_analyst'
  | 'swe_backup'
  | 'ml_ai_basics';

export interface UserPersonalizationProfile {
  name: string;
  degree: string;
  year: string;
  focusMode: UserFocusMode;
  energyMode: UserEnergyMode;
  careerMode: UserCareerMode;
  targetCompanies: string[];
}

export interface PersonalizationState {
  profile: UserPersonalizationProfile;
  lastUpdated: string;
}
