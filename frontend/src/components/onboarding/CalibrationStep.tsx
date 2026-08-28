import React, { useState, useEffect } from "react";
import { Brain, Clock } from "lucide-react";
import { AssessmentQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CalibrationStepProps {
  questions: AssessmentQuestion[];
  answers: Record<string, number>;
  onSelectOption: (questionId: string, optionIndex: number) => void;
  targetRole: string;
}

export function CalibrationStep({
  questions,
  answers,
  onSelectOption,
  targetRole
}: CalibrationStepProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Non-scoring pacing timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  const defaultQuestions = [
    {
      id: "q1",
      skill_name: "Core Logic & Syntax",
      question_text: "What is the primary characteristic of an idempotent computational operation?",
      options: [
        "It executes asynchronously in parallel threads",
        "Multiple identical requests produce the same end result as a single request",
        "It encrypts output data with a public key",
        "It automatically retries upon network timeout"
      ]
    },
    {
      id: "q2",
      skill_name: "Graph & Dependency Resolution",
      question_text: "In a Directed Acyclic Graph (DAG), what algorithm determines a valid prerequisite linear execution sequence?",
      options: [
        "Topological Sort (Kahn's algorithm)",
        "Binary Search",
        "Depth-First Tree Balancing",
        "Dijkstra's Shortest Path"
      ]
    },
    {
      id: "q3",
      skill_name: "Engineering Pacing",
      question_text: "How does modular prerequisite decoupling prevent cognitive overload in technical roadmaps?",
      options: [
        "By enforcing that foundational competencies reach passing confidence before dependent specializations unlock",
        "By skipping all beginner modules automatically",
        "By reducing total learning hours to zero",
        "By generating non-deterministic course orders"
      ]
    }
  ];

  const activeQuestions = questions && questions.length > 0 ? questions : defaultQuestions;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-400">
            <Brain className="h-4 w-4" /> Step 5: Diagnostic Calibration
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">
            Quick Baseline Calibration
          </h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-raised px-2.5 py-1 text-xs text-slate-400 font-mono">
          <Clock className="h-3.5 w-3.5 text-primary-400" />
          <span>Elapsed: {formatElapsed(elapsedSeconds)}</span>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Answer these 3 conceptual questions to calibrate baseline confidence for your {targetRole} roadmap. (Visual timer does not affect scoring).
      </p>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        {activeQuestions.map((q, qIdx) => (
          <div key={q.id} className="rounded-2xl border border-surface-border bg-surface-raised/40 p-4.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
              <span>Question {qIdx + 1} of {activeQuestions.length}</span>
              {q.skill_name && <span className="font-mono text-primary-400">{q.skill_name}</span>}
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mb-3.5 leading-relaxed">{q.question_text}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {q.options.map((opt, optIdx) => {
                const isSelected = answers[q.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => onSelectOption(q.id, optIdx)}
                    className={cn(
                      "rounded-xl border p-3 text-xs text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500",
                      isSelected
                        ? "border-primary-500 bg-primary-950/70 text-white font-semibold shadow-sm"
                        : "border-surface-border bg-surface text-slate-300 hover:bg-surface-raised"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
