'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, Sparkles, RefreshCw, BarChart2, BookOpen, User, CheckCircle, LogOut } from 'lucide-react';
import { api, removeAuthToken } from '@/lib/api';

interface NavbarProps {
  user?: any;
  onResetDemo?: () => void;
  onOpenAssistant?: () => void;
}

export function Navbar({ user, onResetDemo, onOpenAssistant }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isDemo = user?.is_demo;

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-accent-cyan text-white shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">PathFinder</span>
            <span className="ml-1.5 rounded-md bg-primary-950 px-1.5 py-0.5 text-[10px] font-semibold text-primary-400 border border-primary-800/60">AI</span>
          </div>
        </Link>

        {/* Center Nav */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 rounded-full bg-surface/80 p-1 border border-surface-border">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                pathname === '/dashboard' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <Link
              href="/roadmap"
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                pathname === '/roadmap' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Roadmap
            </Link>
            <Link
              href="/assessment"
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                pathname === '/assessment' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Assessment
            </Link>
            <Link
              href="/analytics"
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                pathname === '/analytics' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Analytics
            </Link>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isDemo && onResetDemo && (
            <button
              onClick={onResetDemo}
              title="Reset Demo Persona back to Version 1"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-accent-amber/40 bg-accent-amber/10 px-2.5 py-1.5 text-xs font-medium text-accent-amber hover:bg-accent-amber/20 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Demo
            </button>
          )}

          {user && onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-accent-purple px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-primary-500/20 hover:brightness-110 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Coach
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2 border-l border-surface-border pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised border border-surface-border text-xs font-semibold text-primary-300">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="text-gray-400 hover:text-accent-rose transition-colors p-1"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-gray-300 hover:text-white px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/onboarding"
                className="rounded-lg bg-primary-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-500 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
