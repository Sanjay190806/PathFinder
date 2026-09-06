import React from 'react';
import { Card } from '../ui/Card';
import { CloudMigrationWizard } from '../migration/CloudMigrationWizard';

export const MigrationSettingsPanel: React.FC = () => (
  <Card className="flex flex-col gap-4 xl:col-span-2">
    <div className="border-b border-border-subtle/50 pb-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Migration</p>
      <h3 className="mt-1 text-lg font-semibold text-textPrimary">Local to cloud migration</h3>
    </div>
    <CloudMigrationWizard />
  </Card>
);
