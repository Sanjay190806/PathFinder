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
      icon: <Route className="h-5 w-5 text-primary" />,
      bg: "bg-primary/10"
    },
    {
      label: "Skill Calibration",
      desc: "Test competencies with diagnostic quiz",
      href: "/assessment",
      icon: <CheckSquare className="h-5 w-5 text-success" />,
      bg: "bg-success/10"
    },
    {
      label: "Growth Analytics",
      desc: "Velocity and mastery telemetry",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5 text-info" />,
      bg: "bg-info/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map((act) => (
        <Link key={act.href} href={act.href} className="group">
          <Card variant="interactive" className="p-4 h-full flex flex-col gap-3 group-hover:border-primary/50 transition-colors">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${act.bg} shrink-0 transition-transform group-hover:scale-110`}>
              {act.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{act.label}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">{act.desc}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
