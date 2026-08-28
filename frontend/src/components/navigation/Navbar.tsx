'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Compass, Sparkles, RefreshCw, Menu } from "lucide-react";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { CareerGoalBadge } from "./CareerGoalBadge";
import { Button } from "@/components/ui";

export interface NavbarProps {
  user?: any | null;
  targetRole?: string;
  onResetDemo?: () => void;
  onOpenAssistant?: () => void;
}

export function Navbar({ user, targetRole: explicitTargetRole, onResetDemo, onOpenAssistant }: NavbarProps) {
  const targetRole = explicitTargetRole || user?.primary_goal?.target_role;
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
            aria-label="PathFinder Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-150">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex items-center">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white">PathFinder</span>
            </div>
          </Link>

          {/* Dynamic Target Career Goal Indicator */}
          {user && <CareerGoalBadge targetRole={targetRole} />}
        </div>

        {/* Center: Desktop Navigation */}
        {user && <DesktopNav />}

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Persona Reset Trigger */}
          {user?.is_demo && onResetDemo && (
            <button
              onClick={onResetDemo}
              title="Reset Demo Persona to Version 1"
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-amber-800/40 bg-amber-950/20 px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Demo</span>
            </button>
          )}

          {/* AI Career Coach Trigger */}
          {user && onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="inline-flex items-center gap-1.5 rounded-xl bg-surface-raised border border-primary-500/30 hover:border-primary-500/60 px-3 py-1.5 text-xs font-semibold text-primary-300 hover:text-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              title="Open AI Career Coach"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary-400" />
              <span className="hidden sm:inline">AI Coach</span>
            </button>
          )}

          {/* User Profile Dropdown or Logged-Out CTA */}
          {user ? (
            <UserMenu user={user} targetRole={targetRole} />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-surface-raised transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/onboarding"
                className="rounded-xl bg-primary-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary-500 shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Trigger */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open mobile navigation"
            className="md:hidden rounded-xl p-2 text-slate-300 hover:text-white hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        user={user}
        targetRole={targetRole}
        onResetDemo={onResetDemo}
        onOpenAssistant={onOpenAssistant}
      />
    </header>
  );
}
