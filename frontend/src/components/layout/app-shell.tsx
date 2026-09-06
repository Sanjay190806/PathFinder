"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Compass, LayoutDashboard, Search, Map, BookOpen, Code, 
  Briefcase, LineChart, CheckSquare, Folder, GraduationCap, 
  Settings, LogOut, Menu, X, Sun, Moon, Palette, Calendar,
  Cpu, Bot
} from "lucide-react";
import { useTheme } from "next-themes";
import { useThemeColor } from "@/components/providers/theme-color-provider";
import { api, removeAuthToken } from "@/lib/api";
import { Button, BrandLogo } from "@/components/ui";

const NAVIGATION = [
  { group: "Learn", items: [
    { name: "Roadmap", href: "/roadmap", icon: Map },
    { name: "Skills", href: "/learning", icon: BookOpen },
    { name: "DSA", href: "/learning/dsa", icon: Code },
    { name: "Courses", href: "/courses", icon: GraduationCap },
  ]},
  { group: "Career", items: [
    { name: "Career Explorer", href: "/career-explorer", icon: Search },
    { name: "Companies", href: "/companies", icon: Briefcase },
    { name: "Opportunities", href: "/opportunities", icon: Compass },
  ]},
  { group: "Build", items: [
    { name: "Prep & Projects", href: "/preparation", icon: Folder },
    { name: "Study Planner", href: "/planner", icon: Calendar },
  ]},
  { group: "Track", items: [
    { name: "Assessments", href: "/assessment", icon: CheckSquare },
    { name: "Analytics", href: "/analytics", icon: LineChart },
  ]},
  { group: "SanzzOS", items: [
    { name: "SanzzOS Hub", href: "/sanzzos", icon: Cpu },
    { name: "Shayla AI Mentor", href: "/sanzzos?section=shayla", icon: Bot },
  ]},
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { themeColor, setThemeColor } = useThemeColor();
  const [isThemePaletteOpen, setIsThemePaletteOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    api.getProfile().then(p => setProfile(p)).catch(() => {
      removeAuthToken();
      router.push("/");
    });
  }, [router]);

  const isAssessment = pathname.startsWith("/assessment");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAssessmentFullscreen, setIsAssessmentFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      const fs = typeof document !== "undefined" && !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(fs);
      setIsAssessmentFullscreen(fs || (typeof document !== "undefined" && document.body.classList.contains("assessment-fullscreen")));
    };
    handleFsChange();
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);

    const observer = new MutationObserver(() => {
      handleFsChange();
    });
    if (typeof document !== "undefined") {
      observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      observer.disconnect();
    };
  }, []);

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    removeAuthToken();
    router.push("/");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-1 py-1">
        <BrandLogo size="md" href="/dashboard" />
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none">
        <div className="space-y-1">
          <Link href="/dashboard" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/dashboard" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"}`}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        {NAVIGATION.map((group) => (
          <div key={group.group} className="space-y-2">
            <h4 className="px-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {group.group}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                let isActive = false;
                if (item.href.includes("section=shayla")) {
                  isActive = pathname === "/sanzzos" && (typeof window !== "undefined" && (window.location.search.includes("section=shayla") || window.location.hash.includes("shayla")));
                } else if (item.href === "/sanzzos") {
                  isActive = pathname === "/sanzzos" && !(typeof window !== "undefined" && (window.location.search.includes("section=shayla") || window.location.hash.includes("shayla")));
                } else {
                  isActive = pathname.startsWith(item.href) && item.href !== "/";
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1 pt-4 border-t border-border">
        <Link href="/profile" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/profile" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"}`}>
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );

  const shouldHideChrome = isAssessment && (isFullscreen || isAssessmentFullscreen);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside data-app-sidebar="true" className={`${shouldHideChrome ? "hidden" : "hidden lg:flex"} w-64 flex-col border-r border-border bg-surface`}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative flex w-72 flex-col bg-surface shadow-2xl animate-in slide-in-from-left">
            <button onClick={() => setIsMobileOpen(false)} className="absolute right-4 top-4 rounded-md p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className={`${shouldHideChrome ? "hidden" : "flex"} sticky top-0 z-30 h-16 items-center justify-between border-b border-border bg-surface/50 px-4 backdrop-blur-md lg:px-8`}>
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setIsMobileOpen(true)} className="rounded-md p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>
            <BrandLogo size="sm" showSubtitle={false} href="/dashboard" />
          </div>
          <div className="hidden lg:flex items-center gap-2">
             <h1 className="text-lg font-semibold capitalize">
               {pathname.split("/")[1] || "Dashboard"}
             </h1>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Color Palette Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsThemePaletteOpen(!isThemePaletteOpen)}
                className="rounded-full p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors"
                aria-label="Change theme accent color"
                title="Change theme accent color"
              >
                <Palette className="h-5 w-5" />
              </button>

              {isThemePaletteOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsThemePaletteOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 z-50 w-56 rounded-xl border border-border bg-card p-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="text-xs font-semibold text-foreground mb-2 flex items-center justify-between">
                      <span>Accent Color</span>
                      <span className="capitalize text-muted-foreground text-[11px] font-medium">{themeColor}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: "Default", key: "default", bg: "bg-indigo-600" },
                        { name: "Pink", key: "pink", bg: "bg-pink-500" },
                        { name: "Blue", key: "blue", bg: "bg-blue-500" },
                        { name: "Green", key: "green", bg: "bg-emerald-500" },
                        { name: "Purple", key: "purple", bg: "bg-purple-500" },
                        { name: "Orange", key: "orange", bg: "bg-orange-500" },
                        { name: "Yellow", key: "yellow", bg: "bg-amber-500" },
                        { name: "Teal", key: "teal", bg: "bg-teal-500" },
                        { name: "Cyan", key: "cyan", bg: "bg-cyan-500" },
                        { name: "Red", key: "red", bg: "bg-rose-500" },
                        { name: "Indigo", key: "indigo", bg: "bg-indigo-500" },
                        { name: "Neutral", key: "neutral", bg: "bg-zinc-500" },
                      ].map((c) => (
                        <button
                          key={c.key}
                          onClick={() => {
                            setThemeColor(c.key as any);
                            setIsThemePaletteOpen(false);
                          }}
                          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                            themeColor === c.key
                              ? "border-primary ring-2 ring-primary/30 bg-primary/10"
                              : "border-border hover:bg-muted"
                          }`}
                          title={c.name}
                        >
                          <span className={`h-4 w-4 rounded-full ${c.bg} shrink-0`} />
                          <span className="text-[10px] text-foreground font-medium truncate max-w-[42px]">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-full p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (
                resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
              ) : (
                <div className="h-5 w-5" />
              )}
            </button>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {profile?.full_name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={`flex-1 overflow-y-auto ${shouldHideChrome ? "p-3 sm:p-6" : "p-4 lg:p-8"}`}>
          <div className={`mx-auto ${shouldHideChrome ? "max-w-5xl w-full" : "max-w-6xl"}`}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
