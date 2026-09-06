"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

export type ThemeColor =
  | "default"
  | "pink"
  | "red"
  | "blue"
  | "green"
  | "emerald"
  | "purple"
  | "orange"
  | "yellow"
  | "teal"
  | "indigo"
  | "cyan"
  | "neutral";

export const THEME_COLOR_VARS: Record<
  ThemeColor,
  {
    light: { primary: string; primaryForeground: string; ring: string; accent: string; accentForeground: string };
    dark: { primary: string; primaryForeground: string; ring: string; accent: string; accentForeground: string };
  }
> = {
  default: {
    light: { primary: "262 83% 52%", primaryForeground: "0 0% 100%", ring: "262 83% 52%", accent: "262 100% 97%", accentForeground: "262 83% 40%" },
    dark: { primary: "263 80% 65%", primaryForeground: "0 0% 100%", ring: "263 80% 65%", accent: "263 30% 18%", accentForeground: "263 80% 75%" },
  },
  pink: {
    light: { primary: "346 84% 48%", primaryForeground: "0 0% 100%", ring: "346 84% 48%", accent: "346 100% 97%", accentForeground: "346 84% 36%" },
    dark: { primary: "346 87% 65%", primaryForeground: "0 0% 100%", ring: "346 87% 65%", accent: "346 30% 18%", accentForeground: "346 87% 75%" },
  },
  blue: {
    light: { primary: "221 83% 50%", primaryForeground: "0 0% 100%", ring: "221 83% 50%", accent: "214 100% 97%", accentForeground: "221 83% 40%" },
    dark: { primary: "217 91% 60%", primaryForeground: "0 0% 100%", ring: "217 91% 60%", accent: "217 30% 18%", accentForeground: "217 91% 75%" },
  },
  yellow: {
    light: { primary: "38 92% 40%", primaryForeground: "0 0% 100%", ring: "38 92% 40%", accent: "48 100% 96%", accentForeground: "38 92% 28%" },
    dark: { primary: "48 96% 53%", primaryForeground: "240 10% 4%", ring: "48 96% 53%", accent: "48 30% 18%", accentForeground: "48 96% 75%" },
  },
  green: {
    light: { primary: "142 76% 36%", primaryForeground: "0 0% 100%", ring: "142 76% 36%", accent: "142 70% 96%", accentForeground: "142 76% 26%" },
    dark: { primary: "142 71% 50%", primaryForeground: "0 0% 100%", ring: "142 71% 50%", accent: "142 30% 18%", accentForeground: "142 71% 75%" },
  },
  emerald: {
    light: { primary: "158 76% 36%", primaryForeground: "0 0% 100%", ring: "158 76% 36%", accent: "158 70% 96%", accentForeground: "158 76% 26%" },
    dark: { primary: "158 71% 50%", primaryForeground: "0 0% 100%", ring: "158 71% 50%", accent: "158 30% 18%", accentForeground: "158 71% 75%" },
  },
  purple: {
    light: { primary: "262 83% 52%", primaryForeground: "0 0% 100%", ring: "262 83% 52%", accent: "262 100% 97%", accentForeground: "262 83% 40%" },
    dark: { primary: "263 80% 65%", primaryForeground: "0 0% 100%", ring: "263 80% 65%", accent: "263 30% 18%", accentForeground: "263 80% 75%" },
  },
  orange: {
    light: { primary: "24 95% 44%", primaryForeground: "0 0% 100%", ring: "24 95% 44%", accent: "24 100% 96%", accentForeground: "24 95% 30%" },
    dark: { primary: "20 90% 55%", primaryForeground: "0 0% 100%", ring: "20 90% 55%", accent: "20 30% 18%", accentForeground: "20 90% 75%" },
  },
  red: {
    light: { primary: "0 72% 48%", primaryForeground: "0 0% 100%", ring: "0 72% 48%", accent: "0 100% 97%", accentForeground: "0 72% 36%" },
    dark: { primary: "0 72% 60%", primaryForeground: "0 0% 100%", ring: "0 72% 60%", accent: "0 30% 18%", accentForeground: "0 72% 75%" },
  },
  teal: {
    light: { primary: "173 80% 32%", primaryForeground: "0 0% 100%", ring: "173 80% 32%", accent: "173 80% 96%", accentForeground: "173 80% 22%" },
    dark: { primary: "173 80% 45%", primaryForeground: "0 0% 100%", ring: "173 80% 45%", accent: "173 30% 18%", accentForeground: "173 80% 75%" },
  },
  indigo: {
    light: { primary: "239 84% 57%", primaryForeground: "0 0% 100%", ring: "239 84% 57%", accent: "239 100% 97%", accentForeground: "239 84% 42%" },
    dark: { primary: "239 84% 70%", primaryForeground: "0 0% 100%", ring: "239 84% 70%", accent: "239 30% 18%", accentForeground: "239 84% 75%" },
  },
  cyan: {
    light: { primary: "192 90% 34%", primaryForeground: "0 0% 100%", ring: "192 90% 34%", accent: "192 90% 96%", accentForeground: "192 90% 24%" },
    dark: { primary: "192 80% 54%", primaryForeground: "0 0% 100%", ring: "192 80% 54%", accent: "192 30% 18%", accentForeground: "192 80% 75%" },
  },
  neutral: {
    light: { primary: "240 5.9% 10%", primaryForeground: "0 0% 98%", ring: "240 5.9% 10%", accent: "240 4.8% 95.9%", accentForeground: "240 5.9% 10%" },
    dark: { primary: "0 0% 98%", primaryForeground: "240 5.9% 10%", ring: "240 4.9% 83.9%", accent: "240 3.7% 15.9%", accentForeground: "0 0% 98%" },
  },
};

interface ThemeColorContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType>({
  themeColor: "default",
  setThemeColor: () => null,
});

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>("default");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme-color") as ThemeColor;
    if (stored && stored in THEME_COLOR_VARS) {
      setThemeColorState(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;

    // Safely remove all old theme classes without in-place forEach skipping
    Array.from(html.classList).forEach((cls) => {
      if (cls.startsWith("theme-")) {
        html.classList.remove(cls);
      }
    });

    const activeTheme = (themeColor && themeColor in THEME_COLOR_VARS) ? themeColor : "default";

    // Set class & data attribute
    html.classList.add(`theme-${activeTheme}`);
    html.setAttribute("data-theme-color", activeTheme);
    localStorage.setItem("theme-color", activeTheme);

    // Directly apply CSS variables so theme colors immediately update in both Light and Dark mode
    const isDark = resolvedTheme === "dark" || html.classList.contains("dark");
    const modeVars = isDark
      ? THEME_COLOR_VARS[activeTheme].dark
      : THEME_COLOR_VARS[activeTheme].light;

    html.style.setProperty("--primary", modeVars.primary);
    html.style.setProperty("--primary-foreground", modeVars.primaryForeground);
    html.style.setProperty("--ring", modeVars.ring);
    html.style.setProperty("--accent", modeVars.accent);
    html.style.setProperty("--accent-foreground", modeVars.accentForeground);
  }, [themeColor, mounted, resolvedTheme]);

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor: setThemeColorState }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  return useContext(ThemeColorContext);
}

