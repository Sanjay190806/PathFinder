import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, Target, ChevronDown } from "lucide-react";
import { api, removeAuthToken } from "@/lib/api";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user?: {
    full_name?: string;
    email?: string;
    is_demo?: boolean;
  };
  targetRole?: string;
  className?: string;
}

export function UserMenu({ user, targetRole, className }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      removeAuthToken();
    }
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div ref={menuRef} className={cn("relative inline-block text-left", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-xl p-1.5 text-slate-300 hover:text-white hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-950 text-primary-300 border border-primary-800/60 text-xs font-bold shadow-sm">
          {initials}
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform duration-150", isOpen && "transform rotate-180")} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface border border-surface-border p-2 shadow-2xl z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-2 border-b border-surface-border mb-1">
            <p className="text-xs font-bold text-white truncate">{user?.full_name || "Learner"}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || "learner@pathfinder.io"}</p>
            {targetRole && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-accent-cyan font-medium">
                <Target className="h-3 w-3" />
                <span className="truncate">{targetRole}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            role="menuitem"
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-left"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
