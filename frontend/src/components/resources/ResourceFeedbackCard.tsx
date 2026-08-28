import React from "react";
import { ThumbsUp, AlertTriangle, FastForward, Slash, Sparkles } from "lucide-react";
import { Card, Button } from "@/components/ui";

interface ResourceFeedbackCardProps {
  onFeedback: (type: string, rating: number) => void;
}

export function ResourceFeedbackCard({ onFeedback }: ResourceFeedbackCardProps) {
  const options = [
    { type: "helpful", rating: 5, label: "Helpful (+Score)", icon: <ThumbsUp className="h-4 w-4 text-emerald-400" />, border: "border-emerald-800/50 bg-emerald-950/20 text-emerald-300" },
    { type: "too_difficult", rating: 2, label: "Too Difficult (Insert Precursor)", icon: <AlertTriangle className="h-4 w-4 text-amber-400" />, border: "border-amber-800/50 bg-amber-950/20 text-amber-300" },
    { type: "too_easy", rating: 4, label: "Too Easy (Fast-Track)", icon: <FastForward className="h-4 w-4 text-cyan-400" />, border: "border-cyan-800/50 bg-cyan-950/20 text-cyan-300" },
    { type: "not_relevant", rating: 1, label: "Not Relevant", icon: <Slash className="h-4 w-4 text-slate-400" />, border: "border-slate-700 bg-surface-raised text-slate-300" }
  ];

  return (
    <Card variant="default" className="p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-cyan" />
          Adaptive Feedback Controls
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Your feedback recalibrates the adaptive engine and tunes subsequent recommendations in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onFeedback(opt.type, opt.rating)}
            className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-bold transition-colors hover:brightness-125 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 text-left ${opt.border}`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
