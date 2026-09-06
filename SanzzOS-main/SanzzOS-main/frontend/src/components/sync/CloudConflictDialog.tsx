import React from 'react';
import { Button } from '../ui/Button';

export const CloudConflictDialog: React.FC<{
  open: boolean;
  onKeepLocal: () => void;
  onKeepCloud: () => void;
  onCancel: () => void;
}> = ({ open, onKeepLocal, onKeepCloud, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-bgSurface p-5">
        <h2 className="text-lg font-semibold text-textPrimary">Resolve cloud conflict</h2>
        <p className="mt-2 text-sm text-textSecondary">Local and cloud data both changed. Choose one source or cancel and export both backups first.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={onKeepLocal}>Keep local</Button>
          <Button onClick={onKeepCloud} variant="outline">Keep cloud</Button>
          <Button onClick={onCancel} variant="ghost">Cancel</Button>
        </div>
      </div>
    </div>
  );
};
