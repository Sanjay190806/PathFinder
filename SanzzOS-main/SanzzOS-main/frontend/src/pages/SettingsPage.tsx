import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CircleCheckBig, RefreshCw, ShieldCheck, WandSparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Badge } from '../components/ui/Badge';
import { useCareerStore } from '../app/store/useCareerStore';
import { useAIStore } from '../app/store/useAIStore';
import { syncService } from '../services/syncService';
import { aiService } from '../services/aiService';
import { ApiError } from '../services/apiClient';
import { exportJSON, restore, clear } from '../utils/storageUtils';
import { useAISettingsStore } from '../app/store/useAISettingsStore';
import { useShaylaAgentStore } from '../app/store/useShaylaAgentStore';
import { runMigrationForStore } from '../app/store/migrations';
import { getMigrationLogs, resetIndividualStore, clearAllLocalData, MigrationRecord } from '../utils/stateMigrationUtils';
import { FounderWorkspacePanel } from '../components/settings/FounderWorkspacePanel';
import { FeatureFlagsPanel } from '../components/settings/FeatureFlagsPanel';
import { FeedbackPanel } from '../components/settings/FeedbackPanel';
import { PersonalizationPanel } from '../components/personalization/PersonalizationPanel';
import { SyncSettingsPanel } from '../components/sync/SyncSettingsPanel';
import { BackupRestorePanel } from '../components/sync/BackupRestorePanel';
import { NotificationSettingsPanel } from '../components/settings/NotificationSettingsPanel';
import { usePerformanceMode } from '../hooks/usePerformanceMode';
import { usePortfolioStore } from '../app/store/usePortfolioStore';
import { useAIMentorStore } from '../app/store/useAIMentorStore';
import { AccountSettingsPanel } from '../components/settings/AccountSettingsPanel';
import { CloudSyncSettingsPanel } from '../components/settings/CloudSyncSettingsPanel';
import { DeviceManagementPanel } from '../components/settings/DeviceManagementPanel';
import { CloudBackupPanel } from '../components/settings/CloudBackupPanel';
import { MigrationSettingsPanel } from '../components/settings/MigrationSettingsPanel';
import { SecuritySettingsPanel } from '../components/settings/SecuritySettingsPanel';
import { BackendHealthCard } from '../components/system/BackendHealthCard';

type HealthStatus = {
  backendOnline: boolean;
  apiStatus: string;
  databaseStatus: string;
  groqStatus: string;
  groqModel: string;
  environment?: string;
  timestamp?: string;
};

type AIStatus = {
  backendOnline: boolean;
  groqConfigured: boolean;
  model: string;
  streamingSupported: boolean;
};

type Notice = {
  text: string;
  type: 'success' | 'error';
};

function friendlyAiMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'missing_groq_api_key' || error.status === 503) {
      return 'Groq API key missing in backend/.env.';
    }
    if (error.code === 'invalid_groq_api_key' || error.status === 401 || error.status === 403) {
      return 'Groq API key invalid or rejected.';
    }
    if (error.code === 'groq_rate_limited' || error.status === 429) {
      return 'Groq quota/rate limit reached. Try again later.';
    }
    return error.message || 'AI test failed.';
  }

  if (error instanceof Error) {
    if (/failed to fetch/i.test(error.message)) {
      return 'Backend offline. Start npm run dev in backend.';
    }
    return error.message;
  }
  return 'AI test failed.';
}

export const SettingsPage: React.FC = () => {
  const { mode: perfMode, updateMode: setPerfMode } = usePerformanceMode();
  const careerState = useCareerStore((s) => s);
  const setCareerState = useCareerStore.setState;
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('Never');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [lastAiStatus, setLastAiStatus] = useState<string>('No test run yet');
  const [lastAiTestTime, setLastAiTestTime] = useState<string>('Never');
  const [aiBusy, setAiBusy] = useState(false);
  const agentSettings = useShaylaAgentStore((s) => s);
  
  const [migrationLogs, setMigrationLogs] = useState<MigrationRecord[]>([]);

  useEffect(() => {
    setMigrationLogs(getMigrationLogs());
  }, []);

  const handleRepairState = () => {
    try {
      const keys = [
        'sanju-career-os-persist',
        'sanju-ai-settings-persist-v3',
        'sanju-shayla-agent-persist-v1',
        'sanju-career-os-ui-state'
      ];
      keys.forEach((key) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          const state = parsed.state || parsed;
          const repaired = runMigrationForStore(key, state, 141);
          parsed.state = repaired;
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      });
      setMigrationLogs(getMigrationLogs());
      setNotice({ text: 'All local stores verified and schema properties repaired successfully! Reloading...', type: 'success' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      setNotice({ text: `Repair failed: ${e.message}`, type: 'error' });
    }
  };

  const handleResetStore = (storeName: string) => {
    if (window.confirm(`Are you sure you want to reset the store "${storeName}"? This will back up the old state in localStorage.`)) {
      resetIndividualStore(storeName);
      setNotice({ text: `Store "${storeName}" has been reset. Refreshing page...`, type: 'success' });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleClearAllData = () => {
    const confirmText = window.prompt("WARNING: This will clear ALL local stores. Type 'DESTROY ALL DATA' to confirm:");
    if (confirmText === 'DESTROY ALL DATA') {
      clearAllLocalData();
      setNotice({ text: 'All data cleared. Reloading...', type: 'success' });
      setTimeout(() => window.location.reload(), 1500);
    } else if (confirmText !== null) {
      setNotice({ text: 'Confirmation text incorrect. Reset aborted.', type: 'error' });
    }
  };

  const summaryCards = useMemo(() => ([
    {
      label: 'Backend',
      value: health?.backendOnline ? 'Online' : 'Offline',
      detail: `API: ${health?.apiStatus || 'unknown'}`
    },
    {
      label: 'Database',
      value: health?.databaseStatus || 'unknown',
      detail: 'Prisma-backed persistence'
    },
    {
      label: 'Groq',
      value: aiStatus?.groqConfigured ? 'Configured' : 'Missing',
      detail: 'Backend-only secret'
    },
    {
      label: 'AI Model',
      value: useAISettingsStore.getState().activeModel,
      detail: `Mode: ${useAISettingsStore.getState().activeMode} | Provider: ${useAISettingsStore.getState().activeProvider}`
    },
    {
      label: 'Streaming',
      value: aiStatus?.streamingSupported ? 'Ready' : 'Fallback',
      detail: aiStatus?.streamingSupported ? 'Streaming enabled on backend' : 'Streaming unavailable'
    },
    {
      label: 'AI Status',
      value: lastAiStatus,
      detail: `Last test: ${lastAiTestTime}`
    },
    {
      label: 'App Version',
      value: 'v1.7.2',
      detail: 'Database + auth stability repair'
    },
    {
      label: 'Environment',
      value: health?.environment || 'unknown',
      detail: health?.timestamp || 'Waiting for health check'
    }
  ]), [health, aiStatus, lastAiStatus, lastAiTestTime]);

  const checkHealth = async () => {
    const [backendResult, aiResult] = await Promise.allSettled([
      syncService.getBackendHealth(),
      aiService.getStatus()
    ]);

    if (backendResult.status === 'fulfilled') {
      const payload = backendResult.value;
      setHealth({
        backendOnline: !!payload,
        apiStatus: payload?.api?.status || 'unknown',
        databaseStatus: payload?.database?.status || 'unknown',
        groqStatus: payload?.groq?.status || 'unknown',
        groqModel: payload?.groq?.model || 'llama-3.1-8b-instant',
        environment: payload?.environment,
        timestamp: payload?.timestamp
      });
    } else {
      setHealth({
        backendOnline: false,
        apiStatus: 'offline',
        databaseStatus: 'unavailable',
        groqStatus: 'missing',
        groqModel: 'llama-3.1-8b-instant',
        environment: undefined,
        timestamp: undefined
      });
    }

    if (aiResult.status === 'fulfilled') {
      setAiStatus(aiResult.value);
    } else {
      setAiStatus({
        backendOnline: false,
        groqConfigured: false,
        model: 'llama-3.1-8b-instant',
        streamingSupported: false
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handlePushSync = async () => {
    setSyncLoading(true);
    setNotice(null);
    try {
      const isOnline = await syncService.checkBackendHealth();
      if (!isOnline) {
        throw new Error('Backend service is offline. Start the server first.');
      }

      const res = await syncService.pushSnapshot('local-user', careerState);
      if (res.success) {
        setLastSynced(new Date(res.updatedAt).toLocaleString());
        setNotice({ text: 'Snapshot pushed and backed up to the database successfully.', type: 'success' });
      }
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : 'Failed to push backup to database.', type: 'error' });
    } finally {
      setSyncLoading(false);
    }
  };

  const handlePullSync = async () => {
    setSyncLoading(true);
    setNotice(null);
    try {
      const isOnline = await syncService.checkBackendHealth();
      if (!isOnline) {
        throw new Error('Backend service is offline.');
      }

      const pulledData = await syncService.pullSnapshot('local-user');
      if (!pulledData) {
        throw new Error('No database backups found for this user.');
      }

      setCareerState(pulledData);
      setNotice({ text: 'State pulled and restored from the database successfully.', type: 'success' });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : 'Failed to pull state from database.', type: 'error' });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleExport = () => exportJSON(careerState);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmMsg = `WARNING: Importing the file "${file.name}" will overwrite your current local tracker data.\n\n` +
      `We highly recommend exporting a backup of your current state first.\n\n` +
      `Are you sure you want to proceed and overwrite all local data?`;

    if (!window.confirm(confirmMsg)) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const raw = loadEvent.target?.result as string;
        const restoredState = restore(raw);
        setCareerState(restoredState);
        setNotice({ text: 'State imported from file successfully.', type: 'success' });
      } catch {
        setNotice({ text: 'Failed to import. The file does not match the expected snapshot schema.', type: 'error' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleReset = () => {
    const confirmText = window.prompt("WARNING: This will clear all local tracking data. Type 'RESET SANJU OS' to confirm:");
    if (confirmText === 'RESET SANJU OS') {
      clear();
      window.location.reload();
    } else if (confirmText !== null) {
      setNotice({ text: 'Invalid confirmation text. Reset aborted.', type: 'error' });
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear Shayla AI chat thread history?')) {
      useAIStore.getState().clearChat();
      setNotice({ text: 'AI chat history cleared successfully.', type: 'success' });
    }
  };

  const handleNewChat = () => {
    useAIStore.getState().clearChat();
    setNotice({ text: 'New chat started successfully.', type: 'success' });
  };

  const handleClearBadges = () => {
    if (window.confirm('Are you sure you want to clear all unlocked achievements and XP progress?')) {
      setCareerState({ unlockedBadges: {}, xp: 0, level: 1 } as any);
      setNotice({ text: 'Achievements progress reset successfully.', type: 'success' });
    }
  };

  const handleTestShayla = async () => {
    setAiBusy(true);
    setNotice(null);
    try {
      const response = await aiService.sendMessage(
        [{ role: 'user', content: 'Say hello as Shayla and teach one beginner German phrase.' }],
        { userProfile: careerState.userProfile }
      );

      setLastAiStatus(response.reply ? 'Shayla replied successfully.' : 'Shayla returned an empty response.');
      setLastAiTestTime(new Date().toLocaleString());
      setNotice({ text: 'Shayla AI test completed successfully.', type: 'success' });
    } catch (error) {
      const message = friendlyAiMessage(error);
      setLastAiStatus(message);
      setLastAiTestTime(new Date().toLocaleString());
      setNotice({ text: message, type: 'error' });
    } finally {
      setAiBusy(false);
    }
  };

  const handleTestGroq = async () => {
    setAiBusy(true);
    setNotice(null);
    try {
      const result = await aiService.testGroq();
      setLastAiStatus(result.ok ? result.message : result.message);
      setLastAiTestTime(new Date().toLocaleString());
      setNotice({ text: result.message, type: result.ok ? 'success' : 'error' });
    } catch (error) {
      const message = friendlyAiMessage(error);
      setLastAiStatus(message);
      setLastAiTestTime(new Date().toLocaleString());
      setNotice({ text: message, type: 'error' });
    } finally {
      setAiBusy(false);
    }
  };

  const checklist = [
    {
      label: 'Add Groq key in backend',
      done: health?.groqStatus === 'configured',
      detail: health?.groqStatus === 'configured' ? 'Configured in backend/.env' : 'Missing in backend/.env'
    },
    {
      label: 'Start database',
      done: health?.databaseStatus === 'connected' || health?.databaseStatus === 'healthy',
      detail: health?.databaseStatus || 'Not checked yet'
    },
    {
      label: 'Save first day',
      done: Object.keys(careerState.dailyLogs || {}).length > 0,
      detail: 'Track a daily log'
    },
    {
      label: 'Complete first LC',
      done: (careerState.xp || 0) > 0,
      detail: 'Earn XP from progress'
    },
    {
      label: 'Push backup',
      done: lastSynced !== 'Never',
      detail: lastSynced
    },
    {
      label: 'Generate report',
      done: Object.keys(careerState.dailyLogs || {}).length > 0,
      detail: 'Use the Reports page'
    }
  ];

  return (
    <div className="fade-in flex flex-col gap-6 pb-10">
      <SectionHeader
        title="Settings & Cloud Backups"
        subtitle="Manage accounts, local storage, cloud sync, backups, and AI/backend readiness"
      />

      {notice && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs ${
            notice.type === 'success'
              ? 'border-accentEmerald/20 bg-accentEmerald/10 text-accentEmerald'
              : 'border-red-500/20 bg-red-500/10 text-red-400'
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-bold text-current">
            x
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="xl:col-span-2">
          <BackendHealthCard />
        </Card>
        <AccountSettingsPanel />
        <CloudSyncSettingsPanel />
        <DeviceManagementPanel />
        <CloudBackupPanel />
        <MigrationSettingsPanel />
        <SecuritySettingsPanel />

        {/* Personalization, Focus paths and Layout density toggles */}
        <PersonalizationPanel />

        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Backend & AI</p>
              <h3 className="mt-1 text-lg font-semibold text-textPrimary">Status and Shayla test</h3>
            </div>
            <div className={`topbar-chip ${health?.backendOnline ? 'text-accentEmerald' : 'text-accentOrange'}`}>
              {health?.backendOnline ? <CircleCheckBig className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <span>{health?.backendOnline ? 'Backend online' : 'Backend offline'}</span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {summaryCards.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-textPrimary">{item.value}</p>
                <p className="mt-1 text-xs text-textSecondary">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={checkHealth} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Backend
            </Button>
            <Button type="button" onClick={handleTestGroq} size="sm" disabled={aiBusy}>
              <WandSparkles className="mr-2 h-4 w-4" />
              Test Groq
            </Button>
            <Button type="button" onClick={handleTestShayla} size="sm" variant="outline" disabled={aiBusy}>
              <WandSparkles className="mr-2 h-4 w-4" />
              Test Shayla
            </Button>
            <Button type="button" onClick={handleClearChat} size="sm" variant="outline">
              Clear AI History
            </Button>
            <Button type="button" onClick={handleNewChat} size="sm" variant="outline">
              New Chat
            </Button>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4 text-xs text-textSecondary">
            <p className="font-semibold text-textPrimary">Test prompt</p>
            <p className="mt-1">Say hello as Shayla and teach one beginner German phrase.</p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4 text-xs text-textSecondary">
            <p className="font-semibold text-textPrimary">Security note</p>
            <p className="mt-1">
              The Groq API key stays in <code className="rounded bg-black/20 px-1 py-0.5">backend/.env</code>. The frontend only reads status and
              friendly errors.
            </p>
            <p className="mt-2">Groq API key must be stored only in backend/.env.</p>
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="border-b border-border-subtle/50 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Manual DB Snapshot</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">Legacy career-state database backup</h3>
            <p className="mt-2 text-xs text-textSecondary">
              These buttons push/pull the core career Zustand state only. For full app backup use Backup &amp; Restore below, or the Account Cloud Sync panels above after login.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Last Sync</p>
              <p className="mt-2 text-sm font-semibold text-textPrimary">{lastSynced}</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Backend Time</p>
              <p className="mt-2 text-sm font-semibold text-textPrimary">{health?.timestamp || 'Unknown'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handlePushSync} disabled={syncLoading || !health?.backendOnline} className="rounded-xl text-xs">
              Push Career Snapshot
            </Button>
            <Button onClick={handlePullSync} disabled={syncLoading || !health?.backendOnline} variant="outline" className="rounded-xl text-xs">
              Pull Career Snapshot
            </Button>
            <Button onClick={handleExport} variant="ghost" className="rounded-xl text-xs">
              Export Legacy Career JSON
            </Button>
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-border-subtle bg-bgSurface/40 px-4 py-2 text-xs font-bold text-textPrimary transition hover:border-border-accent hover:bg-bg-glass-hover">
              Import JSON File
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <div className="border-t border-border-subtle/50 pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-textPrimary">Clear AI Mentor Chat History</span>
                <p className="mt-0.5 text-[10px] text-textMuted">Clears all saved Shayla messages.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleNewChat} variant="outline" className="rounded-xl px-4 py-2 text-xs">
                  New Chat
                </Button>
                <Button onClick={handleClearChat} variant="outline" className="rounded-xl px-4 py-2 text-xs">
                  Clear Chat
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border-subtle/50 pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-textPrimary">Clear Unlocked Badges</span>
                <p className="mt-0.5 text-[10px] text-textMuted">Resets XP levels and milestone logs.</p>
              </div>
              <Button onClick={handleClearBadges} variant="outline" className="rounded-xl px-4 py-2 text-xs">
                Reset Badges
              </Button>
            </div>
          </div>

          <div className="border-t border-border-subtle/50 pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-textPrimary">Reset workspace state</span>
                <p className="mt-0.5 text-[10px] text-textMuted">Clears all local tracking data.</p>
              </div>
              <Button onClick={handleReset} variant="danger" className="rounded-xl px-4 py-2 text-xs">
                Reset State
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <FounderWorkspacePanel />
          <FeatureFlagsPanel />
        </div>

        <Card className="flex flex-col gap-4">
          <div className="border-b border-border-subtle/50 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Shayla Agent Mode</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">Daily briefing and notification controls</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              { label: 'Agent mode', checked: agentSettings.agentModeEnabled, setChecked: agentSettings.setAgentModeEnabled },
              { label: 'Daily briefing', checked: agentSettings.dailyBriefingEnabled, setChecked: agentSettings.setDailyBriefingEnabled },
              { label: 'Evening review', checked: agentSettings.eveningReviewEnabled, setChecked: agentSettings.setEveningReviewEnabled },
              { label: 'Smart notifications', checked: agentSettings.smartNotificationsEnabled, setChecked: agentSettings.setSmartNotificationsEnabled },
              { label: 'Auto briefing on launch', checked: agentSettings.autoGenerateBriefingOnLaunch, setChecked: agentSettings.setAutoGenerateBriefingOnLaunch },
              { label: 'Recovery suggestions', checked: agentSettings.enableRecoverySuggestions, setChecked: (value: boolean) => agentSettings.setAgentSubFeature('enableRecoverySuggestions', value) },
              { label: 'German nudges', checked: agentSettings.enableGermanNudges, setChecked: (value: boolean) => agentSettings.setAgentSubFeature('enableGermanNudges', value) },
              { label: 'CS Core nudges', checked: agentSettings.enableCsCoreNudges, setChecked: (value: boolean) => agentSettings.setAgentSubFeature('enableCsCoreNudges', value) },
              { label: 'Resume nudges', checked: agentSettings.enableResumeNudges, setChecked: (value: boolean) => agentSettings.setAgentSubFeature('enableResumeNudges', value) },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white/[0.04] px-4 py-3 text-xs text-textPrimary">
                <span className="font-semibold">{item.label}</span>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.setChecked(e.target.checked)}
                  className="h-4 w-4 accent-accentBlue"
                />
              </label>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <Button
                key={level}
                type="button"
                variant={agentSettings.notificationSensitivity === level ? 'primary' : 'outline'}
                onClick={() => agentSettings.setNotificationSensitivity(level)}
                className="justify-center capitalize"
              >
                {level} sensitivity
              </Button>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <FeedbackPanel />
        </Card>

        {/* Sync, Backup, and Performance Optimization panels */}
        <SyncSettingsPanel />
        <BackupRestorePanel />
        <NotificationSettingsPanel />

        <Card className="flex flex-col gap-4">
          <div className="border-b border-border-subtle/50 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Performance Optimization</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">Visual Rendering Presets</h3>
          </div>
          <p className="text-xs text-textSecondary leading-normal">
            Configure rendering behaviors. Lightweight mode disables ambient background canvas particles to maximize frame rates on slower devices.
          </p>
          <div className="grid gap-3 grid-cols-3">
            {(['lightweight', 'balanced', 'full'] as const).map((m) => (
              <Button
                key={m}
                type="button"
                variant={perfMode === m ? 'primary' : 'outline'}
                onClick={() => setPerfMode(m)}
                className="justify-center capitalize"
              >
                {m} mode
              </Button>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <div className="flex items-center gap-3 border-b border-border-subtle/50 pb-3">
            <ShieldCheck className="h-4 w-4 text-accentYellow" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Onboarding Checklist</p>
              <h3 className="mt-1 text-lg font-semibold text-textPrimary">Setup steps to verify</h3>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {checklist.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-textPrimary">{item.label}</p>
                  <Badge variant={item.done ? 'success' : 'neutral'}>{item.done ? 'Done' : 'Todo'}</Badge>
                </div>
                <p className="mt-2 text-xs text-textSecondary">{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Portfolio & AI Mentor OS Configuration Panel */}
        <Card className="xl:col-span-2 flex flex-col gap-4">
          <div className="border-b border-border-subtle/50 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Portfolio & AI Mentor Settings</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">Visibility & Coaching Tone Preferences</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4 flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Default Portfolio Visibility</label>
              <select
                value={usePortfolioStore((s) => s.visibility.profileSummary)}
                onChange={(e) => usePortfolioStore.getState().updateVisibility({ profileSummary: e.target.value as any })}
                className="mt-1 w-full rounded-xl border border-border-subtle bg-black/45 px-3 py-2 text-xs font-semibold text-textPrimary focus:outline-none"
              >
                <option value="private">Private (All Hidden)</option>
                <option value="preview">Preview (Summaries Only)</option>
                <option value="public">Public (Full Recruiter Ready)</option>
              </select>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4 flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">AI Coaching Style Tone</label>
              <select
                value={useAIMentorStore((s) => s.profile.coachingTone)}
                onChange={(e) => useAIMentorStore.getState().updateProfile({ coachingTone: e.target.value as any })}
                className="mt-1 w-full rounded-xl border border-border-subtle bg-black/45 px-3 py-2 text-xs font-semibold text-textPrimary focus:outline-none"
              >
                <option value="encouraging">Encouraging (Positive Reinforce)</option>
                <option value="strict">Strict (High Standards Nudges)</option>
                <option value="pragmatic">Pragmatic (Data & KPI Focused)</option>
              </select>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4 flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Nudge Alerts Frequency</label>
              <select
                value={useAIMentorStore((s) => s.profile.nudgeFrequency)}
                onChange={(e) => useAIMentorStore.getState().updateProfile({ nudgeFrequency: e.target.value as any })}
                className="mt-1 w-full rounded-xl border border-border-subtle bg-black/45 px-3 py-2 text-xs font-semibold text-textPrimary focus:outline-none"
              >
                <option value="daily">Daily Briefing Alerts</option>
                <option value="weekly">Weekly Milestones Summaries</option>
                <option value="never">Never (Mute System Nudges)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* System Health & State Versioning Maintenance Panel */}
        <Card className="xl:col-span-2 flex flex-col gap-4">
          <div className="border-b border-border-subtle/50 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">System Health & State Migrations</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">Local Storage Schema & Database Health</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
              <span className="block text-[9px] font-bold text-textMuted uppercase tracking-wider">App Version</span>
              <span className="block text-lg font-black text-textPrimary mt-1">v1.7.2</span>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
              <span className="block text-[9px] font-bold text-textMuted uppercase tracking-wider">Schema State version</span>
              <span className="block text-lg font-black text-accentBlue mt-1">141</span>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
              <span className="block text-[9px] font-bold text-textMuted uppercase tracking-wider">Last Migration</span>
              <span className="block text-xs font-semibold text-accentEmerald mt-2 truncate">
                {migrationLogs.length > 0 ? new Date(migrationLogs[migrationLogs.length - 1].migratedAt).toLocaleString() : 'No migration run'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-2">
            <Button 
              type="button" 
              onClick={handleRepairState}
              className="rounded-xl text-xs bg-accentEmerald text-white hover:bg-accentEmerald/90"
            >
              Repair Local State
            </Button>
            <Button 
              type="button" 
              onClick={() => handleResetStore('sanju-career-os-persist')}
              variant="outline" 
              className="rounded-xl text-xs"
            >
              Reset Career Store
            </Button>
            <Button 
              type="button" 
              onClick={() => handleResetStore('sanju-ai-settings-persist-v3')}
              variant="outline" 
              className="rounded-xl text-xs"
            >
              Reset AI Settings Store
            </Button>
            <Button 
              type="button" 
              onClick={() => handleResetStore('sanju-shayla-agent-persist-v1')}
              variant="outline" 
              className="rounded-xl text-xs"
            >
              Reset Agent Store
            </Button>
            <Button 
              type="button" 
              onClick={handleClearAllData}
              variant="danger" 
              className="rounded-xl text-xs"
            >
              Destroy All Data
            </Button>
          </div>

          {migrationLogs.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Migration History Logs</span>
              <div className="rounded-xl border border-border-subtle bg-black/40 p-3 max-h-[160px] overflow-y-auto font-mono text-[10px] text-textSecondary flex flex-col gap-1.5">
                {migrationLogs.map((log, idx) => (
                  <div key={idx} className="pb-1 border-b border-white/5 last:border-b-0 flex justify-between gap-4">
                    <span>• {log.storeName} (v{log.version}): {log.notes}</span>
                    <span className="text-textMuted shrink-0">{new Date(log.migratedAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
