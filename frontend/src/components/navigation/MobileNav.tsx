import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Route,
  CheckSquare,
  BarChart3,
  Sparkles,
  RefreshCw,
  LogOut,
  Target,
  X,
  Compass,
  BookOpen,
  Calendar,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { NAV_ITEMS } from "./navConfig";
import { removeAuthToken } from "@/lib/api";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Route: <Route className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  CheckSquare: <CheckSquare className="h-4 w-4" />,
  Compass: <Compass className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  Resources: <BookOpen className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  GraduationCap: <GraduationCap className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />
};

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  targetRole?: string;
  onResetDemo?: () => void;
  onOpenAssistant?: () => void;
}

export function MobileNav({
  isOpen,
  onClose,
  user,
  targetRole,
  onResetDemo,
  onOpenAssistant
}: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    removeAuthToken();
    onClose();
    router.push("/login");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 md:hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      <div
        className="w-4/5 max-w-sm h-full bg-surface border-l border-surface-border p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">PathFinder</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-surface-raised transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info / Career Target */}
          {user && (
            <div className="mt-4 p-3 rounded-xl bg-surface-raised/60 border border-surface-border">
              <p className="text-xs font-bold text-white truncate">{user.full_name || "Learner"}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email || "learner@pathfinder.io"}</p>
              {targetRole && (
                <div className="mt-2 pt-2 border-t border-slate-700 flex items-center gap-1.5 text-xs text-accent-cyan font-medium">
                  <Target className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{targetRole}</span>
                </div>
              )}
            </div>
          )}

          {/* Nav Items */}
          {user ? (
            <nav className="mt-6 space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors",
                      isActive
                        ? "bg-primary-600 text-white shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-surface-raised"
                    )}
                  >
                    {iconMap[item.iconName]}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="mt-6 space-y-2">
              <Link
                href="/login"
                onClick={onClose}
                className="block w-full text-center rounded-xl bg-surface-raised border border-surface-border py-2.5 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Sign In
              </Link>
              <Link
                href="/onboarding"
                onClick={onClose}
                className="block w-full text-center rounded-xl bg-primary-600 py-2.5 text-xs font-bold text-white hover:bg-primary-500 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {user && (
          <div className="pt-4 border-t border-surface-border space-y-2">
            {onOpenAssistant && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAssistant();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-surface-raised border border-primary-500/30 py-2.5 text-xs font-semibold text-primary-300 hover:bg-primary-950/60 transition-colors"
              >
                <Sparkles className="h-4 w-4 text-primary-400" />
                <span>Open AI Career Coach</span>
              </button>
            )}

            {user.is_demo && onResetDemo && (
              <button
                onClick={() => {
                  onClose();
                  onResetDemo();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-800/40 bg-amber-950/20 py-2 text-xs font-medium text-amber-300 hover:bg-amber-950/40 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Demo Persona</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-surface-border py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
