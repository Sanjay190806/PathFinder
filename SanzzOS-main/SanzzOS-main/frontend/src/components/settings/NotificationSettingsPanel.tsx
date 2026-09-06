import React, { useState } from 'react';
import { useNotificationStore } from '../../app/store/useNotificationStore';
import { notificationService } from '../../services/notificationService';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const NotificationSettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useNotificationStore();
  const [success, setSuccess] = useState('');

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setSuccess('Browser notification permissions granted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      alert('Notification permissions denied or not supported by this browser.');
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.01] p-4.5 select-none">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Notification OS</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">Notification Settings</h3>
        </div>
        <Bell className="h-4 w-4 text-accentBlue" />
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-accentEmerald/20 bg-accentEmerald/10 p-3 text-[10px] text-accentEmerald">
          <CheckCircle2 className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Browser permission button */}
      <div className="rounded-xl border border-white/5 bg-black/45 p-3 flex flex-col gap-2">
        <span className="text-[10px] font-bold text-textPrimary uppercase">System Permissions</span>
        <p className="text-[10px] text-textSecondary leading-relaxed">
          Allow Sanju Career OS to trigger native desktop alerts for OAs, interviews, and deadlines.
        </p>
        <Button onClick={handleRequestPermission} size="sm" className="self-start text-[10px] uppercase font-black tracking-wider rounded-lg mt-1">
          Configure Browser Alerts
        </Button>
      </div>

      {/* Notification toggles */}
      <div className="flex flex-col gap-3 mt-1">
        <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Configure Sub-Channels</span>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-black/45 cursor-pointer">
            <span className="text-textSecondary">Study Reminders</span>
            <input
              type="checkbox"
              checked={settings.studyReminders}
              onChange={() => handleToggle('studyReminders')}
              className="rounded bg-black/45 border-white/5 text-accentBlue focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-black/45 cursor-pointer">
            <span className="text-textSecondary">German Reminders</span>
            <input
              type="checkbox"
              checked={settings.germanReminders}
              onChange={() => handleToggle('germanReminders')}
              className="rounded bg-black/45 border-white/5 text-accentBlue focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-black/45 cursor-pointer">
            <span className="text-textSecondary">Interview Rounds</span>
            <input
              type="checkbox"
              checked={settings.interviewReminders}
              onChange={() => handleToggle('interviewReminders')}
              className="rounded bg-black/45 border-white/5 text-accentBlue focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-black/45 cursor-pointer">
            <span className="text-textSecondary">Resume Reviews</span>
            <input
              type="checkbox"
              checked={settings.resumeReminders}
              onChange={() => handleToggle('resumeReminders')}
              className="rounded bg-black/45 border-white/5 text-accentBlue focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-black/45 cursor-pointer">
            <span className="text-textSecondary">Project Milestones</span>
            <input
              type="checkbox"
              checked={settings.projectReminders}
              onChange={() => handleToggle('projectReminders')}
              className="rounded bg-black/45 border-white/5 text-accentBlue focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-black/45 cursor-pointer">
            <span className="text-textSecondary">Revision Alerts</span>
            <input
              type="checkbox"
              checked={settings.revisionReminders}
              onChange={() => handleToggle('revisionReminders')}
              className="rounded bg-black/45 border-white/5 text-accentBlue focus:ring-0"
            />
          </label>
        </div>
      </div>

      {/* Quiet Hours & Frequency */}
      <div className="border-t border-white/5 pt-3 flex flex-col gap-3 mt-1">
        <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Quiet Hours & Quiet Windows</span>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-textSecondary">
            <input
              type="checkbox"
              checked={settings.quietHoursEnabled}
              onChange={() => handleToggle('quietHoursEnabled')}
              className="rounded bg-black/45 border-white/5 text-accentBlue focus:ring-0"
            />
            <span>Enable Quiet Window</span>
          </label>

          {settings.quietHoursEnabled && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={settings.quietHoursStart}
                onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                className="w-12 h-6 text-center rounded border border-white/5 bg-black/45 text-textPrimary font-mono"
              />
              <span className="text-textMuted">to</span>
              <input
                type="text"
                value={settings.quietHoursEnd}
                onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                className="w-12 h-6 text-center rounded border border-white/5 bg-black/45 text-textPrimary font-mono"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-textSecondary">Reminder Frequency</span>
          <select
            value={settings.reminderFrequency}
            onChange={(e: any) => updateSettings({ reminderFrequency: e.target.value })}
            className="h-8 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none focus:border-accentBlue"
          >
            <option value="hourly" className="bg-[#0c0c1e]">Hourly Check-in</option>
            <option value="daily" className="bg-[#0c0c1e]">Daily Summary</option>
            <option value="twice-daily" className="bg-[#0c0c1e]">Morning + Evening</option>
          </select>
        </div>
      </div>
    </div>
  );
};
export default NotificationSettingsPanel;
