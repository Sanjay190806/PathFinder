import React, { useState, useEffect } from 'react';
import { X, Trash2, Copy, Save } from 'lucide-react';
import { useCalendarStore, CalendarEvent, CalendarEventType, RecurrenceRule } from '../../app/store/useCalendarStore';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Partial<CalendarEvent> | null; // if modifying or template
  selectedDateStr?: string; // default start date if adding new
}

const EVENT_TYPES: { value: CalendarEventType; label: string }[] = [
  { value: 'study', label: 'Study Session' },
  { value: 'interview', label: 'Interview' },
  { value: 'oa', label: 'Online Assessment' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'milestone', label: 'Project Milestone' },
  { value: 'resume', label: 'Resume Review' },
  { value: 'german', label: 'German Practice' },
  { value: 'revision', label: 'Revision' },
  { value: 'mock', label: 'Mock Interview' },
  { value: 'career', label: 'Career Event' },
  { value: 'reminder', label: 'Personal Reminder' },
];

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedDateStr,
}) => {
  const { addEvent, updateEvent, deleteEvent, duplicateEvent } = useCalendarStore();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEventType>('study');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurFreq, setRecurFreq] = useState<RecurrenceRule['frequency']>('none');
  const [recurEnd, setRecurEnd] = useState('');
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled');

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setType(event.type || 'study');
      setStart(event.start ? event.start.substring(0, 16) : '');
      setEnd(event.end ? event.end.substring(0, 16) : '');
      setDescription(event.description || '');
      setColor(event.color || '#3B82F6');
      setIsRecurring(!!event.isRecurring);
      setRecurFreq(event.recurrence?.frequency || 'none');
      setRecurEnd(event.recurrence?.endDate ? event.recurrence.endDate.substring(0, 10) : '');
      setStatus(event.status || 'scheduled');
    } else {
      setTitle('');
      setType('study');
      
      const defaultStart = selectedDateStr ? `${selectedDateStr}T09:00` : new Date().toISOString().substring(0, 16);
      const defaultEnd = selectedDateStr ? `${selectedDateStr}T10:00` : new Date(Date.now() + 60 * 60 * 1000).toISOString().substring(0, 16);
      
      setStart(defaultStart);
      setEnd(defaultEnd);
      setDescription('');
      setColor('#3B82F6');
      setIsRecurring(false);
      setRecurFreq('none');
      setRecurEnd('');
      setStatus('scheduled');
    }
  }, [event, selectedDateStr, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !start || !end) return;

    const startISO = new Date(start).toISOString();
    const endISO = new Date(end).toISOString();

    const recurrence: RecurrenceRule | undefined = isRecurring
      ? {
          frequency: recurFreq,
          endDate: recurEnd ? new Date(recurEnd).toISOString() : undefined,
        }
      : undefined;

    const eventData = {
      title,
      type,
      start: startISO,
      end: endISO,
      description,
      color,
      isRecurring,
      recurrence,
      status,
    };

    if (event?.id) {
      updateEvent(event.id, eventData);
    } else {
      addEvent(eventData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (event?.id) {
      deleteEvent(event.id);
      onClose();
    }
  };

  const handleDuplicate = () => {
    if (event?.id) {
      duplicateEvent(event.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0c1e] p-6 shadow-2xl animate-scaleIn">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-black text-textPrimary uppercase tracking-widest">
            {event?.id ? 'Edit Calendar Event' : 'Create Calendar Event'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-textMuted hover:bg-white/5 hover:text-textPrimary transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Technical interview with Zoho"
              className="w-full h-9 px-3 rounded-xl border border-white/5 bg-black/45 text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accentBlue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CalendarEventType)}
                className="w-full h-9 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none focus:border-accentBlue"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#0c0c1e]">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-9 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none focus:border-accentBlue"
              >
                <option value="scheduled" className="bg-[#0c0c1e]">Scheduled</option>
                <option value="completed" className="bg-[#0c0c1e]">Completed</option>
                <option value="cancelled" className="bg-[#0c0c1e]">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Start Time</label>
              <input
                type="datetime-local"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full h-9 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none focus:border-accentBlue"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">End Time</label>
              <input
                type="datetime-local"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full h-9 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none focus:border-accentBlue"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-textSecondary select-none">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (e.target.checked && recurFreq === 'none') {
                    setRecurFreq('daily');
                  }
                }}
                className="rounded border-white/5 bg-black/45 text-accentBlue focus:ring-0 cursor-pointer"
              />
              <span>Is Recurring</span>
            </label>

            {isRecurring && (
              <select
                value={recurFreq}
                onChange={(e) => setRecurFreq(e.target.value as any)}
                className="h-7 px-2 rounded-lg border border-white/5 bg-black/45 text-textPrimary focus:outline-none focus:border-accentBlue"
              >
                <option value="daily" className="bg-[#0c0c1e]">Daily</option>
                <option value="weekly" className="bg-[#0c0c1e]">Weekly</option>
                <option value="monthly" className="bg-[#0c0c1e]">Monthly</option>
              </select>
            )}
          </div>

          {isRecurring && (
            <div>
              <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Recurrence End Date</label>
              <input
                type="date"
                value={recurEnd}
                onChange={(e) => setRecurEnd(e.target.value)}
                className="w-full h-9 px-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none focus:border-accentBlue"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Color Palette</label>
            <div className="flex items-center gap-2">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full border transition ${
                    color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Description / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Bring copy of resume, review OOP normal forms, prepare self introduction."
              className="w-full min-h-[60px] px-3 py-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accentBlue resize-none"
            />
          </div>

          <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
            {event?.id ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 font-black uppercase tracking-wider text-[10px] border border-red-500/20 bg-red-500/5 px-3 py-2 rounded-xl transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="flex items-center gap-1 text-accentBlue hover:text-accentBlue/80 font-black uppercase tracking-wider text-[10px] border border-accentBlue/20 bg-accentBlue/5 px-3 py-2 rounded-xl transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
            ) : (
              <div />
            )}

            <button
              type="submit"
              className="flex items-center gap-1.5 text-white bg-accentBlue hover:bg-accentBlue/90 font-black uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-xl transition shadow-glow-blue/20"
            >
              <Save className="h-3.5 w-3.5" />
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CalendarEventModal;
