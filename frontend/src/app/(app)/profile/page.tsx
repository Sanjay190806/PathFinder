"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, GraduationCap, Clock, Target, Shield, Palette, Sparkles, Moon, Sun, CheckCircle2 } from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { api, getAuthToken, setAuthToken } from "@/lib/api";
import { Profile } from "@/lib/types";
import { useTheme } from "next-themes";
import { useThemeColor } from "@/components/providers/theme-color-provider";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { themeColor, setThemeColor } = useThemeColor();

  const colorOptions: { name: string; key: any; bg: string }[] = [
    { name: "Default", key: "default", bg: "bg-indigo-600" },
    { name: "Pink", key: "pink", bg: "bg-pink-500" },
    { name: "Red", key: "red", bg: "bg-rose-500" },
    { name: "Blue", key: "blue", bg: "bg-blue-500" },
    { name: "Green", key: "green", bg: "bg-emerald-500" },
    { name: "Purple", key: "purple", bg: "bg-purple-500" },
    { name: "Orange", key: "orange", bg: "bg-orange-500" },
    { name: "Yellow", key: "yellow", bg: "bg-amber-500" },
    { name: "Teal", key: "teal", bg: "bg-teal-500" },
    { name: "Cyan", key: "cyan", bg: "bg-cyan-500" },
    { name: "Indigo", key: "indigo", bg: "bg-indigo-500" },
    { name: "Neutral", key: "neutral", bg: "bg-zinc-500" },
  ];

  useEffect(() => {
    setMounted(true);
    async function fetchProfile() {
      try {
        const token = getAuthToken();
        if (!token) {
          await api.demoLogin();
          setAuthToken("cookie");
        }
        const data = await api.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <User className="h-4 w-4" /> Learner Profile & Settings
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight">
          Account & Preferences
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal details, academic taxonomy baseline, and UI visual appearance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: User Profile Summary */}
        <Card className="p-6 space-y-6 lg:col-span-1">
          <div className="text-center space-y-3">
            <div className="h-20 w-20 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center mx-auto text-2xl font-bold shadow-sm">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{profile?.full_name || "Alex Mercer"}</h3>
              <p className="text-xs text-muted-foreground">{profile?.email || "alex@pathfinder.demo"}</p>
            </div>
            <Badge variant="success" size="sm" className="inline-flex">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Active Student
            </Badge>
          </div>

          <div className="border-t border-border pt-4 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Target Role</span>
              <span className="font-semibold text-foreground">{profile?.primary_goal?.target_role || "AI Engineer"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Weekly Pacing</span>
              <span className="font-semibold text-foreground">{profile?.weekly_hours || 10} hrs/week</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Experience Tier</span>
              <span className="font-semibold text-foreground capitalize">{profile?.experience_level || "Beginner"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Region Framework</span>
              <span className="font-semibold text-foreground">India (JanSahay/SIH)</span>
            </div>
          </div>
        </Card>

        {/* Right Area: Appearance & Taxonomy Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Appearance / Theming Card */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Theme & Visual Palette</h3>
                <p className="text-xs text-muted-foreground">Select your workspace accent and light/dark appearance.</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Display Mode</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      mounted && resolvedTheme === "light"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sun className="h-4 w-4" /> Light Mode
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      mounted && resolvedTheme === "dark"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Moon className="h-4 w-4" /> Dark Mode
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Brand Accent Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setThemeColor(opt.key)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        themeColor === opt.key
                          ? "border-primary ring-2 ring-primary/30 bg-primary/10 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-surface-muted"
                      }`}
                    >
                      <span className={`h-3 w-3 rounded-full ${opt.bg} shrink-0`} />
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Academic Baseline Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Academic Background</h3>
                <p className="text-xs text-muted-foreground">Calibrated using India Education Taxonomy (SIH26101).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
                <div className="text-[11px] text-muted-foreground">Education Stage</div>
                <div className="text-xs font-bold text-foreground mt-0.5 capitalize">
                  {profile?.education_level || "Undergraduate / College"}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
                <div className="text-[11px] text-muted-foreground">Specialization / Stream</div>
                <div className="text-xs font-bold text-foreground mt-0.5">
                  {profile?.field_of_study || "Computer Science Engineering"}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
