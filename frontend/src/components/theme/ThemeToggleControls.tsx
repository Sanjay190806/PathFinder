"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Palette, Sun, Moon } from "lucide-react";
import { useThemeColor, ThemeColor } from "@/components/providers/theme-color-provider";

const PALETTE_OPTIONS: { name: string; key: ThemeColor; bg: string }[] = [
  { name: "Purple", key: "purple", bg: "bg-purple-500" },
  { name: "Pink", key: "pink", bg: "bg-pink-500" },
  { name: "Blue", key: "blue", bg: "bg-blue-500" },
  { name: "Green", key: "green", bg: "bg-emerald-500" },
  { name: "Orange", key: "orange", bg: "bg-orange-500" },
  { name: "Yellow", key: "yellow", bg: "bg-amber-500" },
  { name: "Teal", key: "teal", bg: "bg-teal-500" },
  { name: "Cyan", key: "cyan", bg: "bg-cyan-500" },
  { name: "Red", key: "red", bg: "bg-rose-500" },
  { name: "Indigo", key: "indigo", bg: "bg-indigo-500" },
  { name: "Default", key: "default", bg: "bg-indigo-600" },
  { name: "Neutral", key: "neutral", bg: "bg-zinc-500" },
];

export function ThemeToggleControls({ className = "" }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const { themeColor, setThemeColor } = useThemeColor();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Theme Color Palette Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsPaletteOpen(!isPaletteOpen)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm hover:bg-muted/80 transition-colors"
          aria-label="Change theme accent color"
          title="Change theme accent color (Pink, Blue, Yellow, etc.)"
        >
          <Palette className="h-3.5 w-3.5 text-primary" />
          <span className="capitalize text-[11px] hidden sm:inline">{themeColor}</span>
        </button>

        {isPaletteOpen && (
          <>
            <div
              className="fixed inset-0 z-50"
              onClick={() => setIsPaletteOpen(false)}
            />
            <div className="absolute right-0 mt-2 z-50 w-56 rounded-xl border-2 border-border bg-card p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-xs font-bold text-foreground mb-2 flex items-center justify-between">
                <span>Theme Accent</span>
                <span className="capitalize text-primary text-[11px] font-bold">{themeColor}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {PALETTE_OPTIONS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      setThemeColor(c.key);
                      setIsPaletteOpen(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                      themeColor === c.key
                        ? "border-primary ring-2 ring-primary/40 bg-primary/10 font-bold"
                        : "border-border/80 hover:bg-muted text-foreground"
                    }`}
                    title={c.name}
                  >
                    <span className={`h-3.5 w-3.5 rounded-full ${c.bg} shrink-0 shadow-sm`} />
                    <span className="text-[10px] font-medium truncate max-w-[42px]">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Light / Dark Mode Toggle */}
      <button
        type="button"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="inline-flex items-center justify-center rounded-lg border border-border/80 bg-card p-1.5 text-xs text-foreground shadow-sm hover:bg-muted/80 transition-colors"
        aria-label="Toggle light or dark theme"
        title={mounted && resolvedTheme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
      >
        {mounted ? (
          resolvedTheme === "dark" ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-slate-700" />
          )
        ) : (
          <div className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
