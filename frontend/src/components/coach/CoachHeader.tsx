import React from "react";
import { Bot, X, Globe, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui";

interface CoachHeaderProps {
  targetRole?: string;
  selectedLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  onClose: () => void;
}

const LANGUAGES = [
  { code: "English", label: "English" },
  { code: "Tamil", label: "தமிழ் (Tamil)" },
  { code: "Hindi", label: "हिन्दी (Hindi)" },
  { code: "Telugu", label: "తెలుగు (Telugu)" },
  { code: "Kannada", label: "ಕನ್ನಡ (Kannada)" },
  { code: "Malayalam", label: "മലയാളം (Malayalam)" },
  { code: "Marathi", label: "मराठी (Marathi)" },
  { code: "Bengali", label: "বাংলা (Bengali)" }
];

export function CoachHeader({ targetRole, selectedLanguage = "English", onLanguageChange, onClose }: CoachHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-surface-border px-4 py-3.5 bg-surface-raised/40">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-accent-purple text-white shadow-md shadow-primary-500/20">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">AI Coach</h3>
            {targetRole && (
              <Badge variant="cyan" size="sm">
                {targetRole}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Grounded
            </span>
            <span className="text-[10px] text-accent-cyan flex items-center gap-0.5 font-medium">
              <Sparkles className="h-3 w-3" />
              Fresh Web Intel
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onLanguageChange && (
          <div className="flex items-center gap-1 bg-surface border border-surface-border rounded-lg px-2 py-1">
            <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-[11px] font-medium text-slate-200 outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-surface text-slate-200">
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={onClose}
          aria-label="Close AI Coach"
          className="rounded-xl p-1.5 text-slate-400 hover:bg-surface-raised hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
