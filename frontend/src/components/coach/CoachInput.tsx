import React, { useState } from "react";
import { Send } from "lucide-react";

interface CoachInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function CoachInput({ onSend, isLoading }: CoachInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() && !isLoading) {
        onSend(text);
        setText("");
      }
    }
  };

  return (
    <div className="border-t border-surface-border p-3 bg-surface-raised">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your path, prerequisites, or pace..."
          disabled={isLoading}
          className="flex-1 rounded-xl bg-surface border border-surface-border px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          aria-label="Send inquiry"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-40 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
