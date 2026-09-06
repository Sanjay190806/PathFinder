import React from 'react';
import { ArrowRight, Cloud, HardDrive } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../app/store/useAuthStore';

export const AuthHomePage: React.FC = () => {
  const continueLocalOnly = useAuthStore((s) => s.continueLocalOnly);

  return (
    <AuthLayout title="Choose your storage mode" subtitle="Use Career OS locally, or sign in to enable account-owned PostgreSQL snapshots and cloud backups.">
      <div className="grid gap-4">
        <button type="button" onClick={() => window.history.pushState({}, '', '/signup')} className="rounded-xl border border-border-subtle bg-white/[0.04] p-4 text-left transition hover:border-accentBlue">
          <Cloud className="h-5 w-5 text-accentBlue" />
          <h2 className="mt-3 text-lg font-semibold text-textPrimary">Sign in and sync</h2>
          <p className="mt-1 text-xs leading-5 text-textSecondary">Create an account, then choose when to upload, pull, or merge local data.</p>
        </button>
        <button type="button" onClick={() => { continueLocalOnly(); window.history.pushState({}, '', '/overview'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="rounded-xl border border-border-subtle bg-white/[0.04] p-4 text-left transition hover:border-accentEmerald">
          <HardDrive className="h-5 w-5 text-accentEmerald" />
          <h2 className="mt-3 text-lg font-semibold text-textPrimary">Continue local only</h2>
          <p className="mt-1 text-xs leading-5 text-textSecondary">Keep existing browser storage and manual JSON backup workflows.</p>
        </button>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { window.history.pushState({}, '', '/login'); window.dispatchEvent(new PopStateEvent('popstate')); }} variant="outline">
            Login <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={() => { window.history.pushState({}, '', '/signup'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
            Create account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};
