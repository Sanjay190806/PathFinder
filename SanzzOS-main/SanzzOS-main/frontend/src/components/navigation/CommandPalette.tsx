import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useUIStore } from '../../app/store/useUIStore';
import { useRoadmapStore } from '../../app/store/useRoadmapStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { ROADMAP } from '../../data/roadmap';
import { X, Search } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

type Result =
  | { type: 'section'; label: string; detail: string; section: string }
  | { type: 'roadmap'; label: string; detail: string; query: string }
  | { type: 'project'; label: string; detail: string; section: string }
  | { type: 'command'; label: string; detail: string; command: string; section?: string };

const pages = [
  { label: 'Overview Dashboard', detail: 'Jump to the main dashboard', section: 'overview' },
  { label: 'Today Mission', detail: 'Open the daily execution page', section: 'today' },
  { label: 'Roadmap', detail: 'Browse the 180-day DSA roadmap', section: 'roadmap' },
  { label: 'Shayla AI Mentor', detail: 'Open the AI mentor and German companion', section: 'ai' },
  { label: 'Portfolio Mode', detail: 'Open the recruiter-safe showcase', section: 'portfolio' },
  { label: 'German', detail: 'Open the Duolingo-style German module', section: 'german' },
  { label: 'Coding Mentor', detail: 'Open the Java-first coding mentor', section: 'coding_mentor' },
  { label: 'Career Intelligence', detail: 'Open the placement intelligence dashboard', section: 'career_intelligence' },
  { label: 'Admin Dashboard', detail: 'Open the local dev admin placeholder', section: 'admin' },
  { label: 'Projects', detail: 'Open your project workspace', section: 'projects' },
  { label: 'Interview Coach', detail: 'Open the AI interview practice coach', section: 'interview_coach' },
  { label: 'Reports', detail: 'View progress reports', section: 'reports' },
  { label: 'Settings', detail: 'AI, sync, and backup controls', section: 'settings' },
];

const commands = [
  { label: 'Add task', detail: 'Jump to Today and add/log a task in the daily command center', command: 'add_task', section: 'today' },
  { label: 'Start focus timer', detail: 'Open Today focus timer controls', command: 'start_timer', section: 'today' },
  { label: 'Export backup', detail: 'Download a local JSON backup of tracker storage', command: 'export_backup' },
  { label: 'Ask Shayla', detail: 'Open Shayla AI Mentor', command: 'ask_shayla', section: 'ai' },
  { label: 'Jump to weak areas', detail: 'Open Learning OS weak area and revision panels', command: 'weak_areas', section: 'learning_os' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const setSearchQuery = useRoadmapStore((s) => s.setSearchQuery);
  const projects = useCareerStore((s) => s.projects);

  const results = useMemo<Result[]>(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [
        ...pages.map((page) => ({ type: 'section' as const, label: page.label, detail: page.detail, section: page.section })),
        ...Object.values(projects).slice(0, 2).map((project) => ({
          type: 'project' as const,
          label: project.name,
          detail: project.description,
          section: 'projects'
        })),
        ...commands.map((command) => ({ type: 'command' as const, ...command }))
      ];
    }

    const pageMatches = pages.filter((page) =>
      [page.label, page.detail].some((value) => value.toLowerCase().includes(normalized))
    ).map((page) => ({ type: 'section' as const, label: page.label, detail: page.detail, section: page.section }));

    const projectMatches = Object.values(projects).filter((project) =>
      [project.name, project.description, project.status].some((value) => value.toLowerCase().includes(normalized))
    ).map((project) => ({
      type: 'project' as const,
      label: project.name,
      detail: project.description,
      section: 'projects'
    }));

    const roadmapMatches = Array.from({ length: 180 }, (_, index) => index + 1)
      .flatMap((day) => (ROADMAP[String(day)] || []).map((problem) => ({
        day,
        title: problem.title,
        topic: problem.topic,
        pattern: problem.pattern
      })))
      .filter((problem) =>
        [problem.title, problem.topic, problem.pattern, `day ${problem.day}`].some((value) => value.toLowerCase().includes(normalized))
      )
      .slice(0, 8)
      .map((problem) => ({
        type: 'roadmap' as const,
        label: problem.title,
        detail: `Day ${problem.day} - ${problem.topic} - ${problem.pattern}`,
        query: problem.title
      }));

    const commandMatches = commands.filter((command) =>
      [command.label, command.detail, command.command].some((value) => value.toLowerCase().includes(normalized))
    ).map((command) => ({ type: 'command' as const, ...command }));

    return [...commandMatches, ...pageMatches, ...projectMatches, ...roadmapMatches].slice(0, 10);
  }, [projects, query]);

  if (!open) return null;

  const handleSelect = (result: Result) => {
    if (result.type === 'command') {
      if (result.command === 'export_backup') {
        const snapshot: Record<string, string | null> = {};
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sanzz_os_')) snapshot[key] = localStorage.getItem(key);
        });
        const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), snapshot }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sanzz-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
      if (result.section) setActiveSection(result.section);
    } else if (result.type === 'roadmap') {
      setSearchQuery(result.query);
      setActiveSection('roadmap');
    } else if (result.section === 'portfolio') {
      window.location.pathname = '/portfolio';
      setQuery('');
      onClose();
      return;
    } else {
      setActiveSection(result.section);
      if (result.section === 'roadmap') setSearchQuery('');
    }
    setQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/60 px-2 pt-16 backdrop-blur-sm sm:px-4 sm:pt-24">
      <Card className="w-full max-w-2xl border-border-accent/20 bg-bgSurface/95 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-textPrimary">
            <Search className="h-4 w-4 text-accentBlue" />
            Command Palette
          </div>
          <button type="button" onClick={onClose} className="text-textSecondary hover:text-textPrimary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages, roadmap problems, or projects..."
        />
        <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.label}-${result.detail}`}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full rounded-2xl border border-border-subtle bg-white/[0.03] px-4 py-3 text-left transition hover:border-border-accent hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-textPrimary">{result.label}</div>
                  <div className="mt-1 text-xs text-textSecondary">{result.detail}</div>
                </div>
                <Badge variant={result.type === 'roadmap' ? 'primary' : result.type === 'project' ? 'orange' : 'neutral'}>
                  {result.type}
                </Badge>
              </div>
            </button>
          ))}
          {results.length === 0 && (
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] px-4 py-6 text-center text-sm text-textSecondary">
              No matches found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
