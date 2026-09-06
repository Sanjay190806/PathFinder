import React from 'react';
import { Card } from '../ui/Card';
import { ShieldAlert } from 'lucide-react';

export const PortfolioPrivacyWarning: React.FC = () => {
  return (
    <Card className="p-4 border-accentOrange/20 bg-accentOrange/5 text-accentOrange text-xs leading-relaxed select-none">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
        <div>
          <span className="font-black uppercase tracking-wider block">Security & Privacy Guard</span>
          <p className="mt-1 text-textSecondary font-semibold">
            All system logs (including local study streak counts, raw interview mistake histories, personal calendars, and local database keys) are strictly kept offline. 
            <strong> Nothing is published</strong> unless you explicitly toggle visibility configurations to public ready.
          </p>
        </div>
      </div>
    </Card>
  );
};
export default PortfolioPrivacyWarning;
