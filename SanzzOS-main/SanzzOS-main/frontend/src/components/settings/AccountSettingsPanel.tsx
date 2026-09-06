import React from 'react';
import { UserRound } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../app/store/useAuthStore';

export const AccountSettingsPanel: React.FC = () => {
  const { user, status, logout } = useAuthStore();
  const accountMode = user ? 'Account cloud sync' : 'Local only';

  const getProviderLabel = (provider: string | null | undefined) => {
    if (provider === 'google') return 'Google';
    if (provider === 'email') return 'Email';
    return 'Unknown';
  };

  const getProviderColor = (provider: string | null | undefined) => {
    if (provider === 'google') return 'success';
    if (provider === 'email') return 'neutral';
    return 'neutral';
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-border-subtle/50 pb-3">
        <UserRound className="h-4 w-4 text-accentBlue" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Account</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">{accountMode}</h3>
        </div>
      </div>
      {user ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border-subtle bg-black/35 p-3">
              <p className="text-[10px] font-bold uppercase text-textMuted">Name</p>
              <p className="mt-1 text-sm font-semibold text-textPrimary">{user.name}</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-black/35 p-3">
              <p className="text-[10px] font-bold uppercase text-textMuted">Email</p>
              <p className="mt-1 truncate text-sm font-semibold text-textPrimary">{user.email}</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-black/35 p-3">
              <p className="text-[10px] font-bold uppercase text-textMuted">Provider</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm font-semibold text-textPrimary">{getProviderLabel(user.provider)}</p>
                <Badge variant={getProviderColor(user.provider)}>{user.provider || 'email'}</Badge>
              </div>
            </div>
            <div className="rounded-xl border border-border-subtle bg-black/35 p-3">
              <p className="text-[10px] font-bold uppercase text-textMuted">Last Login</p>
              <p className="mt-1 text-sm font-semibold text-textPrimary">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</p>
            </div>
          </div>
          <Button onClick={() => logout()} variant="outline" size="sm">Logout</Button>
        </>
      ) : (
        <>
          <p className="text-xs leading-5 text-textSecondary">Status: {status}. Sign in to enable protected cloud snapshots and backups.</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => { window.history.pushState({}, '', '/login'); window.dispatchEvent(new PopStateEvent('popstate')); }} size="sm">Login</Button>
            <Button onClick={() => { window.history.pushState({}, '', '/signup'); window.dispatchEvent(new PopStateEvent('popstate')); }} variant="outline" size="sm">Create account</Button>
          </div>
        </>
      )}
    </Card>
  );
};
