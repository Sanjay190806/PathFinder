import React from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { Badge } from "@/components/ui";

interface CoachMessageProps {
  message: ChatMessage;
  onActionClick?: (actionLabel: string) => void;
}

export function CoachMessage({ message, onActionClick }: CoachMessageProps) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}>
      <div
        className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
          isUser
            ? "bg-primary-600 text-white rounded-br-none shadow-md"
            : "bg-surface-raised border border-surface-border text-slate-200 rounded-bl-none shadow-sm"
        }`}
      >
        <p className="whitespace-pre-line">{message.text}</p>

        {/* Grounding references */}
        {message.grounding_references && message.grounding_references.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-surface-border/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Grounded in Curriculum:
            </span>
            <div className="flex flex-wrap gap-1">
              {message.grounding_references.map((ref, idx) => (
                <span
                  key={idx}
                  className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-accent-cyan border border-surface-border font-mono"
                >
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Action Proposals */}
        {message.suggested_actions && message.suggested_actions.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {message.suggested_actions.map((act, idx) => (
              <button
                key={idx}
                onClick={() => onActionClick && onActionClick(act.label || "")}
                className="flex w-full items-center justify-between rounded-xl bg-primary-950/80 border border-primary-700/60 p-2 text-[11px] font-bold text-primary-200 hover:bg-primary-900 transition-colors text-left"
              >
                <span>{act.label}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
      <span className="text-[10px] text-slate-500 px-1 font-mono">{message.timestamp}</span>
    </div>
  );
}
