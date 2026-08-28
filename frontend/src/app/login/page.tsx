'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Zap } from 'lucide-react';
import { api, setAuthToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      setAuthToken(res.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin();
      setAuthToken(res.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-surface-border bg-surface p-8 shadow-2xl">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Compass className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white">PathFinder</span>
        </div>

        <h2 className="text-2xl font-bold text-white">Sign in to your account</h2>
        <p className="text-xs text-gray-400 mt-1">Access your personalized learning roadmap</p>

        {error && (
          <div className="mt-4 rounded-xl bg-accent-rose/10 border border-accent-rose/30 p-3 text-xs text-accent-rose">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@pathfinder.demo"
              className="w-full rounded-xl bg-surface-raised border border-surface-border px-3.5 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="????????"
              className="w-full rounded-xl bg-surface-raised border border-surface-border px-3.5 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-primary-600 py-3 text-xs font-bold text-white hover:bg-primary-500 transition-colors disabled:opacity-40 shadow-lg shadow-primary-500/20"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-surface-border text-center">
          <button
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-accent-cyan/40 bg-accent-cyan/10 py-2.5 text-xs font-bold text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Quick Demo Login (Alex Mercer)
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Do not have an account?{' '}
          <Link href="/onboarding" className="text-primary-400 hover:underline font-semibold">
            Get Started
          </Link>
        </p>
      </div>
    </div>
  );
}
