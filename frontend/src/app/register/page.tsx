'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Zap } from 'lucide-react';
import { api, setAuthToken } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.register({ full_name: fullName, email, password });
      setAuthToken(res.access_token);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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

        <h2 className="text-2xl font-bold text-white">Create your account</h2>
        <p className="text-xs text-gray-400 mt-1">Start your AI-powered learning journey</p>

        {error && (
          <div className="mt-4 rounded-xl bg-accent-rose/10 border border-accent-rose/30 p-3 text-xs text-accent-rose">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Full name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              className="w-full rounded-xl bg-surface-raised border border-surface-border px-3.5 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
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
            {isLoading ? 'Creating Account...' : 'Continue to Onboarding'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
