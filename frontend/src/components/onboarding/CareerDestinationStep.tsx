import React, { useState } from "react";
import { Target, Search, CheckCircle2, Sparkles } from "lucide-react";
import { CareerRole } from "@/lib/types";
import { Input, Skeleton, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";

interface CareerDestinationStepProps {
  careerRoles: CareerRole[];
  selectedRole: string;
  customRole: string;
  onSelectRole: (role: string) => void;
  onChangeCustomRole: (custom: string) => void;
  isLoading: boolean;
}

export function CareerDestinationStep({
  careerRoles,
  selectedRole,
  customRole,
  onSelectRole,
  onChangeCustomRole,
  isLoading
}: CareerDestinationStepProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = careerRoles.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.role.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.domain_category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-cyan">
          <Target className="h-4 w-4" /> Step 1: Destination
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
          What are you building toward?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Pick the career destination you want your personalized roadmap to move you toward.
        </p>
      </div>

      {/* Search Input */}
      {careerRoles.length > 4 && (
        <Input
          placeholder="Search engineering domains (e.g. Cybersecurity, VLSI, AI, Full Stack)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      )}

      {/* Career Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : filteredRoles.length === 0 ? (
        <EmptyState
          icon={<Target className="h-6 w-6 text-slate-400" />}
          title="No matching career found"
          description="You can define a custom career role below or try a different search term."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[52vh] overflow-y-auto pr-1">
          {filteredRoles.map((item) => {
            const isSelected = selectedRole === item.role && !customRole;

            return (
              <button
                key={item.slug || item.role}
                type="button"
                onClick={() => {
                  onSelectRole(item.role);
                  onChangeCustomRole("");
                }}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all duration-150 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  isSelected
                    ? "border-primary-500 bg-primary-950/60 text-white shadow-md shadow-primary-500/10 ring-1 ring-primary-500/50"
                    : "border-surface-border bg-surface-raised/40 text-slate-300 hover:bg-surface-raised hover:border-slate-600"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded-md bg-surface px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-surface-border mb-1.5">
                      {item.domain_category}
                    </span>
                    <h4 className="text-sm font-bold text-white tracking-tight">{item.role}</h4>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary-400 shrink-0 mt-1 animate-in zoom-in duration-150" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Career Definition Option */}
      <div className="pt-4 border-t border-surface-border">
        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
          Or define a Custom Technical Destination
        </label>
        <Input
          placeholder="e.g. Autonomous Robotics Engineer, Embedded Firmware Architect"
          value={customRole}
          onChange={(e) => {
            onChangeCustomRole(e.target.value);
            if (e.target.value) onSelectRole(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
