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
    label: "Planner",
    href: "/planner",
    iconName: "Calendar",
    description: "Personalized tactical daily and weekly learning schedule"
  },
  {
    label: "Assessment",
    href: "/assessment",
    iconName: "CheckSquare",
    description: "Diagnostic skill calibration & confidence testing"
  },
  {
    label: "Discovery",
    href: "/career-discovery",
    iconName: "Compass",
    description: "Discover fitting career trajectories from your background"
  },
  {
    label: "Resources",
    href: "/resources",
    iconName: "BookOpen",
    description: "Verified learning resources with transparent pricing"
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    iconName: "Briefcase",
    description: "Verified internships, jobs, and student competitions across India"
  },
  {
    label: "Preparation",
    href: "/preparation",
    iconName: "GraduationCap",
    description: "Career preparation intelligence, mock interviews, and ATS resume audit"
  },
  {
    label: "Analytics",
    href: "/analytics",
    iconName: "BarChart3",
    description: "Competency growth and learning velocity"
  }
];
