import React from "react";
import { LayoutDashboard, Route, CheckSquare, BarChart3, Compass } from "lucide-react";

export interface NavItemConfig {
  label: string;
  href: string;
  iconName: string;
  description: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    iconName: "LayoutDashboard",
    description: "Your personalized hub & next recommended step"
  },
  {
    label: "Roadmap",
    href: "/roadmap",
    iconName: "Route",
    description: "Dynamic curriculum and skill dependency graph"
  },
  {
    label: "Assessment",
    href: "/assessment",
    iconName: "CheckSquare",
    description: "Diagnostic skill calibration & confidence testing"
  },
  {
    label: "Analytics",
    href: "/analytics",
    iconName: "BarChart3",
    description: "Competency growth and learning velocity"
  }
];
