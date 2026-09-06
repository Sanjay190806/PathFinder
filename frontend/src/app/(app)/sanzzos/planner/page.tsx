"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, ArrowLeft, CheckCircle2, Circle, Clock, 
  Play, Pause, RotateCcw, Zap, Flame, Coffee, BookOpen, Star
} from "lucide-react";
import { Card, Button, Badge, ProgressBar } from "@/components/ui";
import { SanzzOSStore } from "@/lib/sanzzos/sanzzosStore";
import { PlannerMode, PlannerTask } from "@/lib/sanzzos/types";

export default function SmartDailyPlannerPage() {
  const [mode, setMode] = useState<PlannerMode>("normal");
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  
  // Pomodoro timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerType, setTimerType] = useState<"focus" | "break">("focus");

  useEffect(() => {
    const savedMode = SanzzOSStore.getPlannerMode();
    setMode(savedMode);
    setTasks(SanzzOSStore.getPlannerTasks(savedMode));
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerType === "focus") {
        setTimerType("break");
        setTimeLeft(5 * 60);
        SanzzOSStore.addXP(20);
      } else {
        setTimerType("focus");
        setTimeLeft(25 * 60);
      }
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerType]);

  const handleModeChange = (newMode: PlannerMode) => {
    setMode(newMode);
    SanzzOSStore.setPlannerMode(newMode);
    setTasks(SanzzOSStore.getPlannerTasks(newMode));
  };

  const handleToggleTask = (taskId: string) => {
    const updated = SanzzOSStore.toggleTask(mode, taskId);
    setTasks(updated);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const modes: { id: PlannerMode; label: string; icon: any; color: string; desc: string }[] = [
    { id: "sprint", label: "Sprint Mode", icon: Flame, color: "border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10", desc: "High intensity placement sprint (5 tasks, 245 mins)" },
    { id: "normal", label: "Normal Mode", icon: Zap, color: "border-primary/40 text-primary bg-primary/10", desc: "Balanced standard preparation routine (4 tasks, 135 mins)" },
    { id: "low_energy", label: "Low Energy Mode", icon: Coffee, color: "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10", desc: "Gentle maintenance to keep streaks alive (3 tasks, 50 mins)" },
    { id: "revision", label: "Revision Mode", icon: BookOpen, color: "border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10", desc: "Deep recall on mistakes, SQL quizzes, and checkpoints (3 tasks, 95 mins)" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Link href="/sanzzos" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> SanzzOS Hub
            </Link>
            <span>&bull;</span>
            <span>Adaptive Productivity Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight flex items-center gap-2">
            <span>⚡ Smart Daily Planner</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30">
              {progressPct}% Done
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Adaptive daily schedule algorithm adjusting to your daily mental energy and career placement sprint targets.
          </p>
        </div>
      </div>

      {/* Mode Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = mode === m.id;

          return (
            <div
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-150 space-y-2 ${
                isSelected
                  ? `${m.color} border-2 shadow-xs`
                  : "bg-card border-border hover:border-border/80 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5" />
                {isSelected && (
                  <Badge variant="primary" size="sm">Active</Badge>
                )}
              </div>
              <div className="text-sm font-bold text-foreground">
                {m.label}
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                {m.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Workspace: Left Checklist, Right Focus Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Task Checklist */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-6 space-y-6 border-border bg-card">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Today's Action Tasks
                </h3>
                <p className="text-xs text-muted-foreground">
                  Check off items as you complete them to earn +15 XP each.
                </p>
              </div>
              <span className="text-xs font-bold text-foreground">
                {completedCount} / {tasks.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-150 flex items-center justify-between gap-4 ${
                    task.completed
                      ? "bg-success/5 border-success/30 text-muted-foreground line-through"
                      : "bg-surface-muted/50 border-border hover:border-primary/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <div className={`text-xs sm:text-sm font-bold ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-muted uppercase font-semibold">{task.category}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.estimatedMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                    +15 XP
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Integrated Focus Timer (Pomodoro) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-6 text-center space-y-6 border-border bg-card">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {timerType === "focus" ? "Deep Focus Session" : "Short Break"}
              </span>
              <div className="text-4xl font-extrabold font-mono text-foreground tracking-tight">
                {formatTimer(timeLeft)}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant={isTimerRunning ? "secondary" : "primary"}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                leftIcon={isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              >
                {isTimerRunning ? "Pause" : "Start Focus"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimeLeft(timerType === "focus" ? 25 * 60 : 5 * 60);
                }}
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                Reset
              </Button>
            </div>

            <div className="pt-4 border-t border-border space-y-2 text-left text-xs text-muted-foreground">
              <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                <span>Daily Planner XP</span>
                <span className="text-amber-500 font-mono">+{completedCount * 15} XP</span>
              </div>
              <ProgressBar progress={progressPct} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
