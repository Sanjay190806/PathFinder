"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  CheckCircle2,
  Code,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  GraduationCap,
  Target
} from "lucide-react";
import { api, getAuthToken, setAuthToken } from "@/lib/api";
import { Card, Button, Badge, ProgressBar } from "@/components/ui";
import { Skill, Profile } from "@/lib/types";

export default function LearningPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");

  useEffect(() => {
    async function loadSkillsData() {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          await api.demoLogin();
          setAuthToken("cookie");
        }

        const [skillsData, profileData] = await Promise.all([
          api.getSkills().catch(() => []),
          api.getProfile().catch(() => null)
        ]);

        if (Array.isArray(skillsData)) {
          setSkills(skillsData);
        }
        setProfile(profileData);
      } catch (err) {
        console.error("Failed to load skills catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSkillsData();
  }, []);

  const confidenceMap = profile?.skill_confidence_map || {};
  const categories = Array.from(new Set(skills.map((s) => s.category).filter(Boolean)));

  const filteredSkills = skills.filter((sk) => {
    const matchesSearch =
      !searchQuery ||
      sk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sk.description && sk.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sk.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || sk.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesTier =
      selectedTier === "all" || sk.difficulty_tier.toLowerCase() === selectedTier.toLowerCase();

    return matchesSearch && matchesCategory && matchesTier;
  });

  const assessedCount = Object.keys(confidenceMap).length;
  const targetRole = profile?.primary_goal?.target_role || "Software Engineer";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <BookOpen className="h-4 w-4" /> Competency Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight">
            Skills & Competency Matrix
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore verified competencies, confidence calibrations, and prerequisite topologies.
          </p>
        </div>

        {/* Quick CTA to DSA practice */}
        <div className="flex items-center gap-3">
          <Link href="/learning/dsa">
            <Button variant="outline" size="sm" leftIcon={<Code className="h-4 w-4 text-primary" />}>
              DSA Problem Bank
            </Button>
          </Link>
          <Link href="/roadmap">
            <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View Skill DAG
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Catalog Competencies</div>
            <div className="text-xl font-extrabold text-foreground">{skills.length} Skills</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Calibrated Confidence</div>
            <div className="text-xl font-extrabold text-foreground">{assessedCount} Assessed</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Target Destination</div>
            <div className="text-base font-bold text-foreground truncate max-w-[150px]">{targetRole}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-info/10 text-info flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Velocity Score</div>
            <div className="text-xl font-extrabold text-foreground">{profile?.velocity_score || "1.0x"}</div>
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search competencies (e.g. Python, Docker, Distributed Systems)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by Category"
            className="bg-card border border-input text-foreground text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all" className="bg-card text-foreground">All Domains ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-card text-foreground">
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            aria-label="Filter by Difficulty Tier"
            className="bg-card border border-input text-foreground text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all" className="bg-card text-foreground">All Tiers</option>
            <option value="beginner" className="bg-card text-foreground">Beginner</option>
            <option value="intermediate" className="bg-card text-foreground">Intermediate</option>
            <option value="advanced" className="bg-card text-foreground">Advanced</option>
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="h-44 rounded-2xl bg-card border border-border animate-pulse p-6" />
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">No matching competencies found</p>
          <p className="text-xs text-muted-foreground">Try clearing your search query or selecting another category.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkills.map((sk) => {
            const confidence = confidenceMap[sk.slug];
            const hasConfidence = confidence !== undefined;

            return (
              <Card
                key={sk.id || sk.slug}
                className="p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="neutral" size="sm">
                      {sk.category}
                    </Badge>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        sk.difficulty_tier.toLowerCase() === "beginner"
                          ? "bg-success/10 text-success"
                          : sk.difficulty_tier.toLowerCase() === "intermediate"
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {sk.difficulty_tier}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground leading-snug">{sk.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {sk.description || "Foundational and applied technical competencies mapped in the knowledge DAG."}
                    </p>
                  </div>

                  {hasConfidence && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-medium">Confidence Score</span>
                        <span className="font-mono font-bold text-primary">{Math.round(confidence * 100)}%</span>
                      </div>
                      <ProgressBar progress={confidence * 100} size="sm" color="primary" />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border mt-4 flex items-center justify-between gap-2">
                  <Link href={`/courses?skill=${sk.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Find Courses
                    </Button>
                  </Link>
                  <Link href="/assessment" className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Calibrate
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
