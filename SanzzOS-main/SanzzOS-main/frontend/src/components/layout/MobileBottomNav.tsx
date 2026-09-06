import React, { useState } from 'react';
import { useUIStore } from '../../app/store/useUIStore';
import { navigateToPath, sectionToPath } from '../../utils/navigation';
import { LayoutDashboard, Target, Map, Settings2, MoreHorizontal, Bot, Languages, BarChart3, FileText, FolderKanban, UserRound, Briefcase, Code2, TrendingUp, CalendarClock, Building2, GitFork, Brain, CalendarCheck, GraduationCap } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeSection, setActiveSection } = useUIStore();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'today', label: 'Today', icon: Target },
    { id: 'smart_planner', label: 'Planner', icon: CalendarCheck },
    { id: 'learning_os', label: 'Learning', icon: GraduationCap }
  ];

  const moreItems = [
    { id: 'german', label: 'German', icon: Languages },
    { id: 'ai_brain', label: 'AI Brain', icon: Brain },
    { id: 'placement_os', label: 'Placement OS', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'ai', label: 'Shayla AI', icon: Bot },
    { id: 'coding_mentor', label: 'Coding', icon: Code2 },
    { id: 'career_intelligence', label: 'Career', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'resume', label: 'Resume', icon: UserRound },
    { id: 'interview_coach', label: 'Interview', icon: Bot },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'placement_calendar', label: 'Placement Calendar', icon: CalendarClock },
    { id: 'companies', label: 'Target Companies', icon: Building2 },
    { id: 'skill_tree', label: 'Skill Tree', icon: GitFork },
    { id: 'settings', label: 'Settings', icon: Settings2 }
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-bgSurface/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center justify-around">
          {primaryItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const path = sectionToPath[item.id];
                if (path) {
                  navigateToPath(path);
                } else {
                  setActiveSection(item.id);
                }
                setMoreOpen(false);
              }}
              className={`flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs transition ${
                activeSection === item.id ? 'text-textPrimary' : 'text-textSecondary'
              }`}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              <item.icon className={`h-5 w-5 ${activeSection === item.id ? 'text-accentBlue' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className="flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs text-textSecondary transition"
            aria-label="More navigation"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 px-4 pb-24 pt-24 backdrop-blur-sm md:hidden" onClick={() => setMoreOpen(false)}>
          <div
            className="mx-auto max-w-md rounded-3xl border border-border-accent/20 bg-bgSurface p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-textPrimary">More sections</h3>
              <button type="button" onClick={() => setMoreOpen(false)} className="text-sm text-textSecondary">Close</button>
            </div>
            <div className="grid gap-2">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const path = sectionToPath[item.id];
                    if (path) {
                      navigateToPath(path);
                    } else {
                      setActiveSection(item.id);
                    }
                    setMoreOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    activeSection === item.id ? 'border-border-accent bg-white/[0.08] text-textPrimary' : 'border-border-subtle bg-white/[0.03] text-textSecondary'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
