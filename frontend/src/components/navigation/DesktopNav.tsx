import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Route, CheckSquare, BarChart3 } from "lucide-react";
import { NAV_ITEMS } from "./navConfig";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-3.5 w-3.5" />,
  Route: <Route className="h-3.5 w-3.5" />,
  CheckSquare: <CheckSquare className="h-3.5 w-3.5" />,
  BarChart3: <BarChart3 className="h-3.5 w-3.5" />
};

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main Navigation"
      className="hidden md:flex items-center gap-1 rounded-full bg-surface/90 p-1 border border-surface-border shadow-sm backdrop-blur-sm"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
              isActive
                ? "bg-primary-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
            )}
          >
            <span className="shrink-0">{iconMap[item.iconName]}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
