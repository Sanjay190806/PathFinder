import React, { useState, useMemo } from 'react';
import { useCalendarStore, CalendarEvent, CalendarEventType } from '../../app/store/useCalendarStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { CalendarEventModal } from './CalendarEventModal';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';

type CalendarViewMode = 'day' | 'week' | 'month' | 'agenda';

export const CalendarOS: React.FC = () => {
  const { events, updateEvent } = useCalendarStore();
  const careerState = useCareerStore((s) => s);

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  // 1. Recurrence expansion logic
  const expandedEvents = useMemo(() => {
    // Generate dates range based on view
    const startRange = new Date(currentDate);
    const endRange = new Date(currentDate);

    if (viewMode === 'month') {
      startRange.setDate(1);
      startRange.setHours(0, 0, 0, 0);
      endRange.setMonth(endRange.getMonth() + 1);
      endRange.setDate(0);
      endRange.setHours(23, 59, 59, 999);
    } else if (viewMode === 'week') {
      const day = startRange.getDay();
      startRange.setDate(startRange.getDate() - day);
      startRange.setHours(0, 0, 0, 0);
      endRange.setDate(endRange.getDate() + (6 - day));
      endRange.setHours(23, 59, 59, 999);
    } else {
      startRange.setHours(0, 0, 0, 0);
      endRange.setHours(23, 59, 59, 999);
    }

    const list: CalendarEvent[] = [];

    events.forEach((event) => {
      // Add base event if it starts inside the range, or is non-recurring
      if (!event.isRecurring || !event.recurrence) {
        list.push(event);
        return;
      }

      // Add base instance
      list.push(event);

      const recur = event.recurrence;
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const duration = eventEnd.getTime() - eventStart.getTime();

      let tempStart = new Date(eventStart);
      const endLimit = recur.endDate ? new Date(recur.endDate) : endRange;
      const maxLimit = new Date(Math.min(endLimit.getTime(), endRange.getTime()));

      // Increment tempStart based on frequency and push instances
      let safetyCounter = 0;
      while (safetyCounter < 100) {
        safetyCounter++;

        if (recur.frequency === 'daily') {
          tempStart.setDate(tempStart.getDate() + 1);
        } else if (recur.frequency === 'weekly') {
          tempStart.setDate(tempStart.getDate() + 7);
        } else if (recur.frequency === 'monthly') {
          tempStart.setMonth(tempStart.getMonth() + 1);
        } else {
          break;
        }

        if (tempStart > maxLimit) break;

        const virtualStart = new Date(tempStart);
        const virtualEnd = new Date(tempStart.getTime() + duration);

        list.push({
          ...event,
          id: `${event.id}-recur-${virtualStart.getTime()}`,
          start: virtualStart.toISOString(),
          end: virtualEnd.toISOString(),
          createdFromRecurrence: true,
        });
      }
    });

    // 2. Add overlays from other modules (Spaced Repetition, Applications, Project milestones)
    // A. Revision Items overlay
    try {
      const storedRevisions = localStorage.getItem('sanzz_os_revision_items_v1');
      if (storedRevisions) {
        const items = JSON.parse(storedRevisions);
        items.forEach((item: any) => {
          if (item.status === 'due' || item.status === 'upcoming') {
            list.push({
              id: `revision-overlay-${item.id}`,
              title: `📚 Due Revision: ${item.topic}`,
              type: 'revision',
              start: `${item.dueDate}T08:00:00.000Z`,
              end: `${item.dueDate}T09:00:00.000Z`,
              description: `Spaced repetition item: ${item.reason} (${item.difficulty} difficulty)`,
              color: '#8B5CF6',
              status: 'scheduled',
              relatedId: item.id,
            });
          }
        });
      }
    } catch (e) {
      console.warn('Failed loading revision overlays:', e);
    }

    // B. Applications overlay
    (careerState.applications || []).forEach((app) => {
      if (app.date) {
        let type: CalendarEventType = 'career';
        let color = '#3B82F6';
        let prefix = '💼 Application:';

        if (app.status === 'OA') {
          type = 'oa';
          color = '#EF4444';
          prefix = '📝 OA Date:';
        } else if (app.status === 'Interview') {
          type = 'interview';
          color = '#10B981';
          prefix = '🤝 Interview round:';
        }

        list.push({
          id: `app-overlay-${app.id}`,
          title: `${prefix} ${app.company} (${app.role})`,
          type,
          start: `${app.date}T10:00:00.000Z`,
          end: `${app.date}T11:00:00.000Z`,
          description: `Salary: ${app.salary || 'n/a'}. Check job requirements and mock prep.`,
          color,
          status: 'scheduled',
          relatedId: app.id,
        });
      }
    });

    // C. Projects overlay
    Object.entries(careerState.projects || {}).forEach(([key, project]) => {
      // Create a virtual project documentation day or demo deadline
      const mockMilestoneDate = new Date(careerState.userProfile.startDate);
      mockMilestoneDate.setDate(mockMilestoneDate.getDate() + 15); // e.g. Day 15 milestone
      
      list.push({
        id: `project-overlay-${key}`,
        title: `🚀 Sprint Target: ${project.name}`,
        type: 'milestone',
        start: mockMilestoneDate.toISOString(),
        end: new Date(mockMilestoneDate.getTime() + 60 * 60 * 1000).toISOString(),
        description: `Backend: ${project.progress.backend}%, Frontend: ${project.progress.frontend}%. Bullet check: ${project.description}`,
        color: '#EAB308',
        status: 'scheduled',
      });
    });

    return list;
  }, [events, currentDate, viewMode, careerState]);

  // Date formatting helpers
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('text/plain', eventId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    if (eventId.includes('overlay')) return; // Overlays are read-only on the calendar

    const targetEvent = events.find((evt) => evt.id === eventId);
    if (targetEvent) {
      const origStart = new Date(targetEvent.start);
      const origEnd = new Date(targetEvent.end);
      const duration = origEnd.getTime() - origStart.getTime();

      const newStart = new Date(dateStr);
      newStart.setHours(origStart.getHours(), origStart.getMinutes());
      const newEnd = new Date(newStart.getTime() + duration);

      updateEvent(eventId, {
        start: newStart.toISOString(),
        end: newEnd.toISOString(),
      });
    }
  };

  const handleOpenAddModal = (dateStr: string) => {
    setSelectedEvent(null);
    setSelectedDateStr(dateStr);
    setModalOpen(true);
  };

  const handleOpenEditModal = (event: CalendarEvent) => {
    // If it's a virtual recurring event, edit the parent event instead
    const actualId = event.id.split('-recur-')[0];
    const actualEvent = events.find((e) => e.id === actualId) || event;
    setSelectedEvent(actualEvent);
    setModalOpen(true);
  };

  // Month grid build helper
  const monthDays = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startOffset = start.getDay();
    const totalDays = end.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    return days;
  }, [currentDate]);

  return (
    <div className="flex flex-col gap-4 select-none h-full min-h-0 bg-[#060611] rounded-2xl border border-white/5 p-4">
      {/* Calendar Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-accentBlue" />
          <h2 className="text-sm font-black text-textPrimary uppercase tracking-widest">{monthName}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Nav buttons */}
          <div className="flex bg-white/5 border border-white/5 rounded-xl p-0.5">
            <button onClick={handlePrev} className="p-1.5 rounded-lg text-textSecondary hover:bg-white/5 transition">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={handleNext} className="p-1.5 rounded-lg text-textSecondary hover:bg-white/5 transition">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* View selector buttons */}
          <div className="flex bg-white/5 border border-white/5 rounded-xl p-0.5 text-[9px] font-black uppercase tracking-wider">
            {(['day', 'week', 'month', 'agenda'] as CalendarViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === m ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleOpenAddModal(new Date().toISOString().substring(0, 10))}
            className="flex items-center gap-1 text-white bg-accentBlue hover:bg-accentBlue/90 font-black uppercase tracking-wider text-[9px] px-3.5 py-2 rounded-xl transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Event
          </button>
        </div>
      </div>

      {/* View modes rendering container */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-2">
        {viewMode === 'month' && (
          <div className="flex flex-col h-full gap-2">
            {/* Week header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-black text-textMuted uppercase tracking-widest border-b border-white/5 pb-2">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            
            {/* Days Grid */}
            <div className="grid grid-cols-7 grid-rows-5 gap-1.5 flex-1 min-h-0">
              {monthDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="bg-white/[0.01] rounded-xl border border-white/[0.02]" />;
                const dateStr = day.toISOString().substring(0, 10);
                const dayEvents = expandedEvents.filter((e) => e.start.substring(0, 10) === dateStr);

                return (
                  <div
                    key={dateStr}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dateStr)}
                    onDoubleClick={() => handleOpenAddModal(dateStr)}
                    className="min-h-[75px] bg-black/45 border border-white/5 rounded-2xl p-2 flex flex-col gap-1.5 relative hover:border-white/10 transition group"
                  >
                    <span className="text-[10px] font-black text-textSecondary">{day.getDate()}</span>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin">
                      {dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          draggable={!evt.id.includes('overlay')}
                          onDragStart={(e) => handleDragStart(e, evt.id)}
                          onClick={() => handleOpenEditModal(evt)}
                          className="px-1.5 py-0.5 rounded text-[8px] font-semibold text-white truncate cursor-pointer select-none hover:opacity-85 transition"
                          style={{ backgroundColor: evt.color || '#3B82F6' }}
                          title={evt.title}
                        >
                          {evt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'week' && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-7 text-center text-[10px] font-black text-textMuted uppercase tracking-widest border-b border-white/5 pb-2">
              {Array.from({ length: 7 }).map((_, dIdx) => {
                const date = new Date(currentDate);
                date.setDate(date.getDate() - date.getDay() + dIdx);
                return (
                  <div key={dIdx} className="flex flex-col gap-0.5">
                    <span>{date.toLocaleDateString([], { weekday: 'short' })}</span>
                    <span className="text-[8px] text-textSecondary">{date.getDate()}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, dIdx) => {
                const date = new Date(currentDate);
                date.setDate(date.getDate() - date.getDay() + dIdx);
                const dateStr = date.toISOString().substring(0, 10);
                const dayEvents = expandedEvents.filter((e) => e.start.substring(0, 10) === dateStr);

                return (
                  <div
                    key={dIdx}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dateStr)}
                    className="min-h-[300px] bg-black/45 border border-white/5 rounded-2xl p-2 flex flex-col gap-1.5 hover:border-white/10 transition"
                  >
                    <span className="text-[9px] font-bold text-textMuted">{date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <div className="flex-1 flex flex-col gap-1">
                      {dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => handleOpenEditModal(evt)}
                          className="p-2 rounded-xl text-[9px] font-bold text-white flex flex-col gap-1 cursor-pointer hover:scale-[0.98] transition"
                          style={{ backgroundColor: evt.color || '#3B82F6' }}
                        >
                          <span className="truncate">{evt.title}</span>
                          <span className="text-[8px] opacity-75 font-mono">
                            {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'day' && (
          <div className="flex flex-col gap-3 max-w-lg mx-auto bg-black/45 border border-white/5 rounded-2xl p-4">
            <div className="border-b border-white/5 pb-2">
              <span className="text-[9px] text-textMuted font-bold uppercase tracking-wider">Active Day view</span>
              <h3 className="text-base font-black text-textPrimary">{currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              {expandedEvents
                .filter((e) => e.start.substring(0, 10) === currentDate.toISOString().substring(0, 10))
                .map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => handleOpenEditModal(evt)}
                    className="p-3 rounded-2xl text-[10px] font-bold text-white flex flex-col gap-1.5 cursor-pointer hover:scale-[0.99] transition"
                    style={{ backgroundColor: evt.color || '#3B82F6' }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-wider">{evt.title}</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/25 font-mono text-[8px]">
                        {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {evt.description && <p className="opacity-80 font-normal leading-relaxed">{evt.description}</p>}
                  </div>
                ))}
            </div>
          </div>
        )}

        {viewMode === 'agenda' && (
          <div className="flex flex-col gap-3 max-w-xl mx-auto">
            <h3 className="text-xs font-black text-textSecondary uppercase tracking-widest pl-1">Agenda Timeline</h3>
            <div className="flex flex-col gap-2">
              {expandedEvents
                .sort((a, b) => a.start.localeCompare(b.start))
                .slice(0, 15) // Show next 15 upcoming agenda items
                .map((evt) => {
                  const eventDate = new Date(evt.start);
                  return (
                    <div
                      key={evt.id}
                      onClick={() => handleOpenEditModal(evt)}
                      className="flex items-center justify-between gap-4 p-3 bg-black/45 border border-white/5 rounded-2xl hover:border-white/10 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: evt.color || '#3B82F6' }} />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-black text-textPrimary">{evt.title}</span>
                          <span className="text-[9px] text-textMuted">
                            {eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {evt.status === 'completed' && (
                          <span className="px-1.5 py-0.5 rounded bg-accentEmerald/10 text-accentEmerald text-[8px] font-bold uppercase tracking-wider">
                            Completed
                          </span>
                        )}
                        {evt.createdFromRecurrence && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-textMuted text-[8px] font-bold uppercase tracking-wider">
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Modal overlay */}
      <CalendarEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        selectedDateStr={selectedDateStr}
      />
    </div>
  );
};
export default CalendarOS;
