import React from 'react';

export const MigrationResultPanel: React.FC<{ message: string | null }> = ({ message }) => (
  message ? <div className="rounded-xl border border-accentBlue/20 bg-accentBlue/10 p-3 text-xs text-accentBlue">{message}</div> : null
);
