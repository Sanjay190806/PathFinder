"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Terminal, ArrowLeft, CheckCircle2, Circle, ExternalLink, 
  Star, Search, Filter, Code2, Award, Zap
} from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { SanzzOSStore } from "@/lib/sanzzos/sanzzosStore";
import { DSAPatternProblem } from "@/lib/sanzzos/types";

export default function DSATrackerPage() {
  const [problems, setProblems] = useState<DSAPatternProblem[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setProblems(SanzzOSStore.getDSAProblems());
  }, []);

  const handleToggle = (id: string) => {
    const updated = SanzzOSStore.toggleDSAProblem(id);
    setProblems(updated);
  };

  const patterns = ["all", ...Array.from(new Set(problems.map(p => p.pattern)))];

  const filtered = problems.filter(p => {
    const matchesPattern = selectedPattern === "all" || p.pattern === selectedPattern;
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pattern.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPattern && matchesSearch;
  });

  const completedCount = problems.filter(p => p.completed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Link href="/sanzzos" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> SanzzOS Hub
            </Link>
            <span>&bull;</span>
            <span>Algorithmic Problem-Solving</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight flex items-center gap-2">
            <span>🧩 DSA 180-Day Pattern Tracker</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-800 dark:text-blue-300 font-bold border border-blue-500/30">
              {completedCount} / {problems.length} Solved
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Master high-frequency interview patterns across LeetCode, SkillRack, and Zoho recruitment problem sets.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-2xl shadow-xs">
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-medium">Problems Solved</div>
            <div className="text-sm font-bold text-foreground">
              {completedCount} / {problems.length} ({Math.round((completedCount / problems.length) * 100)}%)
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Code2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search problem title or pattern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-input text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <select
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            aria-label="Filter by Pattern"
            className="bg-card border border-input text-foreground text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Patterns</option>
            {patterns.filter(p => p !== "all").map(pat => (
              <option key={pat} value={pat}>{pat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Problem Cards List */}
      <div className="space-y-3">
        {filtered.map((prob) => (
          <Card
            key={prob.id}
            className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150 ${
              prob.completed
                ? "bg-success/5 border-success/30"
                : "bg-card border-border hover:border-blue-500/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggle(prob.id)}
                className="text-foreground hover:scale-110 transition-transform"
              >
                {prob.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-foreground font-mono">
                    Day {prob.dayNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    prob.difficulty === "Easy"
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                      : prob.difficulty === "Medium"
                        ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30"
                  }`}>
                    {prob.difficulty}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-muted text-muted-foreground border border-border">
                    {prob.pattern}
                  </span>
                </div>

                <h3 className={`text-sm font-bold mt-1 ${prob.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {prob.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                +25 XP
              </span>

              <a
                href={prob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline px-3 py-1.5 rounded-lg bg-primary/10"
              >
                <span>Solve on {prob.platform}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="p-12 text-center text-xs text-muted-foreground">
            No problems found for the selected pattern or search criteria.
          </Card>
        )}
      </div>
    </div>
  );
}
