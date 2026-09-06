import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { MonthlyCalendar } from '../components/calendar/MonthlyCalendar';
import { FocusHistory } from '../components/calendar/FocusHistory';
import { DayInspector } from '../components/calendar/DayInspector';
import { CalendarOS } from '../components/calendar/CalendarOS';
import { useCareerStore } from '../app/store/useCareerStore';
import { useShaylaAgentStore } from '../app/store/useShaylaAgentStore';
import { getDateForDay, formatDate } from '../utils/dateUtils';
import { buildAgentContext } from '../utils/agentContextUtils';
import { buildSmartNotifications } from '../utils/smartNotificationUtils';
import { SmartNotificationCenter } from '../components/shayla-agent/SmartNotificationCenter';
import { Calendar, Focus } from 'lucide-react';

export const CalendarFocusPage: React.FC = () => {
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const userProfile = useCareerStore((s) => s.userProfile);
  const agentStore = useShaylaAgentStore((s) => s);

  const [activeTab, setActiveTab] = useState<'calendar' | 'focus'>('calendar');
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setInspectorOpen(true);
  };

  const selectedLog = dailyLogs[selectedDay] || null;
  const agentContext = buildAgentContext(useCareerStore.getState(), selectedDay);
  const notifications = buildSmartNotifications(agentContext).filter((notification) => !agentStore.dismissedNotifications.includes(notification.id));
  
  const dateObj = getDateForDay(selectedDay, userProfile.startDate);
  const dateStr = formatDate(dateObj);

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="Calendar & Focus Workspace"
        subtitle="Schedule events, prepare placement milestones, review checklist logs, and perform Pomodoro sprints."
      />

      {/* Workspace toggle tabs */}
      <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 text-xs font-black uppercase tracking-wider self-start select-none">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'calendar' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Calendar OS</span>
        </button>
        <button
          onClick={() => setActiveTab('focus')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'focus' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <Focus className="h-4 w-4" />
          <span>Focus & Check-ins</span>
        </button>
      </div>

      {activeTab === 'calendar' ? (
        <div className="flex-1 h-full min-h-0 animate-fadeIn">
          <CalendarOS />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Left Calendar Grid */}
          <div className="lg:col-span-2">
            <MonthlyCalendar onDayClick={handleDayClick} />
          </div>

          {/* Right Focus modules */}
          <div className="flex flex-col gap-6">
            <FocusHistory />
            <SmartNotificationCenter
              notifications={notifications}
              onDismiss={(notification) => agentStore.dismissNotification(notification.id)}
              title="Calendar nudges"
            />
          </div>
        </div>
      )}

      {/* Day Inspector Modal overlay */}
      <DayInspector
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        day={selectedDay}
        log={selectedLog}
        dateStr={dateStr}
      />
    </div>
  );
};
export default CalendarFocusPage;
