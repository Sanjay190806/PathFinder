import React from 'react';
import { usePersonalization } from '../../hooks/usePersonalization';

export const AdaptiveGreeting: React.FC = () => {
  const { profile } = usePersonalization();

  const getGreetingText = () => {
    const hours = new Date().getHours();
    let timeGreeting = 'Lock In';
    if (hours < 12) timeGreeting = 'Good Morning';
    else if (hours < 18) timeGreeting = 'Good Afternoon';
    else timeGreeting = 'Good Evening';

    switch (profile.focusMode) {
      case 'placement_sprint':
        return `${timeGreeting}. Target locks are set for placement preparation.`;
      case 'project_builder':
        return `${timeGreeting}, Builder. Ready to commit codebase improvements?`;
      case 'learning_day':
        return `${timeGreeting}, Scholar. Time to absorb core concepts and solve revision cards.`;
      case 'low_energy':
        return `Take it easy, ${profile.name}. Focus on simple revision checklist items today.`;
      case 'resume_polish':
        return `${timeGreeting}. Let's optimize project bullet points and ATS parameters.`;
      case 'interview_prep':
        return `${timeGreeting}. STAR response templates are loaded and ready.`;
      case 'german_practice':
        return `Hallo ${profile.name}! Bereit für Deutschübungen?`;
      case 'no_zero_day':
        return `Protect the streak! Complete just one 15-minute diagnostic task.`;
      default:
        return `${timeGreeting}, ${profile.name}. Focus controls are primed.`;
    }
  };

  return (
    <div className="flex flex-col gap-1 select-none">
      <h2 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight">
        Welcome back, <span className="text-accentPrimary">{profile.name}</span>
      </h2>
      <p className="text-xs text-textSecondary leading-relaxed">{getGreetingText()}</p>
    </div>
  );
};
export default AdaptiveGreeting;
