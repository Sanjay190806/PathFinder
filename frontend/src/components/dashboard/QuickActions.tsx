import React from "react";
import Link from "next/link";
import { Route, CheckSquare, BarChart3, Sparkles } from "lucide-react";
import { Card } from "@/components/ui";

interface QuickActionsProps {
  onOpenAssistant: () => void;
}

export function QuickActions({ onOpenAssistant }: QuickActionsProps) {
  const actions = [
    {
      label: "Full Roadmap",
      desc: "Skill DAG and sequenced modules",
      href: "/roadmap",
      icon: <Route className="h-4 w-4 text-primary-400" />
    },
    {
      label: "Skill Calibration",
      desc: "Test competencies with diagnostic quiz",
      href: "/assessment",
      icon: <CheckSquare className="h-4 w-4 text-emerald-400" />
    },
    {
      label: "Growth Analytics",
      desc: "Velocity and mastery telemetry",
      href: "/analytics",
      icon: <BarChart3 className="h-4 w-4 text-cyan-400" />
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {actions.map((act) => (
        <Link key={act.href} href={act.href}>
          <Card variant="interactive" className="p-3.5 h-full flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-raised border border-surface-border shrink-0">
              {act.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{act.label}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{act.desc}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
