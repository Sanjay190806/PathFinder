import { PersonalizationState, UserPersonalizationProfile } from '../types/personalization';

const STORAGE_KEY = 'sanzz_os_personalization_v1';

const DEFAULT_PROFILE: UserPersonalizationProfile = {
  name: 'Sanju',
  degree: 'B.E. ECE',
  year: '3rd year',
  focusMode: 'placement_sprint',
  energyMode: 'normal',
  careerMode: 'product_analyst',
  targetCompanies: [
    'Zoho',
    'HCLTech',
    'Accenture',
    'Wipro',
    'Cognizant',
    'Capgemini',
    'Infosys',
    'TCS',
    'Fractal Analytics',
    'Tiger Analytics',
    'Quantiphi',
    'Mu Sigma'
  ]
};

export const personalizationService = {
  getProfile(): UserPersonalizationProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PersonalizationState;
        return parsed.profile || DEFAULT_PROFILE;
      }
    } catch (e) {
      console.warn('Failed parsing personalization profile:', e);
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: UserPersonalizationProfile): void {
    try {
      const state: PersonalizationState = {
        profile,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Dispatch a custom event to notify components reactively
      window.dispatchEvent(new Event('personalization_changed'));
    } catch (e) {
      console.error('Failed saving personalization profile:', e);
    }
  }
};
