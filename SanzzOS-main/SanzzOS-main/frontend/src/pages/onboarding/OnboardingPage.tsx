import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { WelcomeStep } from '../../components/onboarding/WelcomeStep';
import { ModeChoiceStep } from '../../components/onboarding/ModeChoiceStep';
import { CareerProfileStep, OnboardingProfileDraft } from '../../components/onboarding/CareerProfileStep';
import { ImportBackupStep } from '../../components/onboarding/ImportBackupStep';
import { DashboardPreferenceStep } from '../../components/onboarding/DashboardPreferenceStep';
import { FinishStep } from '../../components/onboarding/FinishStep';
import { FirstPlanDraft, FirstPlanStep } from '../../components/onboarding/FirstPlanStep';
import { useAuthStore } from '../../app/store/useAuthStore';
import { authService } from '../../services/authService';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(localStorage.getItem('sanzz_os_account_mode_v1') || 'local_only');
  const [focus, setFocus] = useState('Placement');
  const [profile, setProfile] = useState<OnboardingProfileDraft>({ name: '', degreeYear: '', targetRole: '', focusSkills: '' });
  const [firstPlan, setFirstPlan] = useState<FirstPlanDraft>({
    currentGoal: '',
    targetCompanies: '',
    dailyTime: '',
    dsaLevel: '',
    germanLevel: '',
    preferredRoutine: ''
  });
  const auth = useAuthStore();
  const steps = [
    <WelcomeStep />,
    <ModeChoiceStep mode={mode} onModeChange={setMode} />,
    <CareerProfileStep profile={profile} onChange={setProfile} />,
    <FirstPlanStep plan={firstPlan} onChange={setFirstPlan} />,
    <ImportBackupStep />,
    <DashboardPreferenceStep focus={focus} onChange={setFocus} />,
    <FinishStep />,
  ];

  const finish = async () => {
    localStorage.setItem('sanzz_os_account_mode_v1', mode);
    localStorage.setItem('sanzz_os_onboarding_v1', JSON.stringify({ completed: true, mode, focus, profile, firstPlan, completedAt: new Date().toISOString() }));
    localStorage.setItem('sanzz_os_first_plan_v1', JSON.stringify({
      ...firstPlan,
      generatedPlan: [
        `Daily time: ${firstPlan.dailyTime || 'set a realistic block'}`,
        `DSA focus: ${firstPlan.dsaLevel || 'start with arrays and strings'}`,
        `German focus: ${firstPlan.germanLevel || 'A1 basics and speaking prompts'}`,
        `Companies: ${firstPlan.targetCompanies || 'choose 3 priority companies'}`
      ],
      savedAt: new Date().toISOString()
    }));
    if (auth.isAuthenticated) {
      const user = await authService.updateProfile({ preferredMode: mode as any, onboardingCompleted: true });
      auth.updateUser(user);
    }
    window.history.pushState({}, '', '/overview');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <main className="min-h-screen bg-bgBase px-4 py-8 text-textPrimary">
      <Card className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-textMuted">Step {step + 1} of {steps.length}</p>
          <div className="h-2 w-32 rounded-full bg-white/10"><div className="h-full rounded-full bg-accentBlue" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        </div>
        {steps[step]}
        <div className="flex justify-between gap-3">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</Button>
          {step === steps.length - 1 ? <Button onClick={finish}>Finish</Button> : <Button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>Next</Button>}
        </div>
      </Card>
    </main>
  );
};
