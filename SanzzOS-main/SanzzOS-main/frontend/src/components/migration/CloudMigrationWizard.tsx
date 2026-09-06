import React, { useEffect, useState } from 'react';
import { migrationService, MigrationSummary } from '../../services/migrationService';
import { DataComparisonPanel } from './DataComparisonPanel';
import { MigrationOptionCard } from './MigrationOptionCard';
import { MigrationResultPanel } from './MigrationResultPanel';

export const CloudMigrationWizard: React.FC = () => {
  const [summary, setSummary] = useState<MigrationSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setSummary(await migrationService.summarize());
    } catch {
      setSummary(null);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const run = async (action: () => Promise<{ success: boolean; message?: string; error?: string }> | void) => {
    setBusy(true);
    try {
      const result = await action();
      setMessage(result ? result.message || result.error || 'Migration action completed.' : 'Local-only mode selected.');
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <DataComparisonPanel summary={summary} />
      <div className="grid gap-3 md:grid-cols-2">
        <MigrationOptionCard title="Upload local to cloud" detail="Creates a pre-migration local backup, then stores this browser snapshot in your account." disabled={busy} onClick={() => run(migrationService.uploadLocal)} />
        <MigrationOptionCard title="Replace local with cloud" detail="Creates a pre-restore local backup, then restores your account snapshot into this browser." disabled={busy || !summary?.hasCloudData} onClick={() => run(migrationService.replaceLocalWithCloud)} />
        <MigrationOptionCard title="Merge local and cloud" detail="Shows a conflict result. Complex automatic merging is intentionally disabled." disabled={busy} onClick={() => run(migrationService.mergeLocalAndCloud)} />
        <MigrationOptionCard title="Keep local only" detail="Leaves account data untouched and keeps this browser in local-only mode." disabled={busy} onClick={() => run(() => migrationService.keepLocalOnly())} />
      </div>
      <MigrationResultPanel message={message} />
    </div>
  );
};
