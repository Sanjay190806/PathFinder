import React from 'react';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { useAuthStore } from '../../app/store/useAuthStore';

export const UserMenu: React.FC = () => {
  const { user, status, logout } = useAuthStore();

  if (status !== 'authenticated' || !user) {
    return (
      <button
        type="button"
        onClick={() => {
          window.history.pushState({}, '', '/auth');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        className="topbar-chip text-[11px] text-textSecondary"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Local mode</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => logout()}
      className="topbar-chip text-[11px] text-accentEmerald"
      title="Log out"
    >
      <UserRound className="h-3.5 w-3.5" />
      <span className="hidden max-w-[140px] truncate sm:inline">{user.name}</span>
      <LogOut className="h-3.5 w-3.5" />
    </button>
  );
};
