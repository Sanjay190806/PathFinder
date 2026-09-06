import React, { useState } from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { useAuthStore } from '../../app/store/useAuthStore';
import { authService } from '../../services/authService';
import { BackendHealthCard } from '../../components/system/BackendHealthCard';

export const SignupPage: React.FC = () => {
  const { signup, continueLocalOnly, status, error } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setLocalError('Passwords do not match.');
      return;
    }
    setLocalError('');
    await signup({ name, email, password });
    window.history.pushState({}, '', '/onboarding');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleGoogleSignIn = () => {
    authService.initiateGoogleAuth();
  };

  return (
    <AuthLayout title="Create your account" subtitle="Account mode uses authenticated backend APIs and user-owned snapshots. Local data is never uploaded until you confirm.">
      <BackendHealthCard />
      <div className="flex flex-col gap-4">
        <GoogleSignInButton onClick={handleGoogleSignIn} disabled={status === 'authenticating'} />
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-border-subtle"></div>
          <span className="mx-4 text-xs text-textSecondary">or</span>
          <div className="flex-grow border-t border-border-subtle"></div>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="text-xs font-semibold text-textSecondary">Name<input value={name} onChange={(e) => setName(e.target.value)} required className="mt-2 w-full rounded-xl border border-border-subtle bg-black/35 px-3 py-2 text-textPrimary outline-none focus:border-accentBlue" /></label>
          <label className="text-xs font-semibold text-textSecondary">Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-xl border border-border-subtle bg-black/35 px-3 py-2 text-textPrimary outline-none focus:border-accentBlue" /></label>
          <label className="text-xs font-semibold text-textSecondary">Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={10} required className="mt-2 w-full rounded-xl border border-border-subtle bg-black/35 px-3 py-2 text-textPrimary outline-none focus:border-accentBlue" /></label>
          <label className="text-xs font-semibold text-textSecondary">Confirm password<input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" minLength={10} required className="mt-2 w-full rounded-xl border border-border-subtle bg-black/35 px-3 py-2 text-textPrimary outline-none focus:border-accentBlue" /></label>
          {(localError || error) && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">{localError || error}</p>}
          <Button type="submit" disabled={status === 'authenticating'}>Create account with email</Button>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => { window.history.pushState({}, '', '/login'); window.dispatchEvent(new PopStateEvent('popstate')); }}>Login</Button>
            <Button type="button" variant="ghost" onClick={() => { continueLocalOnly(); window.history.pushState({}, '', '/overview'); window.dispatchEvent(new PopStateEvent('popstate')); }}>Continue local only</Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
