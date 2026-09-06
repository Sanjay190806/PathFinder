import React from 'react';
import { CloudOff } from 'lucide-react';

export const LocalModeBanner: React.FC = () => (
  <div className="flex items-start gap-3 rounded-xl border border-accentOrange/20 bg-accentOrange/10 p-3 text-xs text-accentOrange">
    <CloudOff className="mt-0.5 h-4 w-4 shrink-0" />
    <p>Local-only mode is active. Your data stays in this browser unless you export a backup or sign in and confirm a cloud migration.</p>
  </div>
);
