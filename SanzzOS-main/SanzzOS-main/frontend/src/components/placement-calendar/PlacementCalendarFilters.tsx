import React from 'react';
import { Search } from 'lucide-react';
import { CalendarFilters } from '../../types/placementCalendar';

interface PlacementCalendarFiltersProps {
  filters: CalendarFilters;
  onChange: (filters: CalendarFilters) => void;
}

export const PlacementCalendarFilters: React.FC<PlacementCalendarFiltersProps> = ({
  filters,
  onChange
}) => {
  const handleSelectPhase = (phase: string) => {
    onChange({ ...filters, phase });
  };

  const handleSelectStatus = (status: string) => {
    onChange({ ...filters, status });
  };

  const handleKeywordChange = (keyword: string) => {
    onChange({ ...filters, keyword });
  };

  const phases = [
    'All Phases',
    'Foundation Lock',
    'Coding Strength',
    'Placement Core',
    'Project + Interview Mode',
    'Company-Specific Prep',
    'Offer Mode'
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'perfect', label: 'Perfect Day' },
    { value: 'minimum', label: 'Minimum Day' },
    { value: 'partial', label: 'Partial Day' },
    { value: 'freeze', label: 'Streak Freeze' },
    { value: 'missed', label: 'Missed Day' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 bg-bgCard border border-border-subtle p-4 rounded-2xl w-full select-none">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          placeholder="Search topic or problem..."
          className="w-full pl-9 pr-4 py-2 bg-bgSurface border border-border-subtle rounded-xl text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accentBlue"
        />
      </div>

      {/* Phase Dropdown */}
      <div className="flex flex-col">
        <select
          value={filters.phase}
          onChange={(e) => handleSelectPhase(e.target.value)}
          className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-xs text-textPrimary focus:outline-none min-w-[150px]"
        >
          {phases.map((p) => (
            <option key={p} value={p === 'All Phases' ? 'all' : p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Status Dropdown */}
      <div className="flex flex-col">
        <select
          value={filters.status}
          onChange={(e) => handleSelectStatus(e.target.value)}
          className="rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-xs text-textPrimary focus:outline-none min-w-[130px]"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
