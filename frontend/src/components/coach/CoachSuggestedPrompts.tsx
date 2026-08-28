import React from "react";

interface CoachSuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export function CoachSuggestedPrompts({ onSelectPrompt }: CoachSuggestedPromptsProps) {
  const prompts = [
    "What should I learn next?",
    "Why was this recommended?",
    "What is blocking my progress?",
    "Plan my week based on my available time"
  ];

  return (
    <div className="border-t border-surface-border p-2.5 bg-surface/60 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
      {prompts.map((p, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(p)}
          className="rounded-full bg-surface-raised border border-surface-border px-3 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:border-primary-500 transition-colors shrink-0"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
