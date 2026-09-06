import { useState, useEffect } from 'react';
import { UserPersonalizationProfile } from '../types/personalization';
import { personalizationService } from '../services/personalizationService';

export function usePersonalization() {
  const [profile, setProfileState] = useState<UserPersonalizationProfile>(() => 
    personalizationService.getProfile()
  );

  useEffect(() => {
    const handleChanged = () => {
      setProfileState(personalizationService.getProfile());
    };
    
    window.addEventListener('personalization_changed', handleChanged);
    return () => window.removeEventListener('personalization_changed', handleChanged);
  }, []);

  const updateProfile = (updates: Partial<UserPersonalizationProfile>) => {
    const next = { ...profile, ...updates };
    personalizationService.saveProfile(next);
  };

  return {
    profile,
    updateProfile,
    focusMode: profile.focusMode,
    energyMode: profile.energyMode,
    careerMode: profile.careerMode
  };
}
export default usePersonalization;
